'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { LeafIcon, PlusIcon, TrashIcon, ChartIcon, CheckIcon, AlertTriangleIcon } from '@/components/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Crop {
  _id: string;
  name: string;
  type: string;
  location: string;
  healthStatus: string;
  lastAnalysis: string | null;
  createdAt: string;
}

const healthConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Saludable': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  'Estrés hídrico': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  'Posible plaga': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  'Deficiencia de nutrientes': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  'unknown': { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' },
};

export default function CropsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchCrops = async () => {
    try {
      const res = await fetch(`${API_URL}/api/crops`, { credentials: 'include' });
      if (res.ok) { const j = await res.json(); setCrops(j?.data ?? j); }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchCrops();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear cultivo');
      // sendResponse wraps data: { crop, analysis } → unwrap to get the crop object
      setCrops((prev) => [data?.data?.crop ?? data?.data, ...prev]);
      setForm({ name: '', type: '', location: '' });
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cultivo y todo su historial?')) return;
    try {
      const res = await fetch(`${API_URL}/api/crops/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) setCrops((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Mis Cultivos</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              {crops.length} cultivo{crops.length !== 1 ? 's' : ''} registrado{crops.length !== 1 ? 's' : ''}
              {user.plan === 'FREE' && ` · Plan FREE: ${crops.length}/3`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: showForm ? '#1a1a1a' : 'linear-gradient(135deg, #22c55e, #15803d)',
              border: showForm ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: '10px', color: 'white', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            <PlusIcon size={16} color="white" />
            {showForm ? 'Cancelar' : 'Nuevo Cultivo'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Registrar Cultivo</h3>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#f87171' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Nombre</label>
                <input className="input-dark" type="text" placeholder="Ej: Parcela Norte" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Tipo de cultivo</label>
                <input className="input-dark" type="text" placeholder="Ej: Maíz, Trigo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Ubicación</label>
                <input className="input-dark" type="text" placeholder="Ej: Campo A, Sector 3" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <button type="submit" disabled={creating} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #22c55e, #15803d)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </form>
          </div>
        )}

        {/* Crops grid */}
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>Cargando cultivos...</div>
        ) : crops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <LeafIcon size={40} color="#1a3a1a" />
            <p style={{ color: '#64748b', marginTop: '12px', fontSize: '14px' }}>No tienes cultivos registrados</p>
            <p style={{ color: '#475569', fontSize: '13px' }}>Crea tu primer cultivo para empezar el monitoreo</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {crops.map((crop) => {
              const status = healthConfig[crop.healthStatus] || healthConfig['unknown'];
              const isHealthy = crop.healthStatus === 'Saludable';
              return (
                <div key={crop._id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s' }}>
                  {/* Crop header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LeafIcon size={18} color="#22c55e" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>{crop.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{crop.type}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(crop._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '6px' }}>
                      <TrashIcon size={16} />
                    </button>
                  </div>

                  {/* Location */}
                  <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                    Ubicación: {crop.location}
                  </p>

                  {/* Health status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: status.bg, border: `1px solid ${status.border}`, borderRadius: '8px', marginBottom: '12px' }}>
                    {isHealthy ? <CheckIcon size={13} color={status.color} /> : <AlertTriangleIcon size={13} color={status.color} />}
                    <span style={{ fontSize: '12px', color: status.color, fontWeight: 600 }}>{crop.healthStatus}</span>
                  </div>

                  {/* Last analysis */}
                  {crop.lastAnalysis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ChartIcon size={13} color="#64748b" />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Análisis: {new Date(crop.lastAnalysis).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
