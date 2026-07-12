'use client';
import { useEffect } from 'react';

export default function GlobalClickAudio() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('button') || target.closest('a')) {
        const audio = new Audio('/sounds/ok.mp3');
        audio.play().catch(err => {
          console.log('Audio play failed', err);
        });
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, []);

  return null;
}
