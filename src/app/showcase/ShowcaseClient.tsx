'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import BackgroundMusic from '@/components/BackgroundMusic';
import ElectricBorder from '@/components/ElectricBorder';
import DarkFogParticles from '@/components/DarkFogParticles';

export default function ShowcaseClient({ cardsData, showcaseBackground, cardBackground }: { cardsData: any[], showcaseBackground?: string | null, cardBackground?: string | null }) {
  const [filter, setFilter] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredCards = filter === 'All'
    ? cardsData
    : cardsData.filter(card => card.rarity === filter);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setActiveIndex(0);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveIndex(prev => Math.max(0, prev - 1));
    } else {
      setActiveIndex(prev => Math.min(filteredCards.length - 1, prev + 1));
    }
  };

  const getStars = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return '★★★★★';
      case 'SR': return '★★★★';
      case 'R': return '★★★';
      default: return '★★';
    }
  };

  const getBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return '#EFBF04';
      case 'SR': return '#7F00FF';
      case 'R': return '#6395EE';
      default: return null;
    }
  };

  return (
    <div className={styles.showcaseWrapper} style={{ backgroundImage: `url(${showcaseBackground || '/gacha-screen.jpeg'})` }}>
      <DarkFogParticles />
      <BackgroundMusic src="/sounds/background-music-2.mp3" volume={1} />

      <div className={styles.topBar}>
        <div className={styles.headerTitle}>
          <span className={styles.titleOrnament}>&lt;</span>
          Showcase
          <span className={styles.titleOrnament}>&gt;</span>
        </div>

        <div className={styles.topRight}>
          <Link href="/menu" className={styles.exitBtn} title="Back to Menu">
            &rarr;
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        {['All', 'SSR', 'SR', 'R', 'N'].map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => handleFilterChange(f)}
          >
            {f === 'All' ? 'All'
              : f === 'SSR' ? 'Legendary'
                : f === 'SR' ? 'Epic'
                  : f === 'R' ? 'Rare'
                    : f === 'N' ? 'Common' : f}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'flex', width: '100%', overflow: 'hidden' }}>
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={() => scrollCarousel('left')}
          style={{ opacity: activeIndex === 0 ? 0.3 : 1, pointerEvents: activeIndex === 0 ? 'none' : 'auto' }}
        >
          &#10094;
        </button>
        <button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={() => scrollCarousel('right')}
          style={{ opacity: activeIndex === filteredCards.length - 1 ? 0.3 : 1, pointerEvents: activeIndex === filteredCards.length - 1 ? 'none' : 'auto' }}
        >
          &#10095;
        </button>

        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack}>
            {filteredCards.map((card, index) => {
              const offset = index - activeIndex;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible && Math.abs(offset) > 3) return null;

              let dataOffset = `${offset}`;
              if (Math.abs(offset) > 2) {
                dataOffset = offset > 0 ? "out-right" : "out-left";
              }

              const borderColor = getBorderColor(card.rarity);

              const innerContent = (
                <>
                  <div className={styles.cardHeader}>
                    {card.title}
                  </div>

                  <div className={styles.cardImageWrapper}>
                    <img
                      src={card.imagePath}
                      alt={card.title}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  </div>

                  <div className={styles.cardStats}>
                    <div className={styles.statRow}>
                      <span>Rarity</span>
                      <span className={styles.stars}>{getStars(card.rarity)}</span>
                    </div>
                    <div className={styles.statRow}>
                      <span>Kategori</span>
                      <span className={styles.statValue}>{card.category}</span>
                    </div>
                    <div className={styles.statRow}>
                      <span>Status</span>
                      <span className={styles.statValue}>1 / 1</span>
                    </div>
                  </div>
                </>
              );

              return (
                <div
                  key={card.id}
                  className={`${styles.cardItem} ${offset === 0 ? styles.active : styles.inactive}`}
                  data-rarity={card.rarity}
                  data-offset={dataOffset}
                  onClick={() => {
                    if (offset !== 0) setActiveIndex(index);
                  }}
                  style={{
                    pointerEvents: isVisible ? 'auto' : 'none',
                    border: 'none',
                    backgroundColor: 'transparent',
                    boxShadow: 'none'
                  }}
                >
                  <div className={styles.flipWrapper} style={{ animationDelay: `${index * 0.4}s` }}>
                    <div className={styles.cardFront}>
                      {borderColor ? (
                        <ElectricBorder
                          color={borderColor}
                          speed={1}
                          chaos={0.12}
                          thickness={3}
                          borderRadius={12}
                          style={{ width: '100%', height: '100%', transition: 'all 0.5s ease' }}
                        >
                          <div className={card.rarity === 'SSR' || card.rarity === 'SR' ? `${styles.shader} ${styles.shiningCard}` : ''} style={{ width: '100%', height: '100%', backgroundColor: '#11151c', borderRadius: 12, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            {innerContent}
                            {(card.rarity === 'SSR' || card.rarity === 'SR') && (
                              <div className={`${styles.shaderLayer} ${styles.specular} ${card.rarity === 'SSR' ? styles.gradientLegendary : styles.gradientEpic}`}></div>
                            )}
                          </div>
                        </ElectricBorder>
                      ) : (
                        <div className={card.rarity === 'SSR' || card.rarity === 'SR' ? `${styles.shader} ${styles.shiningCard}` : ''} style={{ width: '100%', height: '100%', backgroundColor: '#11151c', borderRadius: 12, overflow: 'hidden', position: 'relative', border: '2px solid #5a5a4a', display: 'flex', flexDirection: 'column', boxShadow: offset === 0 ? '0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(253, 224, 71, 0.4)' : '0 10px 30px rgba(0,0,0,0.8)', transition: 'all 0.5s ease' }}>
                          {innerContent}
                          {(card.rarity === 'SSR' || card.rarity === 'SR') && (
                            <div className={`${styles.shaderLayer} ${styles.specular} ${card.rarity === 'SSR' ? styles.gradientLegendary : styles.gradientEpic}`}></div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBack} style={cardBackground ? { backgroundImage: `url(${cardBackground})` } : {}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
