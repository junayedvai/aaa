'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense, useEffect, useMemo, useState, MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getListingKinds, Product } from '@/lib/siteData';
import { useCart } from '@/components/cart/CartProvider';
import { useSiteData } from '@/components/SiteDataProvider';

const pageSize = 20;
export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="section"><div className="container">Loading marketplace...</div></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') ?? '';
  const initialKind = searchParams?.get('kind') ?? '';
  const { content: site } = useSiteData();
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState(initialKind);
  const [countries, setCountries] = useState<string[]>([]);
  const [access, setAccess] = useState<string[]>([]);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const [toast, setToast] = useState('');

  useEffect(() => {
    const urlKind = searchParams?.get('kind') ?? '';
    const validKinds = getListingKinds(site.products);
    setKind(validKinds.includes(urlKind as 'Account' | 'Gift Card') ? urlKind : '');
  }, [searchParams, site.products]);

  const listingKinds = useMemo(() => getListingKinds(site.products), [site.products]);

  const filtered = useMemo(() => {
    let items = site.products.filter(item => {
      const q = query.toLowerCase();
      const matchesQuery = !query || item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchesKind = !kind || item.listingKind === kind;
      const matchesCountry = countries.length === 0 || countries.includes(item.country);
      const matchesAccess = access.length === 0 || access.includes(item.access);
      return matchesQuery && matchesKind && matchesCountry && matchesAccess;
    });
    if (sort === 'price-low') items = [...items].sort((a,b)=>a.price-b.price);
    if (sort === 'price-high') items = [...items].sort((a,b)=>b.price-a.price);
    if (sort === 'rating') items = [...items].sort((a,b)=>b.rating-a.rating);
    return items;
  }, [query, kind, countries, access, sort, site.products]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const toggleArrayValue = (value: string, list: string[], setter: (arr: string[]) => void) => { setter(list.includes(value) ? list.filter((x)=>x!==value) : [...list, value]); setPage(1); };

  const handleQuickAdd = (event: MouseEvent, product: Product) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
    setToast(`${product.title} added to cart`);
    setTimeout(() => setToast(''), 2000);
  };

  return <>
    <Header />
    {toast && <div style={{position:'fixed',top:20,right:20,background:'#16a34a',color:'white',padding:'12px 18px',borderRadius:12,boxShadow:'0 15px 40px rgba(0,0,0,.2)',zIndex:40}}>{toast}</div>}
    <section className="section" style={{paddingTop:26}}>
      <div className="container"><div className="market-layout">
        <aside className="sidebar glass-card-light">
          <div className="filter-group"><h4>Search products</h4><input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1);}} placeholder="Search account listings" style={{width:'100%',border:'1px solid #232946',background:'#fff',borderRadius:12,padding:'12px 14px'}} /></div>
          <div className="filter-group"><h4>Listing type</h4>{listingKinds.map(item => <label key={item}><input type="radio" checked={kind===item} onChange={()=>{setKind(item);setPage(1);}} /> {item}</label>)}<label><input type="radio" checked={kind===''} onChange={()=>{setKind('');setPage(1);}} /> All</label></div>
          <div className="filter-group"><h4>Registration country</h4>{site.filterOptions.countries.map(item => <label key={item}><input type="checkbox" checked={countries.includes(item)} onChange={()=>toggleArrayValue(item,countries,setCountries)} /> {item}</label>)}</div>
          <div className="filter-group"><h4>Access</h4>{site.filterOptions.access.map(item => <label key={item}><input type="checkbox" checked={access.includes(item)} onChange={()=>toggleArrayValue(item,access,setAccess)} /> {item}</label>)}</div>
        </aside>
        <div>
          <div className="market-top"><div><h1 style={{margin:0,fontSize:34}}>Marketplace Listings</h1><div className="small-muted">{filtered.length} products • clickable results open full product details</div></div>
          <select value={sort} onChange={(e)=>setSort(e.target.value)} style={{border:'1px solid #e7e9ef',background:'white',borderRadius:12,padding:'12px 14px'}}><option value="default">Sort: Default</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Best Rating</option></select></div>
          <div className="products-grid">{paged.map(item => <Link href={`/product/${item.id}`} key={item.id} className="product-card premium-card-link"><div className="product-thumb" style={item.image ? { backgroundImage:`url(${item.image})`, backgroundSize:'cover', backgroundPosition:'center' } : {background:item.tone}}>{!item.image && item.thumb}</div><div className="product-title">{item.title}</div><div className="product-meta"><span>{item.country}</span><span>{item.listingKind}</span></div><div className="product-meta"><span>{item.access}</span><span>{item.age}</span></div><div className="product-meta"><span className="stars">★★★★★ {item.rating.toFixed(1)}</span><span className="price">${item.price.toFixed(2)}</span></div><button type="button" className="admin-ghost-btn" style={{marginTop:10}} onClick={(event)=>handleQuickAdd(event, item)}>Add to cart</button></Link>)}</div>
          <div className="pagination">{Array.from({length: totalPages},(_,i)=>i+1).map(number => <button key={number} className={`page-btn ${page===number?'active':''}`} onClick={()=>setPage(number)}>{number}</button>)}</div>
          <div className="info-box">
            <h3 style={{marginTop:0}}>How ordering works now</h3>
            <p>Customers can open a product, go to checkout, pay by bKash or Nagad Send Money, submit the transaction ID, and receive order confirmation messaging that delivery happens within 24 hours.</p>
          </div>
        </div>
      </div></div>
    </section>
    <Footer />
  </>;
}
