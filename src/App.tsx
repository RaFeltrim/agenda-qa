import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './app/login/page';
import DashboardPage from './app/dashboard/page';
import ProjectsPage from './app/projects/page';
import MeetingsPage from './app/meetings/page';
import ProfilePage from './app/profile/page';
import SettingsPage from './app/settings/page';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes with Layout + per-route ErrorBoundary (BUG-039) */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <DashboardPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'user']}>
                  <ErrorBoundary>
                    <ProjectsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <MeetingsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ProfilePage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ErrorBoundary>
                    <SettingsPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

