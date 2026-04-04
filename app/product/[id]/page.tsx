'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useSiteData } from '@/components/SiteDataProvider';

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ? Number(params.id) : null;
  const { content: data } = useSiteData();
  const { addItem } = useCart();
  const [cartMessage, setCartMessage] = useState('');

  const product = productId !== null ? data.products.find((item) => item.id === productId) : undefined;

  if (!product) return <><Header /><main className="section"><div className="container info-box"><h1>Product not found</h1><p>That product does not exist.</p></div></main><Footer /></>;

  const quickAdd = () => {
    addItem(product);
    setCartMessage('Added to cart');
    setTimeout(() => setCartMessage(''), 2500);
  };

  return <>
    <Header />
    <main className="section" style={{ paddingTop: 26 }}>
      <div className="container product-details-layout">
        <div className="product-hero-card">
          <div className="product-detail-thumb" style={product.image ? { backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: product.tone }}>{!product.image && product.thumb}</div>
          <div className="product-detail-copy">
            <div className="detail-pill">{product.type}</div>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <div className="detail-metrics">
              <div><span>Seller</span><strong>{product.seller}</strong></div>
              <div><span>Region</span><strong>{product.country}</strong></div>
              <div><span>Access</span><strong>{product.access}</strong></div>
              <div><span>Delivery</span><strong>{product.delivery}</strong></div>
            </div>
            <div className="feature-list">
              {(product.features ?? []).map((feature) => <div key={feature} className="feature-item">{feature}</div>)}
            </div>
          </div>
        </div>

        <aside className="purchase-card glass-card-light">
          <div className="small-muted">Premium listing</div>
          <div className="detail-price">${product.price.toFixed(2)}</div>
          <div className="product-meta"><span>Rating</span><span className="stars">★★★★★ {product.rating.toFixed(1)}</span></div>
          <div className="product-meta"><span>Offers</span><span>{product.offers}</span></div>
          <div className="product-meta"><span>Payment</span><span>bKash or Nagad send money</span></div>
          <Link href={`/checkout/${product.id}`} className="admin-primary-btn" style={{ textAlign: 'center' }}>Buy now</Link>
          <button type="button" className="admin-ghost-btn" style={{ textAlign: 'center' }} onClick={quickAdd}>Add to cart</button>
          {cartMessage && <div className="small-muted" style={{color:'#16a34a',textAlign:'center'}}>{cartMessage}</div>}
          <Link href="/marketplace" className="admin-ghost-btn" style={{ textAlign: 'center' }}>Back to marketplace</Link>
        </aside>
      </div>
    </main>
    <Footer />
  </>;
}
