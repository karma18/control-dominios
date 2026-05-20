import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { DashboardLayout } from './components/common/DashboardLayout';
import { DashboardPage } from './components/common/DashboardPage';
import { CrudPage } from './components/common/CrudPage';
import { resources } from './config/resources';
import { LoginPage } from './pages/LoginPage';

function useCurrentPath() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    function handleNavigation() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  return { path, navigate };
}

function AuthenticatedApp() {
  const [activeKey, setActiveKey] = useState('dashboard');
  const activeResource = useMemo(
    () => resources.find((resource) => resource.key === activeKey),
    [activeKey],
  );

  return (
    <DashboardLayout activeKey={activeKey} onSelect={setActiveKey}>
      {activeKey === 'dashboard' ? (
        <DashboardPage />
      ) : (
        <CrudPage resource={activeResource} />
      )}
    </DashboardLayout>
  );
}

function AppContent() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { path, navigate } = useCurrentPath();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!isAuthenticated && path !== '/login') {
      navigate('/login');
      return;
    }

    if (isAuthenticated && path === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, isBootstrapping, path]);

  if (isBootstrapping) {
    return <div className="boot-screen">Cargando</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => navigate('/')} />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
