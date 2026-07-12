import Navbar from '@/components/Navbar';

export default function InventoryPage() {
  const cards = [
    { id: 1, name: 'Gajah Mada', rarity: 'legendary', element: 'Tanah' },
    { id: 2, name: 'Gatotkaca', rarity: 'epic', element: 'Udara' },
    { id: 3, name: 'Ken Arok', rarity: 'rare', element: 'Api' },
    { id: 4, name: 'Prajurit Majapahit', rarity: 'common', element: 'Logam' },
  ];

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'legendary': return 'var(--rarity-legendary)';
      case 'epic': return 'var(--rarity-epic)';
      case 'rare': return 'var(--rarity-rare)';
      default: return 'var(--rarity-common)';
    }
  };

  return (
    <>
      <Navbar />
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Koleksi Pahlawan</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {cards.map(card => (
            <div key={card.id} className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderTop: `4px solid ${getRarityColor(card.rarity)}` }}>
              <div style={{ width: '100%', aspectRatio: '3/4', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem' }}>🎴</span>
              </div>
              <h3 style={{ marginBottom: '5px' }}>{card.name}</h3>
              <p style={{ color: getRarityColor(card.rarity), textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{card.rarity}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
