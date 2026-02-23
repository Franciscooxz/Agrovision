'use client';

import { useState } from 'react';
import { BellIcon, CheckIcon, AlertTriangleIcon } from './icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Alert {
  _id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  createdAt: string;
  crop?: { name: string };
}

interface Props {
  alerts: Alert[];
  onResolve?: (id: string) => void;
}

const severityConfig = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Alta' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Media' },
  low: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', label: 'Baja' },
};

export default function AlertPanel({ alerts, onResolve }: Props) {
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      const res = await fetch(`${API_URL}/api/alerts/${id}/resolve`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) onResolve?.(id);
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(null);
    }
  };

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <BellIcon size={16} color={alerts.length > 0 ? '#ef4444' : '#64748b'} />
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Alertas Activas</h2>
        {alerts.length > 0 && (
          <span style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
            {alerts.length}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckIcon size={28} color="#22c55e" />
            <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600, margin: '8px 0 0' }}>Sin alertas activas</p>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0' }}>Sistema funcionando correctamente</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = severityConfig[alert.severity] || severityConfig.low;
            return (
              <div key={alert._id} style={{ padding: '12px 14px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertTriangleIcon size={16} color={cfg.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{alert.message}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: cfg.color }}>{cfg.label}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(alert.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleResolve(alert._id)}
                  disabled={resolving === alert._id}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', color: '#22c55e', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                >
                  <CheckIcon size={12} color="#22c55e" />
                  {resolving === alert._id ? '...' : 'Resolver'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
