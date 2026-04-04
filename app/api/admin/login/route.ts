import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, isAdminAuthConfigured, validateAdminLogin } from '@/lib/adminAuth';

const COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;

export async function POST(req: Request) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json({ message: 'Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }

    if (!validateAdminLogin(username, password)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    const token = createAdminSessionToken(username);
    const response = NextResponse.json({ ok: true, token, message: 'Login successful' });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Server error while signing in.' }, { status: 500 });
  }
}