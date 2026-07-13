'use client';
import { useState } from 'react';
import EventForm from './EventForm';
import { deleteEvent } from '@/app/actions/admin';

export default function AdminEventsClient({ events }: { events: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteEvent(eventToDelete.id);
      setNotification({ message: 'Event deleted successfully.', type: 'success' });
    } catch (error: any) {
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setDeleteLoading(false);
      setEventToDelete(null);
    }
  };

  const handleCloseNotification = () => {
    if (notification?.type === 'success') {
      window.location.reload();
    }
    setNotification(null);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px', color: '#f8fafc' }}>Event Management</h1>

      <div style={{ padding: '30px', background: '#120a09', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', margin: 0 }}>All Events</h2>
          <button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }} style={{ background: '#d83a3a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Create New Event Banner
          </button>
        </div>

        <div className="admin-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>Banner Name</th>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>Start Date</th>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>End Date</th>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>Cost</th>
              <th style={{ padding: '15px 10px', fontWeight: '600' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ color: '#f8fafc' }}>
            {events.map((event) => (
              <tr key={event.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px 10px' }}>{event.name}</td>
                <td style={{ padding: '15px 10px' }}>
                  <span style={{
                    background: event.status === 'active' ? '#059669' : event.status === 'draft' ? '#475569' : '#dc2626',
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem'
                  }}>
                    {event.status}
                  </span>
                </td>
                <td style={{ padding: '15px 10px' }}>{event.startDate ? new Date(event.startDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '15px 10px' }}>{event.endDate ? new Date(event.endDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '15px 10px' }}>{event.costPerPull}</td>
                <td style={{ padding: '15px 10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setSelectedEvent(event); setIsFormOpen(true); }} style={{ background: '#3e221f', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#4a2925'} onMouseLeave={(e) => e.currentTarget.style.background = '#3e221f'}>Edit</button>
                    <button onClick={() => setEventToDelete(event)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '15px 10px', textAlign: 'center', color: '#94a3b8' }}>No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <EventForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} event={selectedEvent} />

      {eventToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#120a09', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.4rem' }}>Delete Event</h3>
            <p style={{ color: '#f8fafc', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to delete event <strong>{eventToDelete.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button disabled={deleteLoading} onClick={handleDelete} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: deleteLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button disabled={deleteLoading} onClick={() => setEventToDelete(null)} style={{ flex: 1, background: '#3e221f', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#120a09', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: `1px solid ${notification.type === 'success' ? '#22c55e' : '#ef4444'}`, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <h3 style={{ color: notification.type === 'success' ? '#22c55e' : '#ef4444', marginBottom: '15px', fontSize: '1.4rem' }}>
              {notification.type === 'success' ? 'Success!' : 'Error!'}
            </h3>
            <p style={{ color: '#f8fafc', marginBottom: '25px', lineHeight: '1.5', wordBreak: 'break-word' }}>{notification.message}</p>
            <button type="button" onClick={handleCloseNotification} style={{ background: notification.type === 'success' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
