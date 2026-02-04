import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    onLogout: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
        { path: '/admin/users', icon: '👥', label: 'Users' },
        { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
        { path: '/admin/confessions', icon: '💬', label: 'Confessions' },
        { path: '/admin/notifications', icon: '🔔', label: 'Notifications' },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ];

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="w-64 bg-gray-900 min-h-screen flex flex-col border-r border-gray-800">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white">💖 Admin</h1>
                <p className="text-xs text-gray-400 mt-1">Valentine Week</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path, item.exact)
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
                >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
