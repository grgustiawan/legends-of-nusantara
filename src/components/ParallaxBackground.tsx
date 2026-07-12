'use client';

import { useEffect, useState } from 'react';
import styles from './ParallaxBackground.module.css';

export default function ParallaxBackground() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setOffset({ x: -x * 30, y: -y * 30 });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.parallaxContainer}>
      <div
        className={styles.parallaxImage}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      />
    </div>
  );
}
