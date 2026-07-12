import React from 'react';
import styles from '@/app/gacha/page.module.css';
import GoldParticles from '@/components/GoldParticles';

interface CardRevealModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  isSpinning: boolean;
  pulledCards: any[];
  eventCardBackground?: string;
  onClose?: () => void;
}

export default function CardRevealModal({
  showModal,
  setShowModal,
  isSpinning,
  pulledCards,
  eventCardBackground,
  onClose
}: CardRevealModalProps) {
  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={
        isSpinning
          ? styles.modalContentSpinning
          : (pulledCards.length > 1 ? `${styles.revealFrame} ${styles.revealFrame10}` : `${styles.revealFrame} ${styles.revealFrame1}`)
      }>
        {!isSpinning && pulledCards.some(c => c.rarity === 'SSR') && <GoldParticles />}
        {!isSpinning && pulledCards.length > 0 && (
          <div className={styles.revealTitle}>
            {pulledCards.length > 1 ? '10-CARD SUMMON RESULTS' : '1-CARD SUMMON RESULTS'}
          </div>
        )}
        {isSpinning ? (
          <div className={styles.flipAnimation} style={{ backgroundImage: `url(${eventCardBackground || '/images/card_background.png'})` }}></div>
        ) : pulledCards.length > 0 ? (
          <div className={pulledCards.length > 1 ? styles.tenPullGrid : styles.singlePullGrid}>
            {pulledCards.map((card, idx) => (
              <div key={card.pullId || card.id || idx} className={pulledCards.length > 1 ? styles.tenPullCardWrapper : `${styles.tenPullCardWrapper} ${styles.singleCardFix || ''}`}>
                {card.rarity === 'SSR' && <GoldParticles />}

                <div className={`${styles.revealedCardWrapper} ${card.rarity === 'SSR' ? styles.goldBorderSSR : ''
                  } ${card.rarity === 'SSR' || card.rarity === 'SR' ? styles.shiningCard : ''
                  } ${card.rarity === 'SSR' || card.rarity === 'SR' ? styles.shader : ''}`}>
                  <img src={card.image} alt="Pulled Card" className={styles.revealedImage} />

                  {(card.rarity === 'SSR' || card.rarity === 'SR') && (
                    <div className={`${styles.shaderLayer} ${styles.specular} ${card.rarity === 'SSR' ? styles.gradientLegendary : styles.gradientEpic}`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!isSpinning && (
          <button className={styles.claimBtn} onClick={handleClose}>
            CLAIM & CONTINUE
          </button>
        )}
      </div>
    </div>
  );
}
