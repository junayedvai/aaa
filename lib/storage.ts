import { DEFAULT_ADMIN_EMAIL, defaultSiteData, Product, SiteData, SiteSettings, normalizeProduct, STORAGE_KEY } from '@/lib/siteData';

const LEGACY_ADMIN_EMAILS = new Set(['junayedvai@gmail.com', 'junayedvi08@gmail.com']);

function resolveAdminEmail(email?: string) {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail || LEGACY_ADMIN_EMAILS.has(normalizedEmail)) {
    return DEFAULT_ADMIN_EMAIL;
  }

  return normalizedEmail;
}

export function getInitialData(): SiteData {
  if (typeof window === 'undefined') {
    return {
      ...defaultSiteData,
      products: defaultSiteData.products.map(normalizeProduct),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSiteData;
    const parsed = JSON.parse(raw) as Partial<SiteData>;
    const parsedSettings = (parsed.settings ?? {}) as Partial<SiteSettings>;
    return {
      ...defaultSiteData,
      ...parsed,
      filterOptions: { ...defaultSiteData.filterOptions, ...(parsed.filterOptions ?? {}) },
      settings: { ...defaultSiteData.settings, ...parsedSettings, adminEmail: resolveAdminEmail(parsedSettings.adminEmail) },
      products: Array.isArray(parsed.products) && parsed.products.length
        ? (parsed.products as Product[]).map((item) => normalizeProduct(item))
        : defaultSiteData.products.map(normalizeProduct),
    };
  } catch {
    return defaultSiteData;
  }
}

export function saveData(data: SiteData) {
  if (typeof window === 'undefined') return;
  const safeData: SiteData = {
    ...data,
    products: data.products.map(normalizeProduct),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  window.dispatchEvent(new Event('gamehub:branding-update'));
}

export function generateProductId(items: Product[]) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}
