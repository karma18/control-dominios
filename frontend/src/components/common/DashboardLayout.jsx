import {
  BadgeDollarSign,
  Bell,
  Building2,
  Database,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Users,
} from 'lucide-react';
import { resources } from '../../config/resources';
import { useAuth } from '../../app/providers/AuthProvider';

const iconMap = {
  domains: Globe2,
  users: Users,
  roles: KeyRound,
  'domain-providers': Building2,
  'domain-extensions': Tags,
  'domain-types': Database,
  'domain-actions': Gauge,
  'provider-extension-prices': BadgeDollarSign,
  'provider-service-prices': ShieldCheck,
  'financial-settings': Settings2,
};

export function DashboardLayout({
  activeKey,
  onSelect,
  children,
}) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Globe2 size={22} />
          <span>DOMAINS</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeKey === 'dashboard' ? 'active' : ''}
            type="button"
            onClick={() => onSelect('dashboard')}
            title="Dashboard"
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          {resources.map((resource) => {
            const Icon = iconMap[resource.key] || Database;

            return (
              <button
                key={resource.key}
                className={activeKey === resource.key ? 'active' : ''}
                type="button"
                onClick={() => onSelect(resource.key)}
                title={resource.title}
              >
                <Icon size={17} />
                <span>{resource.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={17} />
            <input placeholder="Search" />
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <span>{user?.first_name?.slice(0, 1) || 'U'}</span>
              <strong>{user?.first_name || 'User'}</strong>
            </div>
            <button className="icon-button" type="button" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
