'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ActivityIcon, ThermometerIcon, DropletIcon } from '@/components/icons';
import { getSocket, joinUserRoom } from '@/services/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Sensor {
  _id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
}

export default function SensorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    joinUserRoom(user.id);
    socket.on('newSensorData', (data: Sensor) => {
      setSensors((prev) => [data, ...prev.slice(0, 49)]);
    });
    return () => { socket.off('newSensorData'); };
  }, [user]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sensors`, { credentials: 'include' });
        if (res.ok) setSensors(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    if (user) fetch_();
  }, [user]);

  if (loading || !user) return null;

  const humidity = sensors.filter((s) => s.type === 'humidity');
  const temperature = sensors.filter((s) => s.type === 'temperature');

  const avg = (arr: Sensor[]) => arr.length ? (arr.slice(0, 5).reduce((a, b) => a + b.value, 0) / Math.min(arr.length, 5)).toFixed(1) : '—';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <ActivityIcon size={20} color="#22c55e" />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Sensores</h1>
            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse-green 2s infinite' }} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Lecturas en tiempo real del simulador</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#111111', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(245,158,11,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ThermometerIcon size={22} color="#f59e0b" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Temp. Promedio (últimas 5)</p>
              <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{avg(temperature)}°C</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{temperature.length} lecturas</p>
            </div>
          </div>
          <div style={{ background: '#111111', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(59,130,246,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DropletIcon size={22} color="#3b82f6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Humedad Promedio (últimas 5)</p>
              <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{avg(humidity)}%</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{humidity.length} lecturas</p>
            </div>
          </div>
        </div>

        {/* Sensor feed */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Feed de Sensores</h2>
          {fetching ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>Cargando...</p>
          ) : sensors.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '48px', fontSize: '13px' }}>Esperando datos del simulador...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
              {sensors.map((s) => {
                const isTemp = s.type === 'temperature';
                const color = isTemp ? '#f59e0b' : '#3b82f6';
                const bg = isTemp ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)';
                return (
                  <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: bg, border: `1px solid ${isTemp ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)'}`, borderRadius: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: isTemp ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isTemp ? <ThermometerIcon size={14} color={color} /> : <DropletIcon size={14} color={color} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{s.name}</p>
                      <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#64748b' }}>
                        {new Date(s.createdAt).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color }}>{s.value}{s.unit}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
