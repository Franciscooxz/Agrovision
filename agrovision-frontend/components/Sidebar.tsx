'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon,
  LeafIcon,
  BellIcon,
  ActivityIcon,
  ShieldIcon,
  LogOutIcon,
  CrownIcon,
} from './icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/crops', label: 'Cultivos', icon: LeafIcon },
  { href: '/sensors', label: 'Sensores', icon: ActivityIcon },
  { href: '/alerts', label: 'Alertas', icon: BellIcon },
];

const roleConfig = {
  admin: { label: 'Admin', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: ShieldIcon },
  farmer: { label: 'Agricultor', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', icon: LeafIcon },
  technician: { label: 'Técnico', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: ActivityIcon },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.farmer;
  const RoleIcon = role.icon;

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '240px',
        background: '#111111',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, #22c55e, #15803d)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <LeafIcon size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '18px', color: '#f1f5f9' }}>AgroVision</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.15s',
                background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                color: isActive ? '#22c55e' : '#94a3b8',
                border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={18} color={isActive ? '#22c55e' : '#94a3b8'} />
              {label}
            </Link>
          );
        })}

        {/* Admin link - solo para admins */}
        {user.role === 'admin' && (
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: pathname === '/admin' ? 600 : 400,
              fontSize: '14px',
              transition: 'all 0.15s',
              background: pathname === '/admin' ? 'rgba(245,158,11,0.12)' : 'transparent',
              color: pathname === '/admin' ? '#f59e0b' : '#94a3b8',
              border: pathname === '/admin' ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
            }}
          >
            <ShieldIcon size={18} color={pathname === '/admin' ? '#f59e0b' : '#94a3b8'} />
            Panel Admin
          </Link>
        )}
      </nav>

      {/* User info */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Plan badge */}
        {user.plan === 'PRO' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            <CrownIcon size={14} color="#f59e0b" />
            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>Plan PRO</span>
          </div>
        )}

        {/* Role badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          background: role.bg,
          border: `1px solid ${role.color}30`,
          borderRadius: '8px',
          marginBottom: '12px',
        }}>
          <RoleIcon size={14} color={role.color} />
          <span style={{ fontSize: '12px', color: role.color, fontWeight: 600 }}>{role.label}</span>
        </div>

        {/* User */}
        <div style={{ padding: '8px 10px', marginBottom: '8px' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{user.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>{user.email}</p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOutIcon size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
