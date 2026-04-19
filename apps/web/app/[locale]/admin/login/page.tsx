'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }

      if (!data.user) {
        setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
        return;
      }

      // Check role — must be ADMIN or STAFF
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (profile as any)?.role;
      if (!role || !['ADMIN', 'STAFF'].includes(role)) {
        await supabase.auth.signOut();
        setError('คุณไม่มีสิทธิ์เข้าถึงระบบ Admin');
        return;
      }

      // Redirect to admin dashboard
      router.push('/th/admin');
      router.refresh();
    } catch {
      setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100svh', background: 'var(--bg-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'var(--font-sans)',
    }}>
      {/* Background texture */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle at 20% 50%, #C17F4A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #9B6448 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#fff', marginBottom: '0.25rem' }}>
            Eight Coffee
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: '1rem' }}>
            Roasters
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ERP Admin Panel
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--r-lg)',
            padding: '2.5rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              อีเมล
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@eightcoffee.co.th"
              required
              style={{
                width: '100%', padding: '0.85rem 1rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'var(--r-sm)', color: '#fff',
                fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              รหัสผ่าน
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '0.85rem 3rem 0.85rem 1rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--r-sm)', color: '#fff',
                  fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#fca5a5' }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            id="admin-login-btn"
            disabled={loading}
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.9rem', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'}
          </button>


        {/* Back to store */}
        <a href="/th" style={{ display: 'block', textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          ← กลับหน้าร้านค้า
        </a>
      </form>
    </div>
  </div>
  );
}
