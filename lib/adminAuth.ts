import crypto from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'gamehub_admin_session';
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;
const DEV_ADMIN_USERNAME = 'admin';
const DEV_ADMIN_PASSWORD = 'gamehub-dev-admin-password';
const DEV_JWT_SECRET = 'gamehub-dev-jwt-secret';

function readEnv(name: string) {
  return process.env[name]?.trim() || '';
}

export function getAdminCredentials() {
  return {
    username: readEnv('ADMIN_USERNAME') || (process.env.NODE_ENV === 'production' ? '' : DEV_ADMIN_USERNAME),
    password: readEnv('ADMIN_PASSWORD') || (process.env.NODE_ENV === 'production' ? '' : DEV_ADMIN_PASSWORD),
    secret: readEnv('JWT_SECRET') || (process.env.NODE_ENV === 'production' ? '' : DEV_JWT_SECRET),
  };
}

export function isAdminAuthConfigured() {
  const credentials = getAdminCredentials();
  return Boolean(credentials.username && credentials.password && credentials.secret);
}

function base64UrlEncode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value: string) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as Record<string, unknown>;
}

function getSecret() {
  return getAdminCredentials().secret;
}

function signToken(header: string, payload: string) {
  const secret = getSecret();
  if (!secret) {
    throw new Error('Admin session secret is missing');
  }

  return crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAdminLogin(username: string, password: string) {
  const credentials = getAdminCredentials();

  if (!credentials.username || !credentials.password || !credentials.secret) {
    throw new Error('Admin auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and JWT_SECRET.');
  }

  return constantTimeEqual(username, credentials.username) && constantTimeEqual(password, credentials.password);
}

export function createAdminSessionToken(username: string, now = Date.now()) {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const payload = base64UrlEncode({
    role: 'admin',
    username,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + ADMIN_TOKEN_TTL_SECONDS,
  });
  const signature = signToken(header, payload);

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, signature] = parts;
  const expectedSignature = signToken(header, payload);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = base64UrlDecode(payload);
    if (decoded.role !== 'admin') {
      return false;
    }

    const expiresAt = typeof decoded.exp === 'number' ? decoded.exp : Number(decoded.exp);
    if (!Number.isFinite(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function extractCookieValue(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}

export function getAdminSessionTokenFromRequest(req: Request) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim() || null;
  }

  return extractCookieValue(req.headers.get('cookie'), ADMIN_SESSION_COOKIE);
}

export function requireAdminAuth(req: Request) {
  return verifyAdminSessionToken(getAdminSessionTokenFromRequest(req));
}