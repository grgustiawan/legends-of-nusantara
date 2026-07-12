'use client';

import Link from 'next/link';
import { loginAsPlayer, registerAsPlayer } from '@/app/actions/auth';
import styles from './page.module.css';
import AmbientParticles from '@/components/AmbientParticles';
import { useActionState, useState } from 'react';

const initialState = {
  error: '',
};

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginState, loginAction] = useActionState(loginAsPlayer, initialState);
  const [registerState, registerAction] = useActionState(registerAsPlayer, initialState);

  const activeState = isLogin ? loginState : registerState;
  const activeAction = isLogin ? loginAction : registerAction;

  return (
    <div className={styles.container}>
      <video
        className={styles.videoBackground}
        autoPlay
        loop
        playsInline
      >
        <source src="/videos/lon.mp4" type="video/mp4" />
      </video>

      <div className={styles.videoOverlay}></div>
      <AmbientParticles />

      <div className={styles.heroSection}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        </div>
        <div className={styles.loginBox}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                background: 'none', border: 'none', color: isLogin ? '#fff' : '#888',
                fontSize: '1.2rem', fontWeight: isLogin ? 'bold' : 'normal',
                cursor: 'pointer', borderBottom: isLogin ? '2px solid #fde047' : 'none',
                paddingBottom: '5px'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                background: 'none', border: 'none', color: !isLogin ? '#fff' : '#888',
                fontSize: '1.2rem', fontWeight: !isLogin ? 'bold' : 'normal',
                cursor: 'pointer', borderBottom: !isLogin ? '2px solid #fde047' : 'none',
                paddingBottom: '5px'
              }}
            >
              Register
            </button>
          </div>

          <form action={activeAction}>
            <div className={styles.formContent}>
              <div className={styles.formGroup}>
                {!isLogin && (
                  <input type="text" name="username" placeholder="Username" className={styles.input} required />
                )}
                <input type="email" name="email" placeholder="Email" className={styles.input} required />
                <input type="password" name="password" placeholder="Password" className={styles.input} required />
              </div>

              {activeState?.error && (
                <div style={{ 
                  color: '#f87171', 
                  backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 15px', 
                  borderRadius: '6px', 
                  fontSize: '0.9rem', 
                  marginTop: '-5px', 
                  marginBottom: '15px', 
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  {activeState.error}
                </div>
              )}

              <div className={styles.adminLink}>
                <Link href="/admin/login">Login sebagai Admin</Link>
              </div>
            </div>

            <button type="submit" className={styles.loginBtn} aria-label={isLogin ? 'Masuk' : 'Daftar'} suppressHydrationWarning>
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
