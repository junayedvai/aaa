'use client';
import Link from 'next/link';
import { Menu, Search, ShoppingCart, MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getListingKinds, ListingKind } from '@/lib/siteData';
import { useCart } from '@/components/cart/CartProvider';
import { useSiteData } from '@/components/SiteDataProvider';

export default function Header() {
  const [query, setQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState('');
  const { content: site } = useSiteData();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cartPanelRef.current?.contains(target)) return;
      if (cartButtonRef.current?.contains(target)) return;
      setCartOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [cartOpen]);

  const listingKinds = useMemo(() => getListingKinds(site.products), [site.products]);
  const suggestions = useMemo(
    () => !query.trim()
      ? []
      : site.products
          .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6),
    [query, site.products]
  );
  const cartCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const cartSubtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

  return <>
    <header className="topbar" style={{ position: 'relative', zIndex: 30 }}>
      <div className="container topbar-inner">
        <button className="menu-btn" aria-label="Open categories"><Menu size={18} /></button>
        <Link href="/" className="logo">
          {site.settings.logoUrl && <img src={site.settings.logoUrl} alt={site.settings.logoName || site.settings.brandName} className="logo-image" />}
          <span className="logo-text-main">{site.settings.logoName || site.settings.brandName}</span>
          <span>{site.settings.websiteName || 'Market'}</span>
        </Link>
        <div className="search-wrap">
          <div className="search-anchor">
            <form action="/marketplace" className="search-box">
              <input name="q" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search for accounts, games, items and services" />
              <select name="kind" value={selectedKind} onChange={(e)=>setSelectedKind(e.target.value)}>
                <option value="">All Listings</option>
                {listingKinds.map((item: ListingKind)=><option key={item} value={item}>{item}</option>)}
              </select>
              <button aria-label="Search"><Search size={18} /></button>
            </form>
            {suggestions.length > 0 && <div className="search-suggestions">
              <strong style={{display:'block',marginBottom:12}}>Search results</strong>
              <div className="suggestion-row">
                {suggestions.map(item => <Link key={item.id} href={`/product/${item.id}`} className="suggestion-card">
                  <div className="small-muted">{item.listingKind}</div><div style={{fontWeight:700,margin:'6px 0'}}>{item.title}</div><div className="small-muted">from ${item.price}</div>
                </Link>)}
              </div>
            </div>}
          </div>
        </div>
        <div className="header-actions">
          <span className="pill">EN | USD</span>
          <a href={`https://wa.me/${site.settings.whatsapp.replace(/[^0-9]/g,'')}`} className="pill primary-pill" target="_blank" rel="noreferrer">WhatsApp</a>
          <button className="icon-btn" aria-label="Cart" onClick={()=>setCartOpen((open)=>!open)} ref={cartButtonRef} style={{ position: 'relative' }}>
            <ShoppingCart size={18} />
            {cartCount > 0 && <span style={{ position:'absolute', top:-6, right:-6, background:'#ef4444', color:'white', borderRadius:'999px', fontSize:10, padding:'0 5px', minWidth:18, textAlign:'center' }}>{cartCount}</span>}
          </button>
          <a className="icon-btn" aria-label="Support" href={`tel:${site.settings.phone}`}><MessageCircle size={18} /></a>
        </div>
      </div>
      {cartOpen && <div ref={cartPanelRef} className="glass-card-light" style={{ position:'absolute', top:'100%', right:16, width:360, padding:20, boxShadow:'0 20px 50px rgba(15,23,42,.25)', borderRadius:20 }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            <strong>Cart</strong>
            <div className="small-muted">{cartCount} item{cartCount === 1 ? '' : 's'}</div>
          </div>
          {items.length > 0 && <button className="admin-ghost-btn" style={{padding:'4px 10px'}} onClick={()=>clearCart()}>Clear</button>}
        </div>
        {items.length === 0 && <div className="small-muted">Your cart is empty. Browse products and add them for quick checkout.</div>}
        {items.length > 0 && <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {items.map((item)=><div key={item.id} className="info-box" style={{padding:12, borderRadius:16}}>
            <div style={{fontWeight:600}}>{item.title}</div>
            <div className="small-muted">{item.listingKind} • ${item.price.toFixed(2)}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <button type="button" aria-label="Decrease quantity" onClick={()=>updateQuantity(item.id, item.quantity - 1)} className="pill" style={{padding:'4px 10px'}}>−</button>
                <span style={{minWidth:20,textAlign:'center'}}>{item.quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={()=>updateQuantity(item.id, item.quantity + 1)} className="pill" style={{padding:'4px 10px'}}>+</button>
              </div>
              <button type="button" className="admin-ghost-btn" style={{padding:'4px 10px'}} onClick={()=>removeItem(item.id)}>Remove</button>
              <Link href={`/checkout/${item.id}`} className="admin-primary-btn" style={{whiteSpace:'nowrap',padding:'4px 12px'}}>Checkout</Link>
            </div>
          </div>)}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
            <div>
              <div className="small-muted">Subtotal</div>
              <strong>${cartSubtotal.toFixed(2)}</strong>
            </div>
            <Link href="/marketplace" className="admin-ghost-btn" onClick={()=>setCartOpen(false)}>Continue shopping</Link>
          </div>
        </div>}
      </div>}
    </header>
    <div className="notice-strip"><div className="container">{site.settings.tagline}. Order support: <strong>{site.settings.whatsapp}</strong></div></div>
  </>;
}
