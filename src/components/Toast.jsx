import React from 'react';
import { useApp } from '../context/AppContext';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}
          onClick={() => removeToast(t.id)} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 18 }}>{ICONS[t.type] || 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
