import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoadingFallback from './components/LoadingFallback';
import LoginPage from './app/login/page';
import DashboardPage from './app/dashboard/page';
import ProjectsPage from './app/projects/page';
import MeetingsPage from './app/meetings/page';
import ProfilePage from './app/profile/page';
import SettingsPage from './app/settings/page';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes with Layout */}
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
