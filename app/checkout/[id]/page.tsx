'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useSiteData } from '@/components/SiteDataProvider';

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ? Number(params.id) : null;
  const { content: data } = useSiteData();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const product = productId !== null ? data.products.find((item) => item.id === productId) : undefined;
  const [form, setForm] = useState({ name: '', email: '', phone: '', transactionId: '', note: '', paymentMethod: 'bkash' as 'bkash' | 'nagad' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, product }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const body = await res.json().catch(() => ({ message: 'Order failed.' }));
      setError(body.message || 'Order failed.');
    }
  };

  if (!product) return <><Header /><main className="section"><div className="container info-box"><h1>Product not found</h1></div></main><Footer /></>;

  return <>
    <Header />
    <main className="section" style={{ paddingTop: 26 }}>
      <div className="container checkout-grid">
        <section className="glass-card-light checkout-card">
          <div className="admin-kicker">Complete your order</div>
          <h1>{product.title}</h1>
          <p className="small-muted">Send money via <strong>bKash ({data.settings.bkashNumber})</strong> or <strong>Nagad ({data.settings.nagadNumber})</strong>. After payment, share the transaction ID and select which method you used.</p>
          {!success ? <form onSubmit={submit} className="checkout-form">
            <input required placeholder="Your full name" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Your email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
            <input required placeholder="Phone / WhatsApp" value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
            <div style={{display:'flex', gap:16, flexWrap:'wrap', fontSize:14}}>
              <label><input type="radio" name="payment-method" value="bkash" checked={form.paymentMethod==='bkash'} onChange={()=>setForm({ ...form, paymentMethod: 'bkash' })} /> bKash transfer</label>
              <label><input type="radio" name="payment-method" value="nagad" checked={form.paymentMethod==='nagad'} onChange={()=>setForm({ ...form, paymentMethod: 'nagad' })} /> Nagad transfer</label>
            </div>
            <input required placeholder="Payment transaction ID" value={form.transactionId} onChange={(e)=>setForm({ ...form, transactionId: e.target.value })} />
            <textarea placeholder="Optional note" rows={4} value={form.note} onChange={(e)=>setForm({ ...form, note: e.target.value })} />
            <button className="admin-primary-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit order'}</button>
            {error && <div className="admin-note" style={{ color: '#fca5a5' }}>{error}</div>}
          </form> : <div className="success-box">
            <h2>Order placed successfully</h2>
            <p>We have notified the admin by email and sent a confirmation to your email if email delivery is configured.</p>
            <p>{data.settings.orderNotice} WhatsApp/call: <strong>{data.settings.phone}</strong></p>
          </div>}
        </section>

        <aside className="glass-card checkout-summary">
          <div className="small-muted">Order summary</div>
          <div className="detail-price">${product.price.toFixed(2)}</div>
          <div className="product-meta"><span>Product</span><span>{product.type}</span></div>
          <div className="product-meta"><span>Seller</span><span>{product.seller}</span></div>
          <div className="product-meta"><span>Delivery</span><span>{product.delivery}</span></div>
          <div className="product-meta"><span>Support</span><span>{data.settings.whatsapp}</span></div>
          <div className="admin-note">After sending the money via bKash or Nagad, submit the transaction ID. Delivery remains within 24 hours.</div>
        </aside>
      </div>
    </main>
    <Footer />
  </>;
}
