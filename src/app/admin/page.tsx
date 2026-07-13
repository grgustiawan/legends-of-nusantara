'use client';
import { Box, ChessQueen, CircleDollarSign, Diamond, Dices, Gem, TicketCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading live data...</div>;
  }

  return (
    <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', paddingBottom: '40px' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="admin-dashboard-banner" style={{
          position: 'relative',
          height: '320px',
          borderRadius: '30px',
          overflow: 'hidden',
          background: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url("${data?.topEvent?.eventImage || '/majapahit.jpeg'}") center/cover`,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <span style={{ padding: '8px 16px', background: 'rgba(216, 58, 58, 0.2)', color: '#ef4444', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Featured</span>
            <span style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
              <ChessQueen color="#ceb218ff" size={20} />
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1, textShadow: '0 5px 15px rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>
            {data?.topEvent?.name || 'LEGENDA NUSANTARA'}
          </h1>
          <p style={{ color: '#cbd5e1', marginTop: '15px', maxWidth: '400px', fontSize: '1rem', lineHeight: 1.5 }}>
            {data?.topEvent?.description || 'Gacha edisi terbatas. Dapatkan Item Langka sekarang!'}
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '25px', alignItems: 'center' }}>
            <div style={{ padding: '8px 20px', background: '#fff', color: '#000', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Dices color="#000" size={20} /> +{(data?.topEvent?.totalPulls || data?.totalPulls || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 600 }}>Pulls Terbaru</h2>
          </div>

          <div className="admin-dashboard-pulls" style={{ display: 'flex', gap: '20px' }}>
            {data?.recentPulls?.filter((p: any) => p.rarity !== 'common').slice(0, 2).map((pull: any, i: number) => (
              <div key={i} style={{ flex: 1, height: '420px', borderRadius: '25px', background: `linear-gradient(to top, rgba(0,0,0,0.9), transparent), url("${pull.imageUrl}") center/cover`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</div>
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>🔖</div>

                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 5px 0' }}>{pull.itemName}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 10px 0' }}>Didapatkan oleh {pull.username}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Beberapa saat lalu</p>
              </div>
            )) || (
                <div style={{ color: '#94a3b8' }}>Belum ada tarikan rare terbaru.</div>
              )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: '#120a09', borderRadius: '20px', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <TicketCheck color='#fff' size={20} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Active Event</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>{data?.activeEvents?.toLocaleString() || 0} Event</p>
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>›</div>
          </div>

          <div style={{ background: '#120a09', borderRadius: '20px', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <Users color='#fff' size={20} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Active User</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>{data?.activeUsers?.toLocaleString() || 0} Pemain</p>
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>›</div>
          </div>

          <div style={{ background: '#120a09', borderRadius: '20px', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <CircleDollarSign color='#fff' size={20} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.1rem' }}>Total Point Transaction</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>{data?.totalPointTransactions?.toLocaleString() || 0} Transaksi</p>
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>›</div>
          </div>

        </div>

        <div style={{ flex: 1, background: '#120a09', borderRadius: '30px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 600, margin: 0 }}>Statistik Utama</h2>
            <span style={{ color: '#94a3b8' }}>→</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '220px', height: '220px', borderRadius: '50%',
              background: 'conic-gradient(#ef4444 0% 75%, #3e221f 75% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: '#120a09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Total Pemasukan</span>
                <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{data?.totalPemasukan}</span>
              </div>
            </div>
          </div>

          <div className="admin-stats-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ef4444', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Gem />
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{data?.pulls24h}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pulls/hari</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ef4444', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Box />
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{data?.totalItems || 0}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Item Unik</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ef4444', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Dices />
              </div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{(data?.totalPulls || 0).toLocaleString()}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total Pulls</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
