import React from 'react';

interface NotificationModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export default function NotificationModal({ show, message, onClose }: NotificationModalProps) {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f87171', fontFamily: 'var(--font-cinzel)' }}>Notice</h3>
        <p style={{ margin: '0 0 25px 0', color: '#e2e8f0', fontSize: '1rem', lineHeight: '1.5' }}>{message}</p>
        <button onClick={onClose} style={buttonStyle}>
          OK
        </button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(4px)',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#1e1b4b',
  border: '2px solid #4338ca',
  borderRadius: '12px',
  padding: '25px',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #8b5cf6, #3b82f6)',
  color: 'white',
  border: 'none',
  padding: '10px 30px',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  transition: 'transform 0.1s',
};
