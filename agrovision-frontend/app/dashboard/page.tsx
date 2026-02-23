'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AlertPanel from '@/components/AlertPanel';
import SensorChart from '@/components/SensorChart';
import { getSocket, joinUserRoom } from '@/services/socket';
import {
  ActivityIcon,
  ThermometerIcon,
  DropletIcon,
  BellIcon,
  LeafIcon,
  ChartIcon,
  RefreshIcon,
} from '@/components/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Sensor {
  _id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  createdAt: string;
}

interface Alert {
  _id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
  createdAt: string;
  crop?: { name: string };
}

interface Metrics {
  totalCrops: number;
  totalAnalyses: number;
  healthyCrops: number;
  atRiskCrops: number;
  criticalCrops: number;
  averageConfidence: number;
}

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

const StatCard = ({
  title, value, subtitle, icon: Icon, color, bg,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconComponent;
  color: string;
  bg: string;
}) => (
  <div style={{
    background: '#111111',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  }}>
    <div style={{
      width: '44px', height: '44px', background: bg, borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
      <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#f1f5f9' }}>{value}</p>
      {subtitle && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{subtitle}</p>}
    </div>
  </div>
);

const SensorReading = ({ sensor }: { sensor: Sensor }) => {
  const isTemp = sensor.type === 'temperature';
  const color = isTemp ? '#f59e0b' : '#3b82f6';
  const bg = isTemp ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', background: '#1a1a1a',
      border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px',
    }}>
      <div style={{ width: '32px', height: '32px', background: bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isTemp ? <ThermometerIcon size={14} color={color} /> : <DropletIcon size={14} color={color} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{sensor.name}</p>
        <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#64748b' }}>
          {new Date(sensor.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
      <span style={{ fontSize: '17px', fontWeight: 700, color }}>{sensor.value}{sensor.unit}</span>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    joinUserRoom(user.id);

    socket.on('newSensorData', (data: Sensor) => {
      setSensors((prev) => [data, ...prev.slice(0, 19)]);
    });

    socket.on('newAlert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socket.off('newSensorData');
      socket.off('newAlert');
    };
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const [sRes, aRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/sensors`, { credentials: 'include' }),
        fetch(`${API_URL}/api/alerts`, { credentials: 'include' }),
        fetch(`${API_URL}/api/dashboard/metrics`, { credentials: 'include' }),
      ]);
      if (sRes.ok) { const j = await sRes.json(); setSensors(j?.data ?? j); }
      if (aRes.ok) { const j = await aRes.json(); setAlerts(j?.data ?? j); }
      if (mRes.ok) { const j = await mRes.json(); setMetrics(j?.data ?? j); }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '2px solid #22c55e', borderTopColor: 'transparent',
            borderRadius: '50%', margin: '0 auto 12px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latestTemp = sensors.find((s) => s.type === 'temperature');
  const latestHumidity = sensors.find((s) => s.type === 'humidity');
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
              Bienvenido, {user.name.split(' ')[0]}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Dashboard de monitoreo en tiempo real
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              color: '#94a3b8', cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: 500,
            }}
          >
            <RefreshIcon size={14} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard title="Temperatura" value={latestTemp ? `${latestTemp.value}${latestTemp.unit}` : 'Sin datos'} subtitle="Última lectura" icon={ThermometerIcon} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
          <StatCard title="Humedad" value={latestHumidity ? `${latestHumidity.value}${latestHumidity.unit}` : 'Sin datos'} subtitle="Última lectura" icon={DropletIcon} color="#3b82f6" bg="rgba(59,130,246,0.12)" />
          <StatCard title="Cultivos" value={metrics?.totalCrops ?? 0} subtitle={`${metrics?.healthyCrops ?? 0} saludables`} icon={LeafIcon} color="#22c55e" bg="rgba(34,197,94,0.12)" />
          <StatCard title="Alertas Activas" value={unresolvedAlerts.length} subtitle={`${alerts.length} totales`} icon={BellIcon} color="#ef4444" bg="rgba(239,68,68,0.12)" />
          <StatCard title="Análisis IA" value={metrics?.totalAnalyses ?? 0} subtitle={`${Math.round((metrics?.averageConfidence ?? 0) * 100)}% confianza`} icon={ChartIcon} color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
          <StatCard title="Lecturas" value={sensors.length} subtitle="En esta sesión" icon={ActivityIcon} color="#06b6d4" bg="rgba(6,182,212,0.12)" />
        </div>

        {/* ── GRÁFICA ── */}
        <div style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChartIcon size={16} color="#22c55e" />
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                Tendencia de Sensores
              </h2>
              <div style={{
                width: '6px', height: '6px', background: '#22c55e',
                borderRadius: '50%', animation: 'pulse-green 2s infinite',
              }} />
            </div>
            <span style={{ fontSize: '11px', color: '#475569' }}>
              Últimas 20 lecturas · actualización en vivo
            </span>
          </div>
          <SensorChart sensors={sensors} limit={20} height={220} />
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Live sensor feed */}
          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ActivityIcon size={16} color="#22c55e" />
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Lecturas en Vivo</h2>
              <div style={{
                marginLeft: 'auto', width: '8px', height: '8px',
                background: '#22c55e', borderRadius: '50%',
                animation: 'pulse-green 2s infinite',
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
              {sensors.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
                  Esperando datos del simulador...
                </p>
              ) : (
                sensors.slice(0, 12).map((s) => <SensorReading key={s._id} sensor={s} />)
              )}
            </div>
          </div>

          {/* Alerts */}
          <AlertPanel
            alerts={unresolvedAlerts}
            onResolve={(id) => setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, resolved: true } : a))}
          />
        </div>
      </main>
    </div>
  );
}
