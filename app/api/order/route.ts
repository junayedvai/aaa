import { NextResponse } from 'next/server';
import { getOrderServerSettings, getResendApiKey } from '@/lib/serverSettings';

const MAX_ATTEMPTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function getClientIp(req: Request) {
  const headerValue = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';
  return headerValue.split(',')[0].trim() || 'unknown';
}

function isSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) {
    return process.env.NODE_ENV !== 'production';
  }

  try {
    return origin === new URL(req.url).origin;
  } catch {
    return false;
  }
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = ATTEMPTS.get(key);

  if (!entry || entry.resetAt <= now) {
    ATTEMPTS.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS_PER_WINDOW;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character] ?? character);
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function normalizeEmail(value: unknown) {
  const email = sanitizeText(value, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function normalizeProduct(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const product = value as Record<string, unknown>;
  const title = sanitizeText(product.title, 160);
  const seller = sanitizeText(product.seller, 120) || 'Unknown seller';
  const delivery = sanitizeText(product.delivery, 80) || 'Within 24 hours';
  const price = typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : null;

  if (!title || price === null) {
    return null;
  }

  return {
    title,
    seller,
    delivery,
    price,
  };
}

export async function POST(req: Request) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
    }

    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ message: 'Too many orders submitted. Please try again later.' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid order payload.' }, { status: 400 });
    }

    const name = sanitizeText((body as Record<string, unknown>).name, 120);
    const email = normalizeEmail((body as Record<string, unknown>).email);
    const phone = sanitizeText((body as Record<string, unknown>).phone, 40);
    const transactionId = sanitizeText((body as Record<string, unknown>).transactionId, 80);
    const note = sanitizeText((body as Record<string, unknown>).note, 1000);
    const paymentMethod = sanitizeText((body as Record<string, unknown>).paymentMethod, 16);
    const product = normalizeProduct((body as Record<string, unknown>).product);

    if (!name || !email || !phone || !transactionId || !product || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required order fields.' }, { status: 400 });
    }

    if (paymentMethod !== 'bkash' && paymentMethod !== 'nagad') {
      return NextResponse.json({ message: 'Invalid payment method.' }, { status: 400 });
    }

    const serverSettings = getOrderServerSettings();
    const apiKey = getResendApiKey();
    if (!apiKey) {
      return NextResponse.json({ message: 'Order email is not configured. Set RESEND_API_KEY in Vercel.' }, { status: 500 });
    }

    const normalizedMethod = paymentMethod;
    const methodLabel = normalizedMethod === 'nagad' ? 'Nagad' : 'bKash';
    const paymentNumber = normalizedMethod === 'nagad' ? serverSettings.nagadNumber : serverSettings.bkashNumber;
    const from = serverSettings.fromEmail;
    const ownerEmail = serverSettings.adminEmail;
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedPhone = escapeHtml(phone);
    const escapedTransactionId = escapeHtml(transactionId);
    const escapedNote = escapeHtml(note || 'N/A');
    const escapedTitle = escapeHtml(product.title);
    const escapedSeller = escapeHtml(product.seller);
    const escapedDelivery = escapeHtml(product.delivery);
    const escapedPaymentNumber = escapeHtml(paymentNumber || '');
    const escapedOrderNotice = escapeHtml(serverSettings.orderNotice);
    const escapedSupportPhone = escapeHtml(serverSettings.phone);
    const priceText = product.price.toFixed(2);

    const adminHtml = `
      <h2>New order received</h2>
      <p><strong>Customer:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> ${escapedEmail}</p>
      <p><strong>Phone:</strong> ${escapedPhone}</p>
      <p><strong>Product:</strong> ${escapedTitle}</p>
      <p><strong>Seller:</strong> ${escapedSeller}</p>
      <p><strong>Delivery:</strong> ${escapedDelivery}</p>
      <p><strong>Price:</strong> $${priceText}</p>
      <p><strong>Payment method:</strong> ${escapeHtml(methodLabel)}${escapedPaymentNumber ? ` (${escapedPaymentNumber})` : ''}</p>
      <p><strong>Transaction ID:</strong> ${escapedTransactionId}</p>
      <p><strong>Note:</strong> ${escapedNote}</p>
    `;

    const customerHtml = `
      <h2>Your order is confirmed</h2>
      <p>Thanks for ordering <strong>${escapedTitle}</strong>.</p>
      <p>We received your ${escapeHtml(methodLabel)} transaction ID: <strong>${escapedTransactionId}</strong>.</p>
      <p>${escapedOrderNotice}</p>
      <p>For urgent support, WhatsApp or call: <strong>${escapedSupportPhone}</strong>.</p>
    `;

    const adminSubject = `New order: ${product.title}`.replace(/[\r\n]+/g, ' ').slice(0, 120);
    const customerSubject = `Order confirmed: ${product.title}`.replace(/[\r\n]+/g, ' ').slice(0, 120);

    const send = async (to: string, subject: string, html: string) => fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const [adminRes, customerRes] = await Promise.all([
      send(ownerEmail, adminSubject, adminHtml),
      send(email, customerSubject, customerHtml),
    ]);

    if (!adminRes.ok || !customerRes.ok) {
      const adminText = await adminRes.text();
      const customerText = await customerRes.text();
      console.error('Order email delivery failed', {
        adminStatus: adminRes.status,
        customerStatus: customerRes.status,
        adminBody: adminText,
        customerBody: customerText,
      });
      return NextResponse.json({ message: 'Order submitted, but email delivery is temporarily unavailable. Please contact support via WhatsApp/phone.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: 'Server error while submitting order.' }, { status: 500 });
  }
}
