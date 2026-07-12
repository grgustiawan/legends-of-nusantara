'use client';

import { useEffect, useRef } from 'react';

interface BackgroundMusicProps {
  src?: string;
  volume?: number;
}

export default function BackgroundMusic({ src = "/sounds/background-music.mp3", volume = 0.5 }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((err) => {
        console.warn('Autoplay might be blocked by browser. User needs to interact with the page first.', err);
      });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleEnded = () => {
    timeoutRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    }, 15000);
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      onEnded={handleEnded}
      preload="auto"
    />
  );
}
