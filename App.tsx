
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
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

            <Route index element={<Navigate to={getDashboardPath()} replace />} />
          </Route>

          {/* Catch-all for root level if Layout fails */}
          <Route path="*" element={<Navigate to={getDashboardPath()} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
