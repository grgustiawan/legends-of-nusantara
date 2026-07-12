import React from 'react';
import styles from '@/app/gacha/page.module.css';
import GoldParticles from '@/components/GoldParticles';

interface TradeRevealModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  pulledCards: any[];
  onClose?: () => void;
}

export default function TradeRevealModal({
  showModal,
  setShowModal,
  pulledCards,
  onClose
}: TradeRevealModalProps) {
  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={pulledCards.length > 1 ? `${styles.revealFrame} ${styles.revealFrame10}` : `${styles.revealFrame} ${styles.revealFrame1}`}>
        {pulledCards.some(c => c.rarity === 'SSR') && <GoldParticles />}

        {pulledCards.length > 0 && (
          <div className={styles.revealTitle}>
            {pulledCards.length}-CARD TRADE RESULTS
          </div>
        )}

        {pulledCards.length > 0 ? (
          <div className={pulledCards.length > 1 ? styles.tenPullGrid : styles.singlePullGrid}>
            {pulledCards.map((card, idx) => (
              <div key={card.pullId || card.id || idx} className={pulledCards.length > 1 ? styles.tenPullCardWrapper : `${styles.tenPullCardWrapper} ${styles.singleCardFix || ''}`}>
                <div className={`${styles.revealedCardWrapper} ${card.rarity === 'SSR' ? styles.goldBorderSSR : ''
                  } ${card.rarity === 'SSR' || card.rarity === 'SR' ? styles.shiningCard : ''
                  } ${card.rarity === 'SSR' || card.rarity === 'SR' ? styles.shader : ''}`}>
                  <img src={card.image} alt="Trade Card" className={styles.revealedImage} />

                  {(card.rarity === 'SSR' || card.rarity === 'SR') && (
                    <div className={`${styles.shaderLayer} ${styles.specular} ${card.rarity === 'SSR' ? styles.gradientLegendary : styles.gradientEpic}`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <button className={styles.claimBtn} onClick={handleClose}>
          CLAIM & CONTINUE
        </button>
      </div>
    </div>
  );
}
