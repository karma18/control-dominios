import { useState } from 'react';
import {
  BadgeDollarSign,
  Bell,
  Building2,
  ChevronDown,
  Database,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { resources } from '../../config/resources';
import { useAuth } from '../../app/providers/AuthProvider';
import autocomLogo from '../../assets/images/autocom-logo.png';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainResources = resources.filter((resource) => resource.key === 'domains');
  const catalogResources = resources.filter((resource) => resource.key !== 'domains');

  function handleSelect(key) {
    onSelect(key);
    setIsSidebarOpen(false);
  }

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-is-open' : ''}`}>
      <aside className="sidebar" id="main-menu">
        <div className="sidebar-brand">
          <img src={autocomLogo} alt="AUTOCOM" />
          <button
            className="icon-button sidebar-close"
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeKey === 'dashboard' ? 'active' : ''}
            type="button"
            onClick={() => handleSelect('dashboard')}
            title="Inicio"
          >
            <LayoutDashboard size={17} />
            <span>Inicio</span>
          </button>

          {mainResources.map((resource) => {
            const Icon = iconMap[resource.key] || Database;

            return (
              <button
                key={resource.key}
                className={activeKey === resource.key ? 'active' : ''}
                type="button"
                onClick={() => handleSelect(resource.key)}
                title={resource.title}
              >
                <Icon size={17} />
                <span>{resource.title}</span>
              </button>
            );
          })}

          <details className="sidebar-group">
            <summary>
              <Database size={17} />
              <span>Catálogos</span>
              <ChevronDown className="sidebar-group-caret" size={16} />
            </summary>

            <div className="sidebar-group-items">
              {catalogResources.map((resource) => {
                const Icon = iconMap[resource.key] || Database;

                return (
                  <button
                    key={resource.key}
                    className={activeKey === resource.key ? 'active' : ''}
                    type="button"
                    onClick={() => handleSelect(resource.key)}
                    title={resource.title}
                  >
                    <Icon size={17} />
                    <span>{resource.title}</span>
                  </button>
                );
              })}
            </div>
          </details>
        </nav>
      </aside>
      <button
        className="sidebar-overlay"
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Abrir menú"
            aria-controls="main-menu"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={19} />
          </button>
          <div className="topbar-search">
            <Search size={17} />
            <input placeholder="Buscar" />
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Notificaciones">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <span>{user?.first_name?.slice(0, 1) || 'U'}</span>
              <strong>{user?.first_name || 'Usuario'}</strong>
            </div>
            <button className="icon-button" type="button" onClick={logout} title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
