import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/components/cart/CartProvider';
import SiteBrandSync from '@/components/SiteBrandSync';
import { SiteDataProvider } from '@/components/SiteDataProvider';

export const metadata: Metadata = {
  title: 'GameHub Market',
  description: 'Service selling marketplace inspired by the provided screenshots.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SiteDataProvider><CartProvider><SiteBrandSync />{children}</CartProvider></SiteDataProvider></body></html>;
}
