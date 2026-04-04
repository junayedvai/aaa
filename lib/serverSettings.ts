import { defaultSettings } from '@/lib/siteData';

function readEnv(name: string) {
  return process.env[name]?.trim() || '';
}

export function getOrderServerSettings() {
  return {
    adminEmail: readEnv('ORDER_NOTIFY_EMAIL') || defaultSettings.adminEmail,
    fromEmail: readEnv('ORDER_FROM_EMAIL') || 'GameHub Market <onboarding@resend.dev>',
    phone: readEnv('ORDER_PHONE') || defaultSettings.phone,
    whatsapp: readEnv('ORDER_WHATSAPP') || defaultSettings.whatsapp,
    bkashNumber: readEnv('ORDER_BKASH_NUMBER') || defaultSettings.bkashNumber,
    nagadNumber: readEnv('ORDER_NAGAD_NUMBER') || defaultSettings.nagadNumber,
    orderNotice: readEnv('ORDER_NOTICE') || defaultSettings.orderNotice,
  };
}

export function getResendApiKey() {
  return readEnv('RESEND_API_KEY');
}