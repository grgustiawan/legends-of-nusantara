'use client';
import { useState, useEffect, useRef } from 'react';
import ParallaxBackground from '@/components/ParallaxBackground';
import BackgroundMusic from '@/components/BackgroundMusic';
import FireParticles from '@/components/FireParticles';
import styles from './page.module.css';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function MenuClient({ events, user }: { events: any[], user?: any }) {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const activeEvent = events[activeEventIndex];
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      const audio = new Audio('/sounds/switch.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
    }
  }, [activeEventIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setActiveEventIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setActiveEventIndex(prev => Math.min(events.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [events.length]);

  return (
    <div className={styles.dashboard}>
      <ParallaxBackground />
      <FireParticles />
      <BackgroundMusic src="/sounds/main-screen.mp3" volume={1} />

      <div className={styles.leftSidebar}>
        <div style={{ marginTop: '10px', marginBottom: '30px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
        </div>

        <Link href="/menu" className={`${styles.iconBtn} ${styles.active}`} title="Menu">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z" />
          </svg>
        </Link>
        <Link href="/trade" className={styles.iconBtn} title="Trade">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
          </svg>
        </Link>
        <Link href="/profile" className={styles.iconBtn} title="Profile">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </Link>
      </div>

      <div className={styles.mainArea} style={{ padding: '40px' }}>
        <div className={styles.header}>
          <div></div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className={styles.profileSection}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '5px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user?.username || 'Pahlawan'}</span>
                <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Lvl. 42</span>
              </div>
              <img src={user?.profileImage || "/images/13_Airlangga.jpeg"} className={styles.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        <div className={styles.contentWrapper} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

          <div className={styles.eventLayoutContainer}>
            <div className={styles.eventImageWrapper}>
              <div
                className={styles.eventImageInner}
                style={{
                  backgroundImage: `url(${activeEvent?.eventImage || '/images/card_background.png'})`
                }}
              />

              <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
              }} />
            </div>

            <div className={styles.eventListPanel}>
              <div className={styles.eventListInner}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {events.length > 0 ? events.map((event, index) => {
                    const isActive = index === activeEventIndex;
                    return (
                      <div key={event.id} style={{ position: 'relative' }}>
                        <div
                          onClick={() => setActiveEventIndex(index)}
                          style={{
                            fontSize: isActive ? '1.8rem' : '1.3rem',
                            color: isActive ? '#fde047' : '#94a3b8',
                            fontFamily: 'var(--font-cinzel), serif',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            textShadow: isActive ? '0 0 15px rgba(253, 224, 71, 0.6)' : 'none',
                            opacity: isActive ? 1 : 0.6
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.opacity = '0.6';
                          }}
                        >
                          {event.name}
                        </div>

                        {isActive && (
                          <div style={{
                            height: '2px',
                            width: '100%',
                            background: 'linear-gradient(to right, rgba(253,224,71,1), transparent)',
                            marginTop: '5px',
                            boxShadow: '0 0 10px rgba(253, 224, 71, 0.8)'
                          }} />
                        )}

                        {isActive && (
                          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', animation: 'fadeIn 0.5s' }}>
                            <Link href={`/gacha/${event.id}`} style={{
                              padding: '10px 25px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(253, 224, 71, 0.5)',
                              color: '#fde047',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              letterSpacing: '2px',
                              textTransform: 'uppercase',
                              transition: 'all 0.2s',
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(253, 224, 71, 0.2)';
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(253, 224, 71, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              Play
                            </Link>
                            <Link href={`/showcase/${event.id}`} style={{
                              padding: '10px 25px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              letterSpacing: '2px',
                              textTransform: 'uppercase',
                              transition: 'all 0.2s',
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              }}
                            >
                              Showcase
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <div style={{ color: 'white' }}>Tidak ada event aktif.</div>
                  )}
                </div>

              </div>
            </div>

          </div>

          <div style={{ marginTop: '30px', color: '#cbd5e1', fontSize: '1rem', letterSpacing: '1px', textTransform: 'lowercase', fontStyle: 'italic', opacity: 0.8, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {activeEvent?.description || 'redeem your exclusive content now'}
          </div>

        </div>
      </div>

      <form action={logout} className={styles.logoutFormContainer}>
        <button type="submit" style={{
          padding: '10px 25px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(253, 224, 71, 0.5)',
          color: '#fde047',
          textDecoration: 'none',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(253, 224, 71, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(253, 224, 71, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(253, 224, 71, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(253, 224, 71, 0.5)';
          }}
          title="Logout">
          Logout
        </button>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
