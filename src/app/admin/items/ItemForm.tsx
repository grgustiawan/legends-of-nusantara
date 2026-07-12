'use client';
import { useState } from 'react';
import { saveItem } from '@/app/actions/admin';

export default function ItemForm({ isOpen, onClose, eventId, item }: { isOpen: boolean, onClose: () => void, eventId: string, item?: any }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('eventId', eventId);

    try {
      await saveItem(formData);
      setNotification({ message: 'Item saved successfully', type: 'success' });
    } catch (error: any) {
      setNotification({ message: 'Error saving item: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleCloseNotification = () => {
    if (notification?.type === 'success') {
      window.location.reload();
    }
    setNotification(null);
  };

  const renderImagePreview = (label: string, name: string, imageUrl: string | undefined, mandatory: boolean) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '10px', fontWeight: '500' }}>
        {label} {mandatory && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {imageUrl && (
        <div style={{ marginBottom: '12px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={imageUrl} alt={label} style={{ height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
        </div>
      )}
      <input type="file" name={name} accept="image/*" required={mandatory && !imageUrl} style={{ color: '#94a3b8', fontSize: '0.9rem', width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)', background: '#2b1716', cursor: 'pointer' }} />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <div style={{ background: '#120a09', padding: '35px', borderRadius: '24px', width: '100%', maxWidth: '650px', border: '1px solid rgba(255,255,255,0.05)', margin: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '25px', fontSize: '1.6rem', fontWeight: 'bold' }}>{item ? 'Edit Item' : 'Create New Item'}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {item && <input type="hidden" name="id" value={item.id} />}

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Item Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="name" defaultValue={item?.name || ''} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Status</label>
              <select name="isActive" defaultValue={item ? (item.isActive ? 'true' : 'false') : 'true'} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Description</label>
            <textarea name="description" defaultValue={item?.description || ''} rows={2} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', resize: 'vertical', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Rarity Tier</label>
              <select name="rarity" defaultValue={item?.rarity || 'common'} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Drop Rate (%) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" step="0.001" name="dropRate" defaultValue={item?.dropRate?.toString() || "0"} required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' }}>Stock (Optional)</label>
              <input type="number" name="stock" defaultValue={item?.stock !== null ? item?.stock : ""} placeholder="Unlimited" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#2b1716', color: 'white', outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'rgba(216,58,58,0.5)'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', marginTop: '10px' }}>
            {renderImagePreview('Item Image', 'image', item?.imageUrl, true)}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, background: '#d83a3a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.05rem', transition: 'background 0.2s, opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Save Item'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, background: '#3e221f', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05rem', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#4a2925'} onMouseLeave={(e) => e.currentTarget.style.background = '#3e221f'}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {notification && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#120a09', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ color: notification.type === 'success' ? '#22c55e' : '#ef4444', marginBottom: '15px', fontSize: '1.4rem' }}>
              {notification.type === 'success' ? 'Success!' : 'Error!'}
            </h3>
            <p style={{ color: '#f8fafc', marginBottom: '25px', lineHeight: '1.5' }}>{notification.message}</p>
            <button type="button" onClick={handleCloseNotification} style={{ background: notification.type === 'success' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
