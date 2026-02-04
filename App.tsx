import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PartnerRoute from './pages/PartnerRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import ConfessionModerator from './pages/admin/ConfessionModerator';
import Notifications from './pages/admin/Notifications';
import SystemSettings from './pages/admin/SystemSettings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 text-gray-800 font-sans">
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
      </div>
    </HashRouter>
  );
};

export default App;
