'use client';

import { useEffect, useState } from 'react';
import styles from './GoldParticles.module.css';

export default function GoldParticles() {
  const [particles, setParticles] = useState<{ id: number; left: string; top: string; animationDuration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    const p = [];
    for (let i = 0; i < 80; i++) {
      p.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${2 + Math.random() * 3}s`,
        delay: `${Math.random() * 5}s`,
        size: `${2 + Math.random() * 6}px`
      });
    }

    setParticles(p);
  }, []);

  return (
    <div className={styles.particlesContainer}>
      <div className={`${styles.fogLayer} ${styles.fog1}`}></div>
      <div className={`${styles.fogLayer} ${styles.fog2}`}></div>

      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: p.animationDuration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
