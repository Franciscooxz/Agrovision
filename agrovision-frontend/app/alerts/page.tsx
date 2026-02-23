'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AlertPanel from '@/components/AlertPanel';
import { BellIcon } from '@/components/icons';
import { getSocket, joinUserRoom } from '@/services/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Alert {
  _id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  createdAt: string;
  crop?: { name: string };
}

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    joinUserRoom(user.id);
    socket.on('newAlert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });
    return () => { socket.off('newAlert'); };
  }, [user]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/alerts`, { credentials: 'include' });
        if (res.ok) setAlerts(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    if (user) fetch_();
  }, [user]);

  if (loading || !user) return null;

  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);
  const displayed = showResolved ? resolved : active;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <BellIcon size={20} color={active.length > 0 ? '#ef4444' : '#64748b'} />
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Alertas</h1>
              {active.length > 0 && (
                <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
                  {active.length}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {active.length} activas · {resolved.length} resueltas
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowResolved(false)}
              style={{ padding: '8px 16px', background: !showResolved ? 'rgba(239,68,68,0.1)' : '#1a1a1a', border: `1px solid ${!showResolved ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: !showResolved ? '#ef4444' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              Activas ({active.length})
            </button>
            <button
              onClick={() => setShowResolved(true)}
              style={{ padding: '8px 16px', background: showResolved ? 'rgba(34,197,94,0.1)' : '#1a1a1a', border: `1px solid ${showResolved ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: showResolved ? '#22c55e' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              Resueltas ({resolved.length})
            </button>
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>Cargando alertas...</div>
        ) : (
          <AlertPanel
            alerts={displayed}
            onResolve={!showResolved ? (id) => setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, resolved: true } : a)) : undefined}
          />
        )}
      </main>
    </div>
  );
}
