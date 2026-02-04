import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../services/adminAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
        }
    }, []);

    const handleLogout = () => {
        clearAdminSession();
        navigate('/admin/login');
    };

    if (!admin) return null;

    return (
        <div className="flex min-h-screen bg-gray-950">
            <AdminSidebar onLogout={handleLogout} />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications 🔔</h1>
                    <p className="text-gray-400">Send notifications to users</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
                    <p className="text-gray-400">
                        Notification system will be implemented in the next phase.
                    </p>
                    <p className="text-gray-500 text-sm mt-4">
                        Features: Email notifications, Push notifications, Bulk messaging
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
