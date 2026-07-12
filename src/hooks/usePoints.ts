'use client';

import { useState, useEffect } from 'react';
import { getUserWallet } from '@/app/actions/gacha';

export function usePoints() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const balance = await getUserWallet();
        if (balance !== null) {
          setPoints(balance);
        }
      } catch (err) {
        console.error('Failed to fetch wallet balance', err);
      }
    };

    fetchPoints();

    window.addEventListener('points_updated', fetchPoints);

    return () => {
      window.removeEventListener('points_updated', fetchPoints);
    };
  }, []);

  const deduct = (amount: number) => {
    setPoints(prev => Math.max(0, prev - amount));
    window.dispatchEvent(new Event('points_updated'));
  };

  return { points, deduct, setPoints };
}
