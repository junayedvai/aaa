'use client';
import { useSiteData } from '@/components/SiteDataProvider';

export default function Footer() {
  const { content: site } = useSiteData();

  return <footer className="footer">
    <div className="container">
      <div className="footer-top-logos"><span>bKash</span><span>Nagad</span><span>Visa</span><span>Mastercard</span><span>Google Pay</span><span>Apple Pay</span><span>Secure checkout</span></div>
      <div className="footer-grid">
        <div><h4>{site.settings.brandName}</h4><ul><li>{site.settings.tagline}</li><li>Premium marketplace UI</li><li>Editable admin control</li><li>Fast order workflow</li></ul></div>
        <div><h4>Support</h4><ul><li>Email: {site.settings.adminEmail}</li><li>WhatsApp: {site.settings.whatsapp}</li><li>Call: {site.settings.phone}</li><li>{site.settings.orderNotice}</li></ul></div>
        <div><h4>Payment</h4><ul><li>bKash Send Money — {site.settings.bkashNumber}</li><li>Nagad Send Money — {site.settings.nagadNumber}</li><li>Submit transaction ID</li><li>Manual verification flow</li></ul></div>
        <div><h4>Admin</h4><ul><li>Manage products</li><li>Edit filters</li><li>Change image links</li><li>Premium dashboard</li></ul></div>
      </div>
      <div className="small-muted" style={{textAlign:'center',paddingTop:10}}>Copyright © 2026 {site.settings.websiteName || site.settings.brandName}. Designed with Next.js marketplace flow.</div>
    </div>
  </footer>;
}
