import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Login';
import Dashboard from './DashboardNew';
import Reports from './Reports';
import ReportDetails from './components/ReportDetails';
import EnhancedAnalytics from './components/EnhancedAnalytics';
import ExportModal from './components/ExportModal';
import NotificationsPanel from './components/NotificationsPanel';
import AuditLogs from './components/AuditLogs';
import ReportsMap from './components/ReportsMap';
import UserManagement from './components/UserManagement/UserManagement';
import HazardReports from './components/HazardReports';
import AnalyticsReports from './components/AnalyticsReports';
import SystemSettings from './components/SystemSettings';
import ProfileSettings from './components/Settings/ProfileSettings';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './config';
import Layout from './components/Layout';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hazard-reports" element={<HazardReports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.BFP]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/analytics-reports" element={<AnalyticsReports />} />
              <Route path="/notifications/real-time-alerts" element={<NotificationsPanel />} />
              <Route path="/notifications/resident-personnel-updates" element={<NotificationsPanel />} />
              <Route path="/audit-logs/activity-log" element={<AuditLogs />} />
              <Route path="/audit-logs/security-log" element={<AuditLogs />} />
              <Route path="/system-settings" element={<SystemSettings />} />
            </Route>
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
