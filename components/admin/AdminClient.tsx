'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { defaultSiteData, getListingKinds, ListingKind, Product, SiteData } from '@/lib/siteData';
import { Eye, Gift, Plus, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useSiteData } from '@/components/SiteDataProvider';

type AdminContentResponse = {
  content: SiteData;
  sha: string | null;
};

const inputStyle: CSSProperties = { width: '100%', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(8,12,30,.75)', color: 'white', borderRadius: 14, padding: '12px 14px' };

export default function AdminClient() {
  const { refreshContent } = useSiteData();
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState('Loading admin content...');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sha, setSha] = useState<string | null>(null);

  const selectedProduct = useMemo(() => data.products.find((item) => item.id === selectedId) ?? data.products[0], [data.products, selectedId]);
  const listingKinds = useMemo(() => getListingKinds(data.products), [data.products]);

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      try {
        const response = await fetch('/api/admin/content', { cache: 'no-store', credentials: 'include' });
        const body = await response.json().catch(() => ({ message: 'Unable to load admin content.' }));

        if (!response.ok) {
          throw new Error(body.message || 'Unable to load admin content.');
        }

        if (cancelled) {
          return;
        }

        const nextContent = (body as AdminContentResponse).content ?? defaultSiteData;
        setData(nextContent);
        setSelectedId(nextContent.products[0]?.id ?? null);
        setSha((body as AdminContentResponse).sha ?? null);
        setSaveStatus('');
      } catch (error) {
        if (!cancelled) {
          setData(defaultSiteData);
          setSelectedId(defaultSiteData.products[0]?.id ?? null);
          setSha(null);
          setSaveStatus(error instanceof Error ? error.message : 'Unable to load admin content.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const markDirty = (next: SiteData) => {
    setData(next);
    setSaveStatus('Unsaved changes. Click Save now to push to GitHub.');
  };

  const updateProduct = (patch: Partial<Product>) => {
    if (!selectedProduct) return;

    markDirty({
      ...data,
      products: data.products.map((item) => item.id === selectedProduct.id ? {
        ...item,
        ...patch,
        type: patch.listingKind ?? item.listingKind,
      } : item),
    });
  };

  const updateListOption = (key: 'countries' | 'access' | 'topCategories', value: string) => {
    const values = value.split('\n').map((item) => item.trim()).filter(Boolean);
    markDirty({ ...data, filterOptions: { ...data.filterOptions, [key]: values } });
  };

  const saveNow = async () => {
    setSaving(true);
    setSaveStatus('Saving to GitHub...');

    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data,
          sha,
          message: `[Admin] Update site content - ${new Date().toISOString()}`,
        }),
      });

      const body = await response.json().catch(() => ({ message: 'Save failed.' }));
      if (!response.ok) {
        throw new Error(body.message || 'Save failed.');
      }

      setSha((body as { sha?: string | null }).sha ?? sha);
      setSaveStatus('Changes saved to GitHub. Refreshing storefront content...');
      window.dispatchEvent(new Event('gamehub:site-data-update'));
      await refreshContent();
      setSaveStatus('Changes saved to GitHub.');
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/cosmic-vault-portal';
  };

  if (loading) {
    return <div className="admin-shell"><div className="container"><section className="glass-card admin-login-card"><div className="admin-kicker"><Eye size={16} /> Loading</div><h1 style={{ margin: 0 }}>Cosmic Vault editor</h1><p className="admin-muted">Loading GitHub-backed content...</p></section></div></div>;
  }

  return <div className="admin-shell"><div className="container admin-grid">
    <aside className="glass-card admin-sidebar">
      <div className="admin-kicker"><Eye size={16} /> Live content manager</div>
      <h2>Products</h2>
      <button className="admin-primary-btn" onClick={() => {
        const id = Math.max(0, ...data.products.map((item) => item.id)) + 1;
        const newProduct: Product = {
          id,
          title: 'New Premium Listing',
          category: 'Digital Services',
          type: 'Account',
          listingKind: 'Account',
          country: data.filterOptions.countries[0] || 'Bangladesh',
          access: 'Full Access',
          premium: 'Premium',
          age: 'New',
          price: 10,
          rating: 5,
          seller: 'Admin Store',
          offers: 1,
          thumb: 'NEW',
          tone: 'linear-gradient(135deg,#0f172a,#7c3aed)',
          image: '',
          description: 'Add your custom description here.',
          delivery: 'Within 24 hours',
          features: ['Editable from admin', 'Premium UI', 'Fast delivery'],
        };
        const next = { ...data, products: [newProduct, ...data.products] };
        markDirty(next);
        setSelectedId(id);
      }}><Plus size={16} /> Add product</button>
      <div className="admin-product-list">
        {data.products.map((item) => <button key={item.id} className={`admin-product-item ${selectedProduct?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedId(item.id)}>
          <strong>{item.title}</strong><span>{item.listingKind}</span>
        </button>)}
      </div>
      <button className="admin-danger-btn" onClick={() => {
        if (!selectedProduct) return;
        const nextProducts = data.products.filter((item) => item.id !== selectedProduct.id);
        const next = { ...data, products: nextProducts };
        markDirty(next);
        setSelectedId(nextProducts[0]?.id ?? null);
      }}><Trash2 size={16} /> Remove selected</button>
    </aside>

    <main className="admin-main">
      <section className="glass-card admin-panel">
        <div className="admin-panel-head"><div><div className="admin-kicker">Secret console</div><h2>Cosmic Vault editor</h2></div></div>
        <div className="admin-note">Protected admin access now uses a signed session cookie. Content saves are pushed directly to GitHub.</div>
      </section>

      <section className="glass-card admin-panel">
        <div className="admin-panel-head"><div><div className="admin-kicker">Site settings</div><h2>Brand, payment, delivery and contact</h2></div><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="admin-ghost-btn" onClick={signOut}>Sign out</button><button className="admin-ghost-btn" onClick={saveNow} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save now'}</button></div></div>
        <div className="admin-form-grid">
          <label><span>Brand name</span><input style={inputStyle} value={data.settings.brandName} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, brandName:e.target.value} })} /></label>
          <label><span>Website name (browser tab)</span><input style={inputStyle} value={data.settings.websiteName} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, websiteName:e.target.value} })} /></label>
          <label><span>Logo name (header text)</span><input style={inputStyle} value={data.settings.logoName} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, logoName:e.target.value} })} /></label>
          <label><span>Logo image URL</span><input style={inputStyle} value={data.settings.logoUrl} placeholder="https://..." onChange={(e)=>markDirty({ ...data, settings:{...data.settings, logoUrl:e.target.value} })} /></label>
          <label><span>Favicon URL</span><input style={inputStyle} value={data.settings.faviconUrl} placeholder="https://..." onChange={(e)=>markDirty({ ...data, settings:{...data.settings, faviconUrl:e.target.value} })} /></label>
          <label><span>Tagline</span><input style={inputStyle} value={data.settings.tagline} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, tagline:e.target.value} })} /></label>
          <label><span>Notification email</span><input style={inputStyle} value={data.settings.adminEmail} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, adminEmail:e.target.value} })} /></label>
          <label><span>bKash number</span><input style={inputStyle} value={data.settings.bkashNumber} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, bkashNumber:e.target.value} })} /></label>
          <label><span>Nagad number</span><input style={inputStyle} value={data.settings.nagadNumber} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, nagadNumber:e.target.value} })} /></label>
          <label><span>WhatsApp</span><input style={inputStyle} value={data.settings.whatsapp} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, whatsapp:e.target.value} })} /></label>
          <label><span>Phone</span><input style={inputStyle} value={data.settings.phone} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, phone:e.target.value} })} /></label>
          <label className="span-2"><span>Order notice</span><textarea style={inputStyle} rows={3} value={data.settings.orderNotice} onChange={(e)=>markDirty({ ...data, settings:{...data.settings, orderNotice:e.target.value} })} /></label>
        </div>
        {saveStatus && <div className="admin-note" style={{marginTop:12}}>{saveStatus}</div>}
      </section>

      <section className="glass-card admin-panel">
        <div className="admin-panel-head"><div><div className="admin-kicker">Filter options</div><h2>Editable filters with auto listing-type update</h2></div></div>
        <div className="admin-note" style={{marginBottom:14}}>Listing type filter is now automatic. It updates from your products when you mark each item as <strong>Account</strong> or <strong>Gift Card</strong>.</div>
        <div className="admin-form-grid">
          <label><span>Registration countries</span><textarea style={inputStyle} rows={5} value={data.filterOptions.countries.join('\n')} onChange={(e)=>updateListOption('countries', e.target.value)} /></label>
          <label><span>Access options</span><textarea style={inputStyle} rows={5} value={data.filterOptions.access.join('\n')} onChange={(e)=>updateListOption('access', e.target.value)} /></label>
          <label className="span-2"><span>Top categories</span><textarea style={inputStyle} rows={5} value={data.filterOptions.topCategories.join('\n')} onChange={(e)=>updateListOption('topCategories', e.target.value)} /></label>
        </div>
        <div className="feature-list" style={{marginTop:16}}>
          {listingKinds.map((kind) => <div key={kind} className="feature-item">{kind}</div>)}
        </div>
      </section>

      {selectedProduct && <section className="glass-card admin-panel">
        <div className="admin-panel-head"><div><div className="admin-kicker">Product editor</div><h2>{selectedProduct.title}</h2></div></div>
        <div className="admin-form-grid">
          <label className="span-2"><span>Title</span><input style={inputStyle} value={selectedProduct.title} onChange={(e)=>updateProduct({ title: e.target.value, thumb: e.target.value.split(' ')[0]?.toUpperCase().slice(0,8) || 'ITEM' })} /></label>
          <label><span>Listing type</span><select style={inputStyle} value={selectedProduct.listingKind} onChange={(e)=>updateProduct({ listingKind: e.target.value as ListingKind, type: e.target.value })}><option value="Account">Account</option><option value="Gift Card">Gift Card</option></select></label>
          <label><span>Country</span><select style={inputStyle} value={selectedProduct.country} onChange={(e)=>updateProduct({ country: e.target.value })}>{data.filterOptions.countries.map((item)=><option key={item}>{item}</option>)}</select></label>
          <label><span>Access</span><select style={inputStyle} value={selectedProduct.access} onChange={(e)=>updateProduct({ access: e.target.value as Product['access'] })}>{data.filterOptions.access.map((item)=><option key={item}>{item}</option>)}</select></label>
          <label><span>Seller</span><input style={inputStyle} value={selectedProduct.seller} onChange={(e)=>updateProduct({ seller: e.target.value })} /></label>
          <label><span>Price</span><input style={inputStyle} type="number" value={selectedProduct.price} onChange={(e)=>updateProduct({ price: Number(e.target.value) })} /></label>
          <label><span>Rating</span><input style={inputStyle} type="number" step="0.1" min="0" max="5" value={selectedProduct.rating} onChange={(e)=>updateProduct({ rating: Number(e.target.value) })} /></label>
          <label><span>Offers</span><input style={inputStyle} type="number" value={selectedProduct.offers} onChange={(e)=>updateProduct({ offers: Number(e.target.value) })} /></label>
          <label><span>Card image URL</span><input style={inputStyle} value={selectedProduct.image ?? ''} onChange={(e)=>updateProduct({ image: e.target.value })} placeholder="https://..." /></label>
          <label><span>Gradient background</span><input style={inputStyle} value={selectedProduct.tone} onChange={(e)=>updateProduct({ tone: e.target.value })} /></label>
          <label><span>Delivery</span><input style={inputStyle} value={selectedProduct.delivery ?? ''} onChange={(e)=>updateProduct({ delivery: e.target.value })} /></label>
          <label><span>Category</span><input style={inputStyle} value={selectedProduct.category} onChange={(e)=>updateProduct({ category: e.target.value })} /></label>
          <label><span>Quick badges</span><div className="feature-list"><button type="button" className="feature-item" onClick={()=>updateProduct({ listingKind:'Account', type:'Account' })}><UserRound size={14} /> Mark Account</button><button type="button" className="feature-item" onClick={()=>updateProduct({ listingKind:'Gift Card', type:'Gift Card' })}><Gift size={14} /> Mark Gift Card</button><button type="button" className="feature-item" onClick={()=>updateProduct({ access:'Full Access' })}><ShieldCheck size={14} /> Full Access</button></div></label>
          <label className="span-2"><span>Description</span><textarea style={inputStyle} rows={5} value={selectedProduct.description ?? ''} onChange={(e)=>updateProduct({ description: e.target.value })} /></label>
          <label className="span-2"><span>Features (one per line)</span><textarea style={inputStyle} rows={5} value={(selectedProduct.features ?? []).join('\n')} onChange={(e)=>updateProduct({ features: e.target.value.split('\n').map((item)=>item.trim()).filter(Boolean) })} /></label>
        </div>
      </section>}
    </main>
  </div></div>;
}
