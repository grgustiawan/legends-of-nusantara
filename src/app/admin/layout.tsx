'use client';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    if (!isClient) return false;
    return pathname === path;
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#1c100e',
      backgroundImage: 'linear-gradient(rgba(28, 16, 14, 0.85), rgba(28, 16, 14, 0.95)), url("/battlefield.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#e2e8f0',
      fontFamily: 'var(--font-inter), sans-serif'
    }}>

      <div style={{
        width: '80px',
        margin: '20px',
        borderRadius: '40px',
        background: '#120a09',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          <Link href="/admin" title="Dashboard">
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isActive('/admin') ? '#d83a3a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer', boxShadow: isActive('/admin') ? '0 0 15px rgba(216, 58, 58, 0.5)' : 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive('/admin') ? '#fff' : 'none'} stroke={isActive('/admin') ? 'none' : '#94a3b8'} strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
          </Link>
          <Link href="/admin/events" title="Events">
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isActive('/admin/events') ? '#d83a3a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer', boxShadow: isActive('/admin/events') ? '0 0 15px rgba(216, 58, 58, 0.5)' : 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive('/admin/events') ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </Link>
          <Link href="/admin/items" title="Items">
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isActive('/admin/items') ? '#d83a3a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer', boxShadow: isActive('/admin/items') ? '0 0 15px rgba(216, 58, 58, 0.5)' : 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive('/admin/items') ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </Link>
          <Link href="/admin/history" title="History">
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isActive('/admin/history') ? '#d83a3a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer', boxShadow: isActive('/admin/history') ? '0 0 15px rgba(216, 58, 58, 0.5)' : 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive('/admin/history') ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
          </Link>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <form action={logout}>
            <button type="submit" title="Logout" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#261513', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '10px 20px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '0.5px' }}>
            <span style={{ color: '#d83a3a' }}>Welcome,</span> ADMIN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

          </div>
        </header>

        <main style={{ flex: 1, padding: '0 20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
