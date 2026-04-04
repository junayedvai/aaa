import { defaultSiteData, normalizeProduct, Product, SiteData, SiteSettings } from '@/lib/siteData';

export function normalizeSiteData(raw: Partial<SiteData> | null | undefined): SiteData {
  const parsedSettings = (raw?.settings ?? {}) as Partial<SiteSettings>;
  const inputProducts = Array.isArray(raw?.products) ? (raw.products as Product[]) : null;
  const products = inputProducts
    ? inputProducts.map((item) => normalizeProduct(item))
    : defaultSiteData.products.map(normalizeProduct);

  return {
    ...defaultSiteData,
    ...raw,
    filterOptions: { ...defaultSiteData.filterOptions, ...(raw?.filterOptions ?? {}) },
    settings: {
      ...defaultSiteData.settings,
      ...parsedSettings,
      adminEmail: parsedSettings.adminEmail?.trim() || defaultSiteData.settings.adminEmail,
    },
    products,
  };
}

export function serializeSiteData(data: SiteData) {
  return JSON.stringify(normalizeSiteData(data), null, 2);
}