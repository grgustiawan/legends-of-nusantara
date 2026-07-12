'use client';

import { useState, useEffect } from 'react';
import ItemForm from './ItemForm';

import { getItemsByEvent } from '@/app/actions/admin';
import { PackageOpen, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminItemsClient({ events }: { events: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events.length > 0 ? events[0].id : '');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const fetchItems = async (eventId: string, currentPage: number, currentSearch: string) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const result = await getItemsByEvent(eventId, currentPage, 10, currentSearch);
      setItems(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchItems(selectedEventId, page, search);
    }
  }, [selectedEventId, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleCreateNew = () => {
    if (!selectedEventId) {
      alert("Please select an event first");
      return;
    }
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsFormOpen(true);
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

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#f8fafc' }}>Gacha Items Management</h1>

      <div style={{ padding: '30px', background: '#120a09', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ color: '#cbd5e1', fontWeight: 'bold' }}>Select Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setPage(1);
                setSearch('');
                setSearchInput('');
              }}
              style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: '#f8fafc', outline: 'none', minWidth: '250px' }}
            >
              {events.length === 0 && <option value="">No events available</option>}
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} ({ev.status})</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#2b1716', borderRadius: '12px', padding: '5px 15px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, maxWidth: '300px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '8px 10px', outline: 'none', width: '100%' }}
            />
          </form>

          <button
            onClick={handleCreateNew}
            disabled={!selectedEventId}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: selectedEventId ? '#d83a3a' : '#475569', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: selectedEventId ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
          >
            <PackageOpen size={18} />
            Add New Item
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                <th style={{ padding: '15px 10px', fontWeight: '600', width: '80px' }}>Image</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Item Name</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Rarity</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Drop Rate</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '15px 10px', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody style={{ color: '#f8fafc' }}>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Loading items...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    {selectedEventId ? 'No items found for this event.' : 'Please select an event.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: 'rgba(255,255,255,0.1)' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}></div>
                      )}
                    </td>
                    <td style={{ padding: '15px 10px', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '15px 10px', color: getRarityColor(item.rarity), fontWeight: '600', textTransform: 'capitalize' }}>{item.rarity}</td>
                    <td style={{ padding: '15px 10px' }}>{item.dropRate?.toString() || '0'}%</td>
                    <td style={{ padding: '15px 10px' }}>{item.stock !== null ? item.stock : <span style={{ color: '#94a3b8' }}>Unlimited</span>}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{
                        background: item.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: item.isActive ? '#22c55e' : '#ef4444',
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600'
                      }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <button onClick={() => handleEdit(item)} style={{ background: '#3e221f', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#4a2925'} onMouseLeave={(e) => e.currentTarget.style.background = '#3e221f'}>Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && items.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: page <= 1 ? 'transparent' : '#2b1716',
                  color: page <= 1 ? '#475569' : '#f8fafc',
                  border: `1px solid ${page <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <span style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: '500', padding: '0 10px' }}>
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: page >= meta.totalPages ? 'transparent' : '#2b1716',
                  color: page >= meta.totalPages ? '#475569' : '#f8fafc',
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

      <ItemForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} eventId={selectedEventId} item={selectedItem} />
    </div>
  );
}
