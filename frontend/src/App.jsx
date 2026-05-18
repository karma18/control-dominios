import { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { DashboardLayout } from './components/common/DashboardLayout';
import { DashboardPage } from './components/common/DashboardPage';
import { LoginPage } from './components/common/LoginPage';
import { CrudPage } from './components/common/CrudPage';
import { resources } from './config/resources';

function AppContent() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');
  const activeResource = useMemo(
    () => resources.find((resource) => resource.key === activeKey),
    [activeKey],
  );

  if (isBootstrapping) {
    return <div className="boot-screen">Loading</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
