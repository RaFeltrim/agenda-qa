import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
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
        <ErrorBoundary>
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
                      <RouteErrorBoundary routeName="Dashboard">
                        <DashboardPage />
                      </RouteErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                      <RouteErrorBoundary routeName="Projects">
                        <ProjectsPage />
                      </RouteErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <ProtectedRoute>
                      <RouteErrorBoundary routeName="Meetings">
                        <MeetingsPage />
                      </RouteErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <RouteErrorBoundary routeName="Profile">
                        <ProfilePage />
                      </RouteErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <RouteErrorBoundary routeName="Settings">
                        <SettingsPage />
                      </RouteErrorBoundary>
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
