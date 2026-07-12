'use client';

import { useState, useEffect } from 'react';
import styles from './DarkFogParticles.module.css';

export default function DarkFogParticles() {
  const [particles, setParticles] = useState<{ id: number; left: string; animationDuration: string; animationDelay: string; transform: string }[]>([]);

  useEffect(() => {
    const p = [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${10 + Math.random() * 15}s`,
      animationDelay: `${Math.random() * 10}s`,
      transform: `scale(${0.5 + Math.random() * 1.5})`
    }));

    setParticles(p);
  }, []);

  return (
    <div className={styles.particleContainer}>
      <div className={styles.smokeLayer}></div>
      <div className={`${styles.fogLayer} ${styles.fog1}`}></div>
      <div className={`${styles.fogLayer} ${styles.fog2}`}></div>

      {particles.map(p => (
        <div
          key={p.id}
          className={styles.darkParticle}
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            transform: p.transform
          }}
        ></div>
      ))}
    </div>
  );
}
