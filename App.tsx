
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Role, UserSession } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import StaffManagement from './pages/StaffManagement';
import SurveyModule from './pages/SurveyModule';
import AccessDenied from './pages/AccessDenied';
import Layout from './components/Layout';
import VerificationPage from './pages/VerificationPage';
import MaintenancePage from './pages/MaintenancePage';
import { checkBackendHealth } from './services/healthService';

interface AuthContextType {
  user: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Fix: Make children optional in the prop type definition to satisfy TypeScript's JSX children requirement 
// when the component is passed as a prop value (e.g., in Route's element prop).
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: Role[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('nidar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // --- Startup health check state ---
  const [isBootChecking, setIsBootChecking] = useState(true);
  const [isBackendDown, setIsBackendDown] = useState(false);

  useEffect(() => {
    // Skip boot check if user navigated directly to /maintenance
    if (window.location.pathname === '/maintenance') {
      setIsBootChecking(false);
      return;
    }

    let cancelled = false;
    checkBackendHealth().then((result) => {
      if (cancelled) return;
      if (!result.isHealthy) {
        setIsBackendDown(true);
      }
      setIsBootChecking(false);
    });

    return () => { cancelled = true; };
  }, []);

  const login = (session: UserSession) => {
    setUser(session);
    sessionStorage.setItem('nidar_user', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('nidar_user');
    localStorage.removeItem('token');
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    return `/dashboard/${user.role.toLowerCase().replace('_', '-')}`;
  };

  // --- Boot loading spinner ---
  if (isBootChecking) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: '#f9fafb',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#6366f1', fontWeight: 500, fontSize: '14px' }}>
          Connecting to server...
        </span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Maintenance route — outside Layout, full-screen standalone page */}
          <Route path="/maintenance" element={<MaintenancePage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/form/verify/:id" element={<VerificationPage />} />

          <Route path="/" element={<Layout />}>
            {/* Dashboard Routes */}
            <Route path="dashboard/super-admin" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard/admin" element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard/field-staff" element={
              <ProtectedRoute allowedRoles={[Role.FIELD_STAFF]}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="customers/*" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF]}>
                <CustomerManagement />
              </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="staff/*" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
                <StaffManagement />
              </ProtectedRoute>
            } />

            {/* Survey Routes */}
            <Route path="surveys/*" element={
              <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF]}>
                <SurveyModule />
              </ProtectedRoute>
            } />

            <Route index element={
              isBackendDown
                ? <Navigate to="/maintenance" replace />
                : <Navigate to={getDashboardPath()} replace />
            } />
          </Route>

          {/* Catch-all: redirect to maintenance if backend is down, otherwise dashboard */}
          <Route path="*" element={
            isBackendDown
              ? <Navigate to="/maintenance" replace />
              : <Navigate to={getDashboardPath()} replace />
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
