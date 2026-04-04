'use client';
import Link from 'next/link';
import { Gamepad2, Gift, Coins, Shield, Zap, Trophy, CreditCard, Percent } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { giftCards, hotGameColumns, newGames, testimonials, topUps, videoGames } from '@/data/mockData';
import { MouseEvent, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Product } from '@/lib/siteData';
import { useSiteData } from '@/components/SiteDataProvider';

const icons = [Coins, Zap, Gift, Trophy, Shield, Gamepad2, CreditCard, Percent];

export default function HomePage() {
  const { content: site } = useSiteData();
  const { addItem } = useCart();
  const [toast, setToast] = useState('');
  const handleQuickAdd = (event: MouseEvent, product: Product) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
    setToast(`${product.title} added to cart`);
    setTimeout(() => setToast(''), 2000);
  };
  return <>
    {toast && <div style={{position:'fixed',top:20,right:20,background:'#16a34a',color:'white',padding:'12px 18px',borderRadius:12,boxShadow:'0 15px 40px rgba(0,0,0,.2)',zIndex:40}}>{toast}</div>}
    <Header />
    <section className="hero premium-hero">
      <div className="container">
        <div className="hero-copy">
          <p>{site.settings.tagline}</p>
          <h1>{site.settings.brandName} MARKETPLACE</h1>
          <span className="badge">no signup needed + premium UI + fast delivery</span>
        </div>
        <div className="category-row">
          {site.filterOptions.topCategories.slice(0, 8).map((category, index) => {
            const Icon = icons[index % icons.length];
            return <Link key={category} href="/marketplace" className="category-tile"><Icon size={24} style={{ margin:'0 auto' }} /><strong>{category}</strong></Link>;
          })}
        </div>
      </div>
    </section>

    <section className="section"><div className="container"><h2>Featured catalog</h2><div className="products-grid">
      {site.products.slice(0, 10).map(item => <Link key={item.id} href={`/product/${item.id}`} className="product-card premium-card-link"><div className="product-thumb" style={item.image ? { backgroundImage:`url(${item.image})`, backgroundSize:'cover', backgroundPosition:'center' } : { background:item.tone }}>{!item.image && item.thumb}</div><div className="product-title">{item.title}</div><div className="product-meta"><span>{item.country}</span><span>{item.type}</span></div><div className="product-meta"><span className="stars">★★★★★ {item.rating.toFixed(1)}</span><span className="price">${item.price.toFixed(2)}</span></div><button type="button" className="admin-ghost-btn" style={{marginTop:10}} onClick={(event)=>handleQuickAdd(event, item)}>Add to cart</button></Link>)}
    </div></div></section>

    <section className="section"><div className="container"><h2>Hot Game</h2><div className="cards-4">
      {hotGameColumns.map((col) => <div key={col.title} className="big-card" style={{ background: col.tone }}>
        <div><div style={{fontSize:14,opacity:.9}}>{col.title.toUpperCase()}</div><ul>{col.items.map((item,i)=><li key={item}>{item}<span>{180 + i*9}</span></li>)}</ul></div>
        <Link href="/marketplace" className="admin-ghost-btn" style={{color:'white',justifyContent:'center'}}>View More</Link>
      </div>)}
    </div></div></section>

    <section className="section"><div className="container panel"><div className="section-head"><h2 style={{color:'white'}}>Trending Top up</h2><Link href="/marketplace" className="link-chip">Discover All</Link></div>
      <div className="panel-grid">
        <div className="offer-card" style={{minHeight:270,background:'linear-gradient(120deg,#18181b,#4c1d95)'}}><div className="offer-tag">Featured</div><div style={{fontSize:56,fontWeight:900}}>PREMIUM</div><div><div style={{fontSize:28,fontWeight:700}}>Instant-ready digital deals</div><div>Admin-controlled content blocks</div></div></div>
        <div className="offer-grid">{topUps.slice(1).map(item => <div key={item.title} className="offer-card" style={{background:item.tone}}><div className="offer-tag">{item.offers} offers</div><strong>{item.title}</strong></div>)}</div>
      </div>
    </div></section>

    <section className="section"><div className="container"><div className="section-head"><h2>Trending Gift Cards</h2><Link href="/marketplace" className="link-chip">Discover All</Link></div><div className="logo-grid">
      {giftCards.map((item,i)=><div key={item} className="logo-box" style={{background:i%2?'linear-gradient(120deg,#4c1d95,#1f2937)':'linear-gradient(120deg,#15803d,#1d4ed8)'}}><div style={{fontSize:30,fontWeight:800}}>{item.split(' ')[0]}</div><div>{item}</div><div style={{fontSize:13,opacity:.8}}>{(i+1)*116} offers</div></div>)}
    </div></div></section>

    <section className="section" style={{paddingTop:0}}><div className="container"><div className="section-head"><h2>Trending Video Games</h2><Link href="/marketplace" className="link-chip">Discover All</Link></div><div className="logo-grid">
      {videoGames.map((item,i)=><div key={item} className="logo-box" style={{background:i%2?'linear-gradient(120deg,#111827,#7f1d1d)':'linear-gradient(120deg,#14532d,#166534)'}}><div style={{fontSize:26,fontWeight:800}}>{item.split(' ')[0]}</div><div>{item}</div><div style={{fontSize:13,opacity:.8}}>{(i+1)*107} offers</div></div>)}
    </div></div></section>

    <section className="section"><div className="container"><h2>Community ratings</h2><div className="testimonials">{testimonials.map(item => <div key={item.user} className="testimonial"><div className="stars">★★★★★ {item.score}</div><p>{item.text}</p><div className="small-muted">Mar 30, 2026</div><strong>{item.user}</strong></div>)}</div></div></section>
    <section className="section"><div className="container"><h2>New Game</h2><div className="new-game-grid">{newGames.map((group,index)=><div key={index} className="list-box"><ul>{group.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div></div></section>
    <Footer />
  </>;
}
