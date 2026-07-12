'use client';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { usePoints } from '@/hooks/usePoints';
import { getUserProfile } from '@/app/actions/profile';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { points } = usePoints();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) { }
    };
    fetchUser();
    window.addEventListener('profile_updated', fetchUser);
    return () => window.removeEventListener('profile_updated', fetchUser);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/menu">
          <span className={styles.titleOrnament}>&lt;</span>
          GLN
          <span className={styles.titleOrnament}>&gt;</span>
        </Link>
      </div>
      <div className={styles.links}>
        <Link href="/menu" className={styles.navLink}>Beranda</Link>
        <Link href="/trade" className={styles.navLink}>Trade</Link>
      </div>
      <div className={styles.profile}>
        <div className={styles.coinBadge}>
          <div className={styles.coinIcon}></div>
          {points.toLocaleString('id-ID')}
        </div>
        <Link href="/profile" className={styles.avatar} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={user?.profileImage || '/images/13_Airlangga.jpeg'}
            alt={user?.username || 'Profile'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>
      </div>
    </nav>
  );
}
