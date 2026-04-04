import { products as defaultProducts, Product as BaseProduct, topCategories as defaultTopCategories } from '@/data/mockData';

export type ListingKind = 'Account' | 'Gift Card';

export type Product = BaseProduct & {
  image?: string;
  description?: string;
  delivery?: string;
  features?: string[];
  listingKind: ListingKind;
};

export type SiteSettings = {
  adminEmail: string;
  whatsapp: string;
  phone: string;
  bkashNumber: string;
  nagadNumber: string;
  brandName: string;
  websiteName: string;
  logoName: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
  orderNotice: string;
};

export type FilterOptions = {
  countries: string[];
  access: string[];
  topCategories: string[];
};

export type SiteData = {
  products: Product[];
  filterOptions: FilterOptions;
  settings: SiteSettings;
};

export const DEFAULT_ADMIN_EMAIL = 'junayedvai08@gmail.com';

export const defaultSettings: SiteSettings = {
  adminEmail: DEFAULT_ADMIN_EMAIL,
  whatsapp: '+8801940950490',
  phone: '+8801940950490',
  bkashNumber: '01940950490',
  nagadNumber: '01604778881',
  brandName: 'GameHub',
  websiteName: 'GameHub Market',
  logoName: 'GameHub',
  logoUrl: '',
  faviconUrl: '',
  tagline: 'Premium account marketplace',
  orderNotice: 'Order will be delivered within 24 hours. For urgent support, contact us on WhatsApp or call.',
};

export const defaultFilterOptions: FilterOptions = {
  countries: ['USA', 'Japan', 'Hong Kong', 'Turkey', 'Germany', 'Bangladesh', 'Singapore'],
  access: ['Full Access', 'Shared Access'],
  topCategories: defaultTopCategories,
};

export const enhancedProducts: Product[] = defaultProducts.map((item, index) => ({
  ...item,
  listingKind: 'Account' as ListingKind,
  type: 'Account',
  image: '',
  delivery: index % 3 === 0 ? 'Instant to 6 hours' : 'Within 24 hours',
  description: `${item.title} from trusted seller ${item.seller}. This listing includes premium support, secure handover guidance, and fast after-sales communication for a smooth buying experience.`,
  features: [
    `${item.access} ready`,
    `${item.country} region`,
    `${item.premium} plan`,
    `Seller rating ${item.rating.toFixed(1)}`,
  ],
}));

export const defaultSiteData: SiteData = {
  products: enhancedProducts,
  filterOptions: defaultFilterOptions,
  settings: defaultSettings,
};

export const STORAGE_KEY = 'gamehub_admin_data_v2';

export function normalizeProduct(product: Product): Product {
  const listingKind: ListingKind = product.listingKind === 'Gift Card' ? 'Gift Card' : 'Account';
  return {
    ...product,
    type: listingKind,
    listingKind,
  };
}

export function getListingKinds(products: Product[]): ListingKind[] {
  const order: ListingKind[] = ['Account', 'Gift Card'];
  return order.filter((kind) => products.some((product) => (product.listingKind ?? product.type) === kind));
}
