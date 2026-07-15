'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import BackgroundMusic from '@/components/BackgroundMusic';
import DarkFogParticles from '@/components/DarkFogParticles';

export default function ShowcaseClient({ cardsData, showcaseBackground, cardBackground }: { cardsData: any[], showcaseBackground?: string | null, cardBackground?: string | null }) {
  const [filter, setFilter] = useState('SSR');
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const activeCard = filteredCards[activeIndex];

  const videoFileNames = [
    "01_Hayam_Wuruk.mp4",
    "02_Gajah_Mada.mp4",
    "03_Ken_Arok.mp4",
    "04_Nyi_Roro_Kidul.mp4",
    "05_Prabu_Siliwangi.mp4",
    "06_Garuda.mp4",
    "07_Rahwana.mp4",
    "08_Calon_Arang.mp4",
    "09_Gatotkaca.mp4",
    "10_Hanoman.mp4",
    "11_Dewi_Sri.mp4",
    "12_Barong.mp4",
    "13_Airlangga.mp4",
    "14_Raden_Wijaya.mp4",
    "15_Keris_Empu_Gandring.mp4",
    "16_Gayatri_Rajapatni.mp4",
    "17_Tribhuwana_Wijayatunggadewi.mp4",
    "18_Dyah_Pitaloka_Citraresmi.mp4",
    "19_Adityawarman.mp4",
    "20_Ken_Dedes.mp4",
    "21_Anusapati.mp4",
    "22_Kertanegara.mp4",
    "23_Balaputradewa.mp4",
    "24_Dapunta_Hyang_Sri_Jayanasa.mp4",
    "25_Sangkuriang.mp4",
    "26_Dayang_Sumbi.mp4",
    "27_Roro_Jonggrang.mp4",
    "28_Bandung_Bondowoso.mp4",
    "29_Rakai_Pikatan.mp4",
    "30_Damar_Wulan.mp4",
    "31_Menak_Jinggo.mp4",
    "32_Panji_Asmarabangun.mp4",
    "33_Dewi_Sekartaji.mp4",
    "34_Bima.mp4",
    "35_Arjuna.mp4",
    "36_Kresna.mp4",
    "37_Srikandi.mp4",
    "38_Rangda.mp4",
    "39_Putri_Ikan_Danau_Toba.mp4",
    "40_Sugriwa.mp4",
    "41_Nakula.mp4",
    "43_Yudhistira.mp4",
    "44_Drupadi.mp4",
    "45_Karna.mp4",
    "47_Sengkuni.mp4",
    "48_Semar.mp4",
    "49_Gareng.mp4",
    "51_Bagong.mp4",
    "52_Rama.mp4",
    "56_Ciung_Wanara.mp4",
    "58_Lutung_Kasarung.mp4",
    "59_Timun_Mas.mp4",
    "63_Malin_Kundang.mp4",
    "64_Bawang_Merah.mp4",
    "67_Patih_Nambi.mp4",
    "69_Lembu_Sora.mp4",
    "70_Empu_Gandring.mp4",
    "71_Batara_Guru.mp4",
    "73_Dewi_Uma.mp4",
    "74_Naga_Antaboga.mp4",
    "75_Baru_Klinthing.mp4",
    "77_Prajurit_Pajajaran.mp4",
    "83_Pendeta_Hindu_Majapahit.mp4",
    "90_Prajurit_Wanita_Bali_Aga.mp4",
    "01_Cakra_Surya_Majapahit.mp4",
    "02_Keris_Kyai_Setan_Kober.mp4",
    "03_Keris_Nagasasra.mp4",
    "04_Kitab_Negarakertagama.mp4",
    "05_Mahkota_Ratu_Majapahit.mp4",
  ];

  const getVideoPath = (card: any) => {
    if (!card) return null;
    const formattedTitle = card.title.replace(/\s+/g, '_');
    const matchedFile = videoFileNames.find(f => f.replace(/^\d+_/, '').replace(/\.mp4$/i, '').toLowerCase() === formattedTitle.toLowerCase());
    return matchedFile ? `/videos/${matchedFile}` : null;
  };

  useEffect(() => {
    if (activeCard) {
      const newSrc = getVideoPath(activeCard);
      if (newSrc && videoRef.current && videoRef.current.getAttribute('src') !== newSrc) {
        videoRef.current.src = newSrc;
        videoRef.current.load();

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Autoplay prevented:", e);
            }
          });
        }
      }
    }
  }, [activeIndex, activeCard]);

  return (
    <div className={styles.showcaseWrapper} style={{ backgroundImage: `url(${showcaseBackground || '/inventory.png'})` }}>

      {/* Background Video or Fallback Image */}
      <div className={styles.videoBackground}>
        {getVideoPath(activeCard) ? (
          <video
            ref={videoRef}
            className={styles.fullscreenVideo}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className={styles.fallbackImageContainer}>
            <img
              src={activeCard?.imagePath}
              alt={activeCard?.title}
              className={styles.fallbackImage}
            />
          </div>
        )}
        <div className={styles.videoOverlay}></div>
      </div>

      <DarkFogParticles />
      <BackgroundMusic src="/sounds/main-screen.mp3" volume={1} />

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

      {/* Character Info */}
      {activeCard && (
        <div className={styles.characterInfoFloating}>
          <h1 className={styles.characterName}>{activeCard.title}</h1>
          <p className={styles.characterRarity}>{activeCard.rarity} - {activeCard.category}</p>
          {activeCard.lore && <p className={styles.characterLore}>{activeCard.lore}</p>}
        </div>
      )}

      {/* Carousel at the bottom */}
      <div className={styles.carouselSection}>
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
                      <div
                        className={card.rarity === 'SSR' || card.rarity === 'SR' ? `${styles.shader} ${styles.shiningCard}` : ''}
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#11151c',
                          borderRadius: 12,
                          overflow: 'hidden',
                          position: 'relative',
                          border: borderColor ? `2px solid ${borderColor}` : '2px solid #5a5a4a',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: offset === 0 ? (borderColor ? `0 15px 40px rgba(0,0,0,0.9), 0 0 20px ${borderColor}66` : '0 15px 40px rgba(0,0,0,0.9), 0 0 20px rgba(253, 224, 71, 0.4)') : '0 10px 30px rgba(0,0,0,0.8)',
                          transition: 'all 0.5s ease'
                        }}
                      >
                        {innerContent}
                        {(card.rarity === 'SSR' || card.rarity === 'SR') && (
                          <div className={`${styles.shaderLayer} ${styles.specular} ${card.rarity === 'SSR' ? styles.gradientLegendary : styles.gradientEpic}`}></div>
                        )}
                      </div>
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
