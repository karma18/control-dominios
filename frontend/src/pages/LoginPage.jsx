import { useState } from 'react';
import {
  KeyRound,
  LockKeyhole,
  Mail,
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
        <div className="brand-mark">
          <img src={autocomLogo} alt="AUTOCOM" />
          <span>Control de Dominios</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Inventario de dominios</p>
            <h1>Iniciar sesión</h1>
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
        </form>
      </section>
    </main>
  );
}
