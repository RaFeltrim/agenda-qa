import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
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
          
          {/* Protected Routes with Layout */}
          <Route element={<AppLayout />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'user']}>
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings" 
              element={
                <ProtectedRoute>
                  <MeetingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
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
