import { cookies } from 'next/headers';
import AdminClient from '@/components/admin/AdminClient';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import { ADMIN_SESSION_COOKIE, isAdminAuthConfigured, verifyAdminSessionToken } from '@/lib/adminAuth';

export default async function CosmicVaultPortal() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const hasAccess = verifyAdminSessionToken(sessionCookie);

  return hasAccess ? <AdminClient /> : <AdminLoginForm authConfigured={isAdminAuthConfigured()} />;
}
