import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
