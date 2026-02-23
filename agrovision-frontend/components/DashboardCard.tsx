type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: IconComponent;
  color?: string;
  bg?: string;
}

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = '#22c55e', bg = 'rgba(34,197,94,0.12)' }: DashboardCardProps) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    }}>
      {Icon && (
        <div style={{ width: '44px', height: '44px', background: bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
      )}
      <div>
        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
        <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#f1f5f9' }}>{value}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{subtitle}</p>}
      </div>
    </div>
  );
}
