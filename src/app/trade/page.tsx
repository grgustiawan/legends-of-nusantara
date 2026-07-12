'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';
import { getUserInventory } from '@/app/actions/gacha';
import TradeRevealModal from '@/components/TradeRevealModal';
import BackgroundMusic from '@/components/BackgroundMusic';

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<'send' | 'incoming'>('send');
  const [incomingTrades, setIncomingTrades] = useState<any[]>([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isAlert: false,
    onConfirm: () => { }
  });

  const showAlert = (title: string, message: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isAlert: true,
      onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealedCards, setRevealedCards] = useState<any[]>([]);

  const [searchEmail, setSearchEmail] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'User not found');
      }

      setTargetUser(data.user);
    } catch (err: any) {
      setSearchError(err.message);
      setTargetUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [offeredItems, setOfferedItems] = useState<any[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getUserInventory().then(items => {
      setUserInventory(items);
    }).catch(err => console.error("Failed to load inventory:", err));
  }, []);

  const openInventoryModal = () => {
    setTempSelectedIds(new Set(offeredItems.map(i => i.id)));
    setIsInventoryOpen(true);
  };

  const toggleItemSelection = (id: string) => {
    setTempSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (newSet.size >= 10) {
          showAlert('Warning', 'Maximum 10 items can be sent in one trade.');
          return prev;
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const confirmSelection = () => {
    const selected = userInventory.filter(item => tempSelectedIds.has(item.id));
    setOfferedItems(selected);
    setIsInventoryOpen(false);
  };

  const removeOfferedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOfferedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStartTrade = async () => {
    if (!targetUser || offeredItems.length === 0) {
      showAlert('Warning', 'Select a partner and at least 1 card to trade.');
      return;
    }

    if (offeredItems.length > 10) {
      showAlert('Warning', 'Maximum 10 items can be sent in one trade.');
      return;
    }

    setIsTrading(true);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: targetUser.id,
          offeredItemIds: offeredItems.map(item => item.id)
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'An error occurred while starting the trade.');
      }

      showAlert('Success', 'Trade Request Sent Successfully!');
      setOfferedItems([]);
      setTargetUser(null);
      setSearchEmail('');

      getUserInventory().then(items => {
        setUserInventory(items);
      }).catch(err => console.error("Failed to load inventory:", err));

    } catch (err: any) {
      showAlert('Error', err.message);
    } finally {
      setIsTrading(false);
    }
  };

  const fetchIncomingTrades = async () => {
    setIsLoadingTrades(true);
    try {
      const res = await fetch('/api/trades/incoming');
      const data = await res.json();
      if (res.ok) {
        setIncomingTrades(data.trades);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTrades(false);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource('/api/trades/incoming/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.trades) {
          setIncomingTrades(prev => {
            if (data.trades.length > prev.length) {
              const audio = new Audio('/audio/notifications.mp3');
              audio.play().catch(e => console.warn('Audio play blocked:', e));
            }
            return data.trades;
          });
          setIsLoadingTrades(false);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleRespond = (tradeId: string, action: 'accept' | 'reject') => {
    const title = action === 'accept' ? 'Accept Offer' : 'Decline Offer';
    const message = `Are you sure you want to ${action} this offer?`;

    setConfirmModal({
      isOpen: true,
      title,
      message,
      isAlert: false,
      onConfirm: () => executeRespond(tradeId, action)
    });
  };

  const executeRespond = async (tradeId: string, action: 'accept' | 'reject') => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    try {
      const res = await fetch(`/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (action === 'accept' && data.items) {
        const cards = data.items.map((ui: any) => ({
          ...ui.item,
          image: ui.item.imageUrl,
          pullId: ui.id
        }));
        setRevealedCards(cards);
        setShowRevealModal(true);
      } else if (action === 'reject') {
        showAlert('Information', 'Trade declined.');
      }

      fetchIncomingTrades();

      if (action === 'accept') {
        getUserInventory().then(items => {
          setUserInventory(items);
        }).catch(err => console.error("Failed to load inventory:", err));
      }
    } catch (err: any) {
      showAlert('Error', err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <BackgroundMusic />
      <div className={styles.navWrapper}>
        <Navbar />
      </div>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'send' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('send')}
        >
          Send Offer
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'incoming' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('incoming')}
          style={{ position: 'relative' }}
        >
          Incoming Requests
          {incomingTrades.length > 0 && (
            <span className={styles.badge}>{incomingTrades.length}</span>
          )}
        </button>
      </div>

      <main className={styles.mainContent}>
        {activeTab === 'send' ? (
          <>
            <section className={styles.leftPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Card</h2>
              </div>

              <div className={styles.cardHand}>
                {offeredItems.map((slot, index) => (
                  <div
                    key={slot.id}
                    className={styles.cardInHand}
                    style={{
                      backgroundImage: `url(${slot.imagePath})`,
                      zIndex: index,
                      borderColor: slot.rarity === 'SSR' ? '#eab308' : slot.rarity === 'SR' ? '#a855f7' : 'rgba(255,255,255,0.4)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.7)', padding: '2px 5px', borderRadius: '3px', fontSize: '0.7rem', color: '#fde047', fontWeight: 'bold' }}>
                      {slot.rarity}
                    </div>

                    <button
                      className={styles.removeCardBtn}
                      onClick={(e) => removeOfferedItem(slot.id, e)}
                      title="Remove from list"
                    >
                      &times;
                    </button>

                    <div style={{ position: 'absolute', bottom: '0px', left: '0', right: '0', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.8)', fontSize: '0.7rem', padding: '5px', color: 'white', fontWeight: 'bold', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>
                      {slot.title}
                    </div>
                  </div>
                ))}

                <div
                  className={styles.addCardBtn}
                  onClick={openInventoryModal}
                  title="Choose Cards from Inventory"
                  style={{ zIndex: offeredItems.length }}
                >
                  <span style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>+</span>
                </div>
              </div>

              <div className={styles.filtersRow}>
                <span>FILTERS ▼</span>
                <span>⇕</span>
              </div>
            </section>

            <section className={styles.centerPanel}>
              <div className={styles.emblemWrapper}>
                <div className={styles.orbitingDots}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
                <div className={styles.mysticalEye}>
                  <div className={styles.pupilStar}></div>
                </div>
              </div>
            </section>

            <section className={styles.rightPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Trade Partner</h2>
              </div>

              {!targetUser ? (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>Search for a friend by email to start a trade.</p>
                  <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="email"
                      placeholder="Enter Friend's Email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      style={{
                        padding: '12px 15px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                      required
                    />
                    {searchError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{searchError}</div>}
                    <button type="submit" disabled={isSearching} style={{
                      padding: '12px 25px',
                      background: 'linear-gradient(180deg, #fde047, #b45309)',
                      border: '1px solid rgba(253, 224, 71, 0.5)',
                      color: '#fff',
                      textTransform: 'uppercase',
                      cursor: isSearching ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      opacity: isSearching ? 0.7 : 1
                    }}>
                      {isSearching ? 'Searching...' : 'Search Partner'}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={targetUser.profileImage || "/images/13_Airlangga.jpeg"}
                    alt="Avatar"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fde047', marginBottom: '15px' }}
                  />
                  <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0 0 5px 0', fontFamily: 'var(--font-cinzel)' }}>{targetUser.username}</h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '30px' }}>Partner Found</p>

                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      onClick={() => setTargetUser(null)}
                      className={styles.cancelBtn}
                      disabled={isTrading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartTrade}
                      className={styles.tradeBtn}
                      disabled={isTrading}
                    >
                      {isTrading ? 'Processing...' : 'Start Trade'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className={styles.incomingPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Incoming Requests</h2>
            </div>

            {isLoadingTrades ? (
              <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>
            ) : incomingTrades.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>No incoming offers.</div>
            ) : (
              <div className={styles.tradesList}>
                {incomingTrades.map(trade => (
                  <div key={trade.id} className={styles.tradeCard}>
                    <div className={styles.tradeHeader}>
                      <img src={trade.sender?.profileImage || "/images/13_Airlangga.jpeg"} alt="Sender" className={styles.senderAvatar} />
                      <div>
                        <div className={styles.senderName}>{trade.sender?.username || 'Unknown'}</div>
                        <div className={styles.tradeTime}>{new Date(trade.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className={styles.tradeItemsSection}>
                      <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '10px' }}>Offering {trade.items.length} Cards:</div>
                      <div className={styles.tradeItemsGrid}>
                        {trade.items.map((ti: any) => (
                          <div key={ti.id} className={styles.miniCard} style={{ backgroundImage: `url(${ti.userItem.item.imageUrl || '/images/card_background.png'})` }}>
                            <div className={styles.miniRarity}>{ti.userItem.item.rarity}</div>
                            <div className={styles.miniTitle}>{ti.userItem.item.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.tradeActions}>
                      <button onClick={() => handleRespond(trade.id, 'reject')} className={styles.rejectBtn}>Decline</button>
                      <button onClick={() => handleRespond(trade.id, 'accept')} className={styles.acceptBtn}>Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {isInventoryOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            background: '#121212',
            border: '2px solid rgba(253, 224, 71, 0.3)',
            borderRadius: '12px',
            width: '95%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)'
          }}>
            <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#fde047', fontFamily: 'var(--font-cinzel)', textTransform: 'uppercase', letterSpacing: '2px' }}>Select Cards</h2>
              <button onClick={() => setIsInventoryOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '40px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '30px', backgroundColor: '#18181a' }}>
              {userInventory.length > 0 ? userInventory.map(item => {
                const isSelected = tempSelectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    style={{
                      aspectRatio: '3/4',
                      backgroundImage: `url(${item.imagePath})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #fde047' : '2px solid rgba(255,255,255,0.1)',
                      boxShadow: isSelected ? '0 0 25px rgba(253, 224, 71, 0.5)' : '0 10px 20px rgba(0,0,0,0.6)',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '5px', right: '5px', background: '#fde047', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                      }}>✓</div>
                    )}
                    <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', padding: '2px 5px', borderRadius: '3px', fontSize: '0.7rem', color: '#fde047', fontWeight: 'bold' }}>
                      {item.rarity}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)', padding: '15px 5px 5px 5px', fontSize: '0.8rem', textAlign: 'center', color: 'white', fontWeight: 'bold'
                    }}>
                      {item.title}
                    </div>
                  </div>
                )
              }) : (
                <div style={{ color: '#aaa', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Inventory is empty. You do not own any cards yet.</div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button onClick={() => setIsInventoryOpen(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}>CANCEL</button>
              <button onClick={confirmSelection} style={{ padding: '10px 30px', background: 'linear-gradient(180deg, #fde047, #b45309)', border: '1px solid rgba(253,224,71,0.5)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'inherit' }}>CONFIRM ({tempSelectedIds.size})</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className={styles.confirmModalOverlay}>
          <div className={styles.confirmModalContent}>
            <h2 className={styles.confirmTitle}>{confirmModal.title}</h2>
            <p className={styles.confirmMessage}>{confirmModal.message}</p>
            <div className={styles.confirmActions}>
              {confirmModal.isAlert ? (
                <button
                  className={styles.confirmBtn}
                  onClick={confirmModal.onConfirm}
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={confirmModal.onConfirm}
                  >
                    Yes, Continue
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <TradeRevealModal
        showModal={showRevealModal}
        setShowModal={setShowRevealModal}
        pulledCards={revealedCards}
      />
    </div>
  );
}
