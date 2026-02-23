'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { UsersIcon, ShieldIcon, LeafIcon, BellIcon, ChartIcon, CrownIcon, TrashIcon } from '@/components/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'technician';
  plan: 'FREE' | 'PRO';
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalCrops: number;
  totalAlerts: number;
  totalSensors: number;
  activeAlerts: number;
  proUsers: number;
}

const roleConfig = {
  admin: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Admin' },
  farmer: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Agricultor' },
  technician: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Técnico' },
};

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

const AdminStat = ({ title, value, icon: Icon, color, bg }: { title: string; value: number; icon: IconComponent; color: string; bg: string }) => (
  <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '40px', height: '40px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>{value}</p>
    </div>
  </div>
);

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users`, { credentials: 'include' }),
        fetch(`${API_URL}/api/admin/stats`, { credentials: 'include' }),
      ]);
      if (usersRes.ok) { const j = await usersRes.json(); setUsers(j?.data ?? j); }
      if (statsRes.ok) { const j = await statsRes.json(); setStats(j?.data ?? j); }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const j = await res.json();
        const updated = j?.data ?? j;
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: updated.role } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updatePlan = async (id: string, plan: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const j = await res.json();
        const updated = j?.data ?? j;
        setUsers((prev) => prev.map((u) => u._id === id ? { ...u, plan: updated.plan } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <ShieldIcon size={20} color="#f59e0b" />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Panel Admin</h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Gestión de usuarios y estadísticas globales</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            <AdminStat title="Usuarios" value={stats.totalUsers} icon={UsersIcon} color="#3b82f6" bg="rgba(59,130,246,0.12)" />
            <AdminStat title="Cultivos" value={stats.totalCrops} icon={LeafIcon} color="#22c55e" bg="rgba(34,197,94,0.12)" />
            <AdminStat title="Alertas Activas" value={stats.activeAlerts} icon={BellIcon} color="#ef4444" bg="rgba(239,68,68,0.12)" />
            <AdminStat title="Total Sensores" value={stats.totalSensors} icon={ChartIcon} color="#8b5cf6" bg="rgba(139,92,246,0.12)" />
            <AdminStat title="Usuarios PRO" value={stats.proUsers} icon={CrownIcon} color="#f59e0b" bg="rgba(245,158,11,0.12)" />
          </div>
        )}

        {/* Users table */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Usuarios ({users.length})</h2>
          </div>

          {fetching ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Cargando...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Usuario', 'Email', 'Rol', 'Plan', 'Registrado', 'Acciones'].map((h) => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = roleConfig[u.role] || roleConfig.farmer;
                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 700 }}>{u.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8' }}>{u.email}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => updateRole(u._id, e.target.value)}
                            disabled={u._id === user.id}
                            style={{ background: role.bg, color: role.color, border: `1px solid ${role.color}30`, borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: 600, cursor: u._id === user.id ? 'not-allowed' : 'pointer', outline: 'none' }}
                          >
                            <option value="admin">Admin</option>
                            <option value="farmer">Agricultor</option>
                            <option value="technician">Técnico</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <select
                            value={u.plan}
                            onChange={(e) => updatePlan(u._id, e.target.value)}
                            style={{ background: u.plan === 'PRO' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)', color: u.plan === 'PRO' ? '#f59e0b' : '#94a3b8', border: `1px solid ${u.plan === 'PRO' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)'}`, borderRadius: '8px', padding: '4px 8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="FREE">FREE</option>
                            <option value="PRO">PRO</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#64748b' }}>
                          {new Date(u.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {u._id !== user.id && (
                            <button
                              onClick={() => deleteUser(u._id, u.name)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                            >
                              <TrashIcon size={13} color="#ef4444" />
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
