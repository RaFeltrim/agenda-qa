import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './app/dashboard/page';
import './index.css';

function App() {
    return (
          <BrowserRouter>
                <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>Routes>
          </BrowserRouter>BrowserRouter>
        );
}

export default App;</BrowserRouter>
