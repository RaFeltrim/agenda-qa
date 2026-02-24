import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoadingFallback from './components/LoadingFallback';
import './index.css';

// Lazy-loaded pages — each becomes a separate chunk for on-demand loading
const LoginPage = lazy(() => import('./app/login/page'));
const DashboardPage = lazy(() => import('./app/dashboard/page'));
const ProjectsPage = lazy(() => import('./app/projects/page'));
const MeetingsPage = lazy(() => import('./app/meetings/page'));
const ProfilePage = lazy(() => import('./app/profile/page'));
const SettingsPage = lazy(() => import('./app/settings/page'));

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
                      <Suspense fallback={<LoadingFallback />}>
                        <DashboardPage />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <ProjectsPage />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meetings"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <MeetingsPage />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <ProfilePage />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingFallback />}>
                        <SettingsPage />
                      </Suspense>
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
