'use client';

import { useEffect } from 'react';
import { useSiteData } from '@/components/SiteDataProvider';

function upsertFavicon(href: string) {
  if (!href) return;
  const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (existing) {
    existing.href = href;
    return;
  }
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = href;
  document.head.appendChild(icon);
}

export default function SiteBrandSync() {
  const { content } = useSiteData();

  useEffect(() => {
    if (content.settings.websiteName?.trim()) {
      document.title = content.settings.websiteName.trim();
    }
    upsertFavicon(content.settings.faviconUrl?.trim() ?? '');
  }, [content.settings.faviconUrl, content.settings.websiteName]);

  return null;
}
