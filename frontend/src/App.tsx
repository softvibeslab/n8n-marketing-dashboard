/**
 * ===========================================
 * Main App Component
 * ===========================================
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StrategyPage from './pages/StrategyPage';
import WorkflowsPage from './pages/WorkflowsPage';
import AssetsPage from './pages/AssetsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssistantChatPage from './pages/AssistantChatPage';

/**
 * Protected route wrapper
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * App component with routing
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/strategy" element={<StrategyPage />} />
                <Route path="/workflows" element={<WorkflowsPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/assistant" element={<AssistantChatPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
