'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { defaultSiteData, SiteData } from '@/lib/siteData';
import { normalizeSiteData } from '@/lib/siteContent';

type SiteDataContextValue = {
  content: SiteData;
  loading: boolean;
  refreshContent: () => Promise<void>;
  setContent: (nextContent: SiteData) => void;
};

const SiteDataContext = createContext<SiteDataContextValue>({
  content: defaultSiteData,
  loading: true,
  refreshContent: async () => undefined,
  setContent: () => undefined,
});

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<SiteData>(defaultSiteData);
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as Partial<SiteData>;
      setContentState(normalizeSiteData(data));
    } catch {
      setContentState(defaultSiteData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
    const handleUpdate = () => {
      void refreshContent();
    };

    window.addEventListener('gamehub:site-data-update', handleUpdate);
    return () => window.removeEventListener('gamehub:site-data-update', handleUpdate);
  }, [refreshContent]);

  const setContent = useCallback((nextContent: SiteData) => {
    setContentState(normalizeSiteData(nextContent));
  }, []);

  return <SiteDataContext.Provider value={{ content, loading, refreshContent, setContent }}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  return useContext(SiteDataContext);
}