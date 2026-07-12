'use client';
import { loginAsAdmin } from '@/app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

import { useActionState } from 'react';

const initialState = {
  error: '',
};

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAsAdmin, initialState);

  return (
    <div className={styles.container}>
      <img
        src="/majapahit.jpeg"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className={styles.formWrapper}>
        <div className={styles.logo}>
          L.O.N <span className={styles.logoHighlight}>ADMIN</span>
        </div>

        <form action={formAction} className={styles.loginForm} suppressHydrationWarning>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Login</label>
            <input
              type="text"
              name="email"
              defaultValue="admin@awanbox.biz.id"
              className={styles.input}
              suppressHydrationWarning
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Password</label>
            <input
              type="password"
              name="password"
              defaultValue="•••••••••••••"
              className={styles.input}
              suppressHydrationWarning
            />
            <button type="button" className={styles.eyeIcon} suppressHydrationWarning>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          {state?.error && (
            <div style={{ 
              color: '#f87171', 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 15px', 
              borderRadius: '6px', 
              fontSize: '0.9rem', 
              marginBottom: '15px', 
              textAlign: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              {state.error}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} suppressHydrationWarning>
            Login
          </button>
        </form>

        <div className={styles.backLink}>
          <Link href="/">
            &larr; Back to Player Login
          </Link>
        </div>
      </div>
    </div>
  );
}
