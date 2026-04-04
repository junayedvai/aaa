'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn } from 'lucide-react';

type AdminLoginFormProps = {
  authConfigured: boolean;
};

export default function AdminLoginForm({ authConfigured }: AdminLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: 'Login failed.' }));
        setError(body.message || 'Login failed.');
        return;
      }

      router.refresh();
    } catch {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="admin-shell"><div className="container"><section className="glass-card admin-login-card">
    <div className="admin-kicker"><ShieldCheck size={16} /> Protected admin access</div>
    <h1 style={{ margin: 0 }}>Cosmic Vault Portal</h1>
    <p className="admin-muted">Enter the admin username and password to manage products, payment settings, and order notifications.</p>
    {!authConfigured && <div className="admin-note">Admin auth is not configured yet. Set <strong>ADMIN_USERNAME</strong>, <strong>ADMIN_PASSWORD</strong>, and <strong>JWT_SECRET</strong> in Vercel before deploying publicly.</div>}
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <input
        autoFocus
        type="text"
        placeholder="Admin username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        style={{ width: '100%', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(8,12,30,.75)', color: 'white', borderRadius: 14, padding: '12px 14px' }}
      />
      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        style={{ width: '100%', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(8,12,30,.75)', color: 'white', borderRadius: 14, padding: '12px 14px' }}
      />
      <button className="admin-primary-btn" disabled={loading}>{loading ? 'Signing in...' : <><LogIn size={16} /> Sign in</>}</button>
      {error && <div className="admin-note" style={{ color: '#fca5a5' }}>{error}</div>}
    </form>
  </section></div></main>;
}