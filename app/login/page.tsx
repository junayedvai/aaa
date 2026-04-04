import Link from 'next/link';

export default function LoginPage() {
  return <main className="login-page"><div className="login-card"><div className="body" style={{textAlign:'center'}}>
    <div style={{fontSize:34,fontWeight:800,color:'#b91c1c',marginBottom:10}}>No Public Login Needed</div>
    <div className="small-muted" style={{fontSize:16, marginBottom:24}}>Customers can browse products and place orders directly without creating an account.</div>
    <div style={{display:'grid', gap:12}}>
      <Link href="/marketplace" className="login-submit" style={{textDecoration:'none'}}>Go to Marketplace</Link>
      <Link href="/" className="social-btn" style={{textDecoration:'none'}}>Return to Home</Link>
    </div>
  </div></div></main>;
}
