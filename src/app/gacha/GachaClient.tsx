'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import BackgroundMusic from '@/components/BackgroundMusic';
import EvilEye from '@/components/EvilEyes';
import FireParticles from '@/components/FireParticles';
import GoldParticles from '@/components/GoldParticles';
import PurpleParticles from '@/components/PurpleParticles';
import CardRevealModal from '@/components/CardRevealModal';
import NotificationModal from '@/components/NotificationModal';
import { executeGachaPull } from '@/app/actions/gacha';

function groupCards(cards: { id: number; image: string; points: string; count: number }[]) {
  const map = new Map();
  cards.forEach(card => {
    if (map.has(card.image)) {
      map.get(card.image).count += card.count;
    } else {
      map.set(card.image, { ...card });
    }
  });
  return Array.from(map.values());
}

export default function GachaClient({ event, inventory, initialPoints }: { event: any, inventory: any[], initialPoints: number }) {
  const [points, setPoints] = useState(initialPoints);
  const [currentInventory, setCurrentInventory] = useState(inventory);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [pulledCards, setPulledCards] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cardsS = currentInventory.filter(i => i.rarity === 'SSR').map(c => ({ id: c.itemId, image: c.imagePath, points: '47,162 DP', count: 1 }));
  const cardsA = currentInventory.filter(i => i.rarity === 'SR').map(c => ({ id: c.itemId, image: c.imagePath, points: '47,162 DP', count: 1 }));
  const cardsB = currentInventory.filter(i => i.rarity === 'R').map(c => ({ id: c.itemId, image: c.imagePath, points: '47,162 DP', count: 1 }));
  const cardsC = currentInventory.filter(i => i.rarity === 'N').map(c => ({ id: c.itemId, image: c.imagePath, points: '41,162 DP', count: 1 }));

  useEffect(() => {
    audioRef.current = new Audio('/sounds/spin-gacha.mp3');
  }, []);

  const handleSpin = async (count: number, cost: number) => {
    if (isSpinning) return;

    if (!event.items || event.items.length === 0) {
      setNotificationMessage('Event ini belum memiliki item apapun. Gacha tidak bisa dilakukan.');
      setShowNotification(true);
      return;
    }
    if (points < cost) {
      setNotificationMessage('Points tidak cukup!');
      setShowNotification(true);
      return;
    }

    setPoints(prev => prev - cost);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    setIsSpinning(true);
    setShowModal(true);
    setPulledCards([]);

    try {
      const pullResult = await executeGachaPull(event.id, count);

      const spinDuration = Math.floor(Math.random() * 2000) + 3000;

      setTimeout(() => {
        let bestRarityWeight = 0;
        let revealSound = '/sounds/common-items.mp3';

        const weightMap: Record<string, number> = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };

        const newPulledCards = pullResult.items.map((randomCard) => {
          let frontendRarity = 'N';
          if (randomCard.rarity === 'legendary') frontendRarity = 'SSR';
          if (randomCard.rarity === 'epic') frontendRarity = 'SR';
          if (randomCard.rarity === 'rare') frontendRarity = 'R';

          if (weightMap[randomCard.rarity] > bestRarityWeight) {
            bestRarityWeight = weightMap[randomCard.rarity];
            if (frontendRarity === 'SSR') revealSound = '/sounds/legendary-items.mp3';
            else if (frontendRarity === 'SR') revealSound = '/sounds/epic-items.mp3';
            else if (frontendRarity === 'R') revealSound = '/sounds/rare-items.mp3';
            else revealSound = '/sounds/common-items.mp3';
          }

          return {
            ...randomCard,
            rarity: frontendRarity
          };
        });

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const sound = new Audio(revealSound);
        sound.play().catch(e => console.log('Reveal audio blocked:', e));

        setPulledCards(newPulledCards);
        setPoints(pullResult.newBalance);

        window.dispatchEvent(new Event('points_updated'));

        const newInventoryItems = newPulledCards.map(c => ({
          id: Math.random().toString(),
          itemId: c.itemId,
          title: c.name,
          imagePath: c.image,
          rarity: c.rarity,
        }));
        setCurrentInventory(prev => [...newInventoryItems, ...prev]);

        setIsSpinning(false);
      }, spinDuration);

    } catch (error: any) {
      setNotificationMessage('Gagal melakukan gacha: ' + error.message);
      setShowNotification(true);
      setIsSpinning(false);
      setShowModal(false);
      setPoints(points);
    }
  };

  return (
    <div className={styles.pageContainer} style={{ backgroundImage: `url(${event.gachaBackground || '/gacha-screen.jpeg'})` }}>
      <Navbar />
      <BackgroundMusic src="/sounds/background-music-3.mp3" volume={showModal ? 0.1 : 0.5} />

      <div className={styles.eyesWrapper}>
        <EvilEye
          eyeColor="#FF6F37"
          intensity={1.5}
          pupilSize={0.6}
          irisWidth={0.25}
          glowIntensity={0.35}
          scale={0.8}
          noiseScale={1}
          pupilFollow={1}
          flameSpeed={1}
          backgroundColor="#120F17"
        />
      </div>

      <FireParticles />

      <main className={styles.mainContent}>
        <section className={styles.bannerSection}>
          <div className={styles.bannerImage}>
            <img
              src={event.cardBackground || "/images/card_background.png"}
              alt={event.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
          <div className={styles.gachaButtons}>
            <button onClick={() => handleSpin(10, event.costPerPull * 10)} className={styles.gachaBtn} style={{ background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)' }}>
              10 Spin
              <span><span className={styles.pointIcon}></span> {event.costPerPull * 10} PT</span>
            </button>
            <button onClick={() => handleSpin(1, event.costPerPull)} className={styles.gachaBtn} style={{ background: 'linear-gradient(180deg, #f8fafc, #cbd5e1)', color: '#0f172a' }}>
              1 Spin
              <span><span className={styles.pointIcon}></span> {event.costPerPull} PT</span>
            </button>
          </div>
        </section>

        <div style={{ textAlign: 'center', color: '#fff', fontSize: '1.2rem', marginBottom: '20px', fontFamily: 'var(--font-cinzel)' }}>
          Saldo Saat Ini: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{points.toLocaleString('id-ID')} Koin</span>
        </div>

        <section className={styles.raritySection}>
          <h2 className={`${styles.rarityTitle} ${styles.titleS}`}></h2>
          <div className={styles.gridS}>
            {groupCards(cardsS).map((card) => (
              <div key={card.id} className={`${styles.card} ${styles.cardS} ${card.count > 1 ? styles.cardStacked : ''} ${styles.shader} ${styles.shiningCard}`}>
                <div className={styles.cardImageWrapper}>
                  <img src={card.image} alt="Card" className={styles.cardImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {card.count > 1 && (
                    <div className={styles.cardBadge}>x{card.count}</div>
                  )}
                  <div className={`${styles.shaderLayer} ${styles.specular} ${styles.gradientLegendary}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.raritySection}>
          <h2 className={`${styles.rarityTitle} ${styles.titleA}`}>Epic</h2>
          <div className={styles.gridNormal}>
            {groupCards(cardsA).map((card) => (
              <div key={card.id} className={`${styles.card} ${styles.cardA} ${card.count > 1 ? styles.cardStacked : ''} ${styles.shader} ${styles.shiningCard}`}>
                <div className={styles.cardImageWrapper}>
                  <img src={card.image} alt="Card" className={styles.cardImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {card.count > 1 && (
                    <div className={styles.cardBadge}>x{card.count}</div>
                  )}
                  <div className={`${styles.shaderLayer} ${styles.specular} ${styles.gradientEpic}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.raritySection}>
          <h2 className={`${styles.rarityTitle} ${styles.titleB}`}>Rare</h2>
          <div className={styles.gridNormal}>
            {groupCards(cardsB).map((card) => (
              <div key={card.id} className={`${styles.card} ${styles.cardB} ${card.count > 1 ? styles.cardStacked : ''}`}>
                <div className={styles.cardImageWrapper}>
                  <img src={card.image} alt="Card" className={styles.cardImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {card.count > 1 && (
                    <div className={styles.cardBadge}>x{card.count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.raritySection}>
          <h2 className={`${styles.rarityTitle} ${styles.titleC}`}>Common</h2>
          <div className={styles.gridNormal}>
            {groupCards(cardsC).map((card) => (
              <div key={card.id} className={`${styles.card} ${styles.cardC} ${card.count > 1 ? styles.cardStacked : ''}`}>
                <div className={styles.cardImageWrapper}>
                  <img src={card.image} alt="Card" className={styles.cardImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {card.count > 1 && (
                    <div className={styles.cardBadge}>x{card.count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CardRevealModal
        showModal={showModal}
        setShowModal={setShowModal}
        isSpinning={isSpinning}
        pulledCards={pulledCards}
        eventCardBackground={event?.cardBackground}
      />
      <NotificationModal
        show={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}
