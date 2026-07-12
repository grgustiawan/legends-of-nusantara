'use client';

import { useEffect, useState } from 'react';
import styles from './FireParticles.module.css';

export default function FireParticles() {
  const [particles, setParticles] = useState<{ id: number; left: string; animationDuration: string; delay: string; size: string }[]>([]);

  useEffect(() => {
    const p = [];

    for (let i = 0; i < 60; i++) {
      p.push({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${5 + Math.random() * 8}s`,
        delay: `${Math.random() * 5}s`,
        size: `${2 + Math.random() * 4}px`
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
            width: p.size,
            height: p.size,
            animationDuration: `${p.animationDuration}, 1.5s`,
            animationDelay: `${p.delay}, ${p.delay}`,
          }}
        />
      ))}
    </div>
  );
}
