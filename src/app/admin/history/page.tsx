'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, CreditCard } from 'lucide-react';

type Tab = 'pulls' | 'topups';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pulls');

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [rarity, setRarity] = useState('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pulls' ? '/api/admin/history/pulls' : '/api/admin/history/topups';
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
      });

      if (activeTab === 'pulls') {
        query.append('rarity', rarity);
      }

      const res = await fetch(`${endpoint}?${query.toString()}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        setMeta(result.meta);
      } else {
        console.error('Failed to fetch history:', result.error);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab, page, search, rarity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setSearchInput('');
    setRarity('all');
  };

  const getRarityColor = (tier: string) => {
    const t = tier.toLowerCase();
    switch (t) {
      case 'legendary': return '#f59e0b';
      case 'epic': return '#a855f7';
      case 'rare': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '2rem' }}>History Transactions</h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabChange('pulls')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: activeTab === 'pulls' ? '#e11d48' : '#2b1716',
            color: activeTab === 'pulls' ? '#fff' : '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          <Activity size={18} />
          Gacha Pulls
        </button>
        <button
          onClick={() => handleTabChange('topups')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: activeTab === 'topups' ? '#e11d48' : '#2b1716',
            color: activeTab === 'topups' ? '#fff' : '#cbd5e1',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          <CreditCard size={18} />
          Top Up Transactions
        </button>
      </div>

      <div style={{ padding: '30px', background: '#120a09', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem' }}>
            {activeTab === 'pulls' ? 'Global Pull History' : 'All Top Up Transactions'}
          </h2>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', position: 'relative' }}>
              <input
                type="text"
                placeholder={activeTab === 'pulls' ? "Search User ID or Pull ID..." : "Search Req No or Username..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ padding: '10px 15px 10px 40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: '#f8fafc', outline: 'none', width: '250px' }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '12px' }} />
              <button type="submit" style={{ display: 'none' }}>Search</button>
            </form>

            {activeTab === 'pulls' && (
              <select
                value={rarity}
                onChange={(e) => { setRarity(e.target.value); setPage(1); }}
                style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: '#f8fafc', outline: 'none' }}
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              {activeTab === 'pulls' ? (
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Time</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Username</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Item Won</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Rarity</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Coin Cost</th>
                </tr>
              ) : (
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Time</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Request No</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Username</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Points</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Amount IDR</th>
                  <th style={{ padding: '15px 10px', fontWeight: '600' }}>Status</th>
                </tr>
              )}
            </thead>
            <tbody style={{ color: '#f8fafc' }}>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'pulls' ? 5 : 6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'pulls' ? 5 : 6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No data found.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {activeTab === 'pulls' ? (
                      <>
                        <td style={{ padding: '15px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(row.createdAt)}</td>
                        <td style={{ padding: '15px 10px' }}>{row.username}</td>
                        <td style={{ padding: '15px 10px' }}>{row.itemName}</td>
                        <td style={{ padding: '15px 10px', color: getRarityColor(row.rarity), fontWeight: '600', textTransform: 'capitalize' }}>{row.rarity}</td>
                        <td style={{ padding: '15px 10px' }}>{row.coinCost} Coins</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '15px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(row.createdAt)}</td>
                        <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>{row.requestNo}</td>
                        <td style={{ padding: '15px 10px' }}>{row.user?.username || row.userId}</td>
                        <td style={{ padding: '15px 10px', color: '#3b82f6', fontWeight: '600' }}>{row.pointAmount} Pts</td>
                        <td style={{ padding: '15px 10px', fontWeight: '500' }}>{formatCurrency(row.amountIdr)}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: row.status === 'SUCCESS' ? 'rgba(34,197,94,0.1)' : row.status === 'PENDING' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.status === 'SUCCESS' ? '#22c55e' : row.status === 'PENDING' ? '#eab308' : '#ef4444',
                          }}>
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: page === 1 ? 'transparent' : '#2b1716',
                  color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                  border: `1px solid ${page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '500', padding: '0 10px' }}>
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                disabled={page >= meta.totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: page >= meta.totalPages ? 'transparent' : '#2b1716',
                  color: page >= meta.totalPages ? 'rgba(255,255,255,0.2)' : '#fff',
                  border: `1px solid ${page >= meta.totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
