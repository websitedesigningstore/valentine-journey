import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PartnerRoute from './pages/PartnerRoute';

// Lazy Load Admin Components to reduce bundle size for normal users
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const ConfessionModerator = React.lazy(() => import('./pages/admin/ConfessionModerator'));
const Notifications = React.lazy(() => import('./pages/admin/Notifications'));
const SystemSettings = React.lazy(() => import('./pages/admin/SystemSettings'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 text-gray-800 font-sans">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/v/:userId" element={<PartnerRoute />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/confessions" element={<ConfessionModerator />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
};

export default App;
