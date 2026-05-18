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
  });

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      const [domains, providers, extensions] = await Promise.all([
        apiClient.listDomains(),
        apiClient.listCatalog('domain-providers'),
        apiClient.listCatalog('domain-extensions'),
      ]);

      const soon = new Date();
      soon.setDate(soon.getDate() + 45);

      const expiring = domains.data.filter((domain) => {
        const expirationDate = new Date(domain.expiration_date);
        return expirationDate <= soon;
      }).length;

      if (isMounted) {
        setStats({
          domains: domains.meta.total,
          providers: providers.meta.total,
          extensions: extensions.meta.total,
          expiring,
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
          <p className="eyebrow">Control panel</p>
          <h1>Domain Operations</h1>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card green">
          <Globe2 size={28} />
          <div>
            <strong>{stats.domains}</strong>
            <span>Domains</span>
          </div>
        </article>
        <article className="stat-card purple">
          <Building2 size={28} />
          <div>
            <strong>{stats.providers}</strong>
            <span>Providers</span>
          </div>
        </article>
        <article className="stat-card red">
          <CalendarClock size={28} />
          <div>
            <strong>{stats.expiring}</strong>
            <span>Expiring soon</span>
          </div>
        </article>
        <article className="stat-card blue">
          <BadgeDollarSign size={28} />
          <div>
            <strong>{stats.extensions}</strong>
            <span>Extensions</span>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <h2>Renewal Load</h2>
            <span>Quarter</span>
          </div>
          <div className="bar-chart">
            {[37, 58, 71, 64, 83, 49, 73, 61].map((height, index) => (
              <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>

        <article className="panel progress-panel">
          <div className="panel-header">
            <h2>Catalog Setup</h2>
            <span>Live</span>
          </div>
          <div className="progress-row">
            <span>Providers</span>
            <div><span style={{ width: `${Math.min(stats.providers * 18, 100)}%` }} /></div>
          </div>
          <div className="progress-row">
            <span>Extensions</span>
            <div><span style={{ width: `${Math.min(stats.extensions * 12, 100)}%` }} /></div>
          </div>
          <div className="progress-row">
            <span>Domains</span>
            <div><span style={{ width: `${Math.min(stats.domains * 8, 100)}%` }} /></div>
          </div>
        </article>
      </section>
    </main>
  );
}
