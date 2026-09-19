import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const typeConfig = {
  success: {
    title: 'Success',
    icon: '✅',
    bg: '#ecfdf3',
    border: '#16a34a',
    text: '#14532d',
    bar: 'linear-gradient(90deg,#22c55e,#4ade80)',
  },
  danger: {
    title: 'Error',
    icon: '❌',
    bg: '#fef2f2',
    border: '#dc2626',
    text: '#7f1d1d',
    bar: 'linear-gradient(90deg,#f97373,#ef4444)',
  },
  warning: {
    title: 'Warning',
    icon: '⚠️',
    bg: '#fffbeb',
    border: '#d97706',
    text: '#78350f',
    bar: 'linear-gradient(90deg,#facc15,#fbbf24)',
  },
  info: {
    title: 'Info',
    icon: 'ℹ️',
    bg: '#eff6ff',
    border: '#2563eb',
    text: '#1e3a8a',
    bar: 'linear-gradient(90deg,#3b82f6,#60a5fa)',
  },
};

export function AppToast({ show, onClose, type = 'success', message }) {
  const cfg = typeConfig[type] || typeConfig.success;

  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ zIndex: 9999, pointerEvents: 'none' }}
    >
      <Toast
        show={show}
        onClose={onClose}
        delay={3500}
        autohide
        animation
        style={{
          minWidth: '260px',
          maxWidth: '90vw',
          pointerEvents: 'auto',
          borderRadius: '14px',
          border: `1px solid ${cfg.border}`,
          background: cfg.bg,
          boxShadow:
            '0 18px 45px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* top accent bar */}
        <div
          style={{
            height: '4px',
            width: '100%',
            backgroundImage: cfg.bar,
          }}
        />

        <div style={{ display: 'flex', padding: '10px 12px 10px 14px' }}>
          <div
            style={{
              fontSize: '20px',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {cfg.icon}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <strong
                style={{
                  fontSize: '14px',
                  color: cfg.text,
                  letterSpacing: '0.02em',
                }}
              >
                {cfg.title}
              </strong>
              <small style={{ color: '#9ca3af', fontSize: '11px' }}>
                Just now
              </small>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: cfg.text,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {message}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#9ca3af',
              marginLeft: '8px',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: '14px',
            }}
          >
            ×
          </button>
        </div>
      </Toast>
    </ToastContainer>
  );
}
