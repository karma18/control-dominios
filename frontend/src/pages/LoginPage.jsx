import { useState } from 'react';
import {
  CircleCheck,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import autocomLogo from '../assets/images/autocom-logo.png';

export function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      onLoginSuccess?.();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark login-brand">
          <img src={autocomLogo} alt="AUTOCOM" />
          <span>Control de Dominios</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-copy">
            <p className="eyebrow">Inventario de dominios</p>
            <h1>Iniciar sesión</h1>
            <span>Administra dominios, proveedores y renovaciones desde un panel centralizado.</span>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <label className="field-with-icon">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo"
              autoComplete="email"
              required
            />
          </label>

          <label className="field-with-icon">
            <LockKeyhole size={18} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <KeyRound size={17} />
            {isSubmitting ? 'Iniciando sesión' : 'Entrar'}
          </button>

          <div className="login-support-row">
            <ShieldCheck size={17} />
            <span>Acceso seguro para administración interna</span>
          </div>
        </form>
      </section>

      <aside className="login-aside" aria-label="Resumen de operación">
        <div className="login-aside-header">
          <span>Vista operativa</span>
          <strong>Dominios al día</strong>
        </div>

        <div className="login-kpi-grid">
          <div className="login-kpi-card">
            <TrendingUp size={18} />
            <strong>45 días</strong>
            <span>Ventana de renovación</span>
          </div>
          <div className="login-kpi-card">
            <CircleCheck size={18} />
            <strong>Catálogos</strong>
            <span>Relacionados con precios y proveedores</span>
          </div>
        </div>

        <div className="login-window">
          <div className="login-window-header">
            <span />
            <span />
            <span />
          </div>
          <div className="login-window-bars">
            <span style={{ width: '72%' }} />
            <span style={{ width: '48%' }} />
            <span style={{ width: '86%' }} />
          </div>
        </div>
      </aside>
    </main>
  );
}
