import { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  Building2,
  CalendarClock,
  Globe2,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export function DashboardPage() {
  const [stats, setStats] = useState({
    domains: 0,
    providers: 0,
    extensions: 0,
    expiring: 0,
    providerDistribution: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      const [domains, providers, extensions] = await Promise.all([
        apiClient.listAllDomains(),
        apiClient.listCatalog('domain-providers'),
        apiClient.listCatalog('domain-extensions'),
      ]);

      const soon = new Date();
      soon.setDate(soon.getDate() + 45);

      const expiring = domains.data.filter((domain) => {
        const expirationDate = new Date(domain.expiration_date);
        return expirationDate <= soon;
      }).length;
      const providerMap = domains.data.reduce((map, domain) => {
        const providerName = domain.provider_name || 'Sin proveedor';
        map.set(providerName, (map.get(providerName) || 0) + 1);
        return map;
      }, new Map());
      const providerDistribution = Array.from(providerMap.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((left, right) => right.total - left.total);

      if (isMounted) {
        setStats({
          domains: domains.meta.total,
          providers: providers.meta.total,
          extensions: extensions.meta.total,
          expiring,
          providerDistribution,
        });
      }
    }

    loadStats().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="content-area">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h1>Operación de Dominios</h1>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card green">
          <Globe2 size={28} />
          <div>
            <strong>{stats.domains}</strong>
            <span>Dominios</span>
          </div>
        </article>
        <article className="stat-card purple">
          <Building2 size={28} />
          <div>
            <strong>{stats.providers}</strong>
            <span>Proveedores</span>
          </div>
        </article>
        <article className="stat-card red">
          <CalendarClock size={28} />
          <div>
            <strong>{stats.expiring}</strong>
            <span>Por vencer</span>
          </div>
        </article>
        <article className="stat-card blue">
          <BadgeDollarSign size={28} />
          <div>
            <strong>{stats.extensions}</strong>
            <span>Extensiones</span>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <h2>Dominios por Proveedor</h2>
            <span>Total actual</span>
          </div>
          <div className="pie-chart-layout">
            <div
              className="pie-chart"
              style={{ '--pie-chart': buildPieGradient(stats.providerDistribution) }}
              aria-label="Dominios por proveedor"
            />
            <div className="pie-legend">
              {stats.providerDistribution.length ? (
                stats.providerDistribution.map((item, index) => (
                  <div className="pie-legend-row" key={item.name}>
                    <span style={{ background: getPieColor(index) }} />
                    <strong>{item.name}</strong>
                    <em>{item.total}</em>
                  </div>
                ))
              ) : (
                <div className="empty-state">Sin datos</div>
              )}
            </div>
          </div>
        </article>

        <article className="panel progress-panel">
          <div className="panel-header">
            <h2>Configuración de Catálogos</h2>
            <span>Actual</span>
          </div>
          <div className="progress-row">
            <span>Proveedores</span>
            <div><span style={{ width: `${Math.min(stats.providers * 18, 100)}%` }} /></div>
          </div>
          <div className="progress-row">
            <span>Extensiones</span>
            <div><span style={{ width: `${Math.min(stats.extensions * 12, 100)}%` }} /></div>
          </div>
          <div className="progress-row">
            <span>Dominios</span>
            <div><span style={{ width: `${Math.min(stats.domains * 8, 100)}%` }} /></div>
          </div>
        </article>
      </section>
    </main>
  );
}

const pieColors = ['#30343a', '#00a887', '#9b1bb0', '#f2473f', '#23a7c9', '#f28c28', '#d49512'];

function getPieColor(index) {
  return pieColors[index % pieColors.length];
}

function buildPieGradient(items) {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  if (!total) {
    return '#e5e7eb 0deg 360deg';
  }

  let start = 0;
  const segments = items.map((item, index) => {
    const end = start + (item.total / total) * 360;
    const segment = `${getPieColor(index)} ${start}deg ${end}deg`;
    start = end;
    return segment;
  });

  return segments.join(', ');
}
