import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../services/adminAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';

const SystemSettings: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
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
                    <h1 className="text-3xl font-bold text-white mb-2">System Settings ⚙️</h1>
                    <p className="text-gray-400">Configure global system settings</p>
                </div>

                <div className="space-y-6">
                    {/* User Link Examples */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">🔗 User Link Examples</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Users can now control their own Live/Preview mode from their personal Dashboard.
                            Admin global overrides have been deprecated in favor of individual user control.
                        </p>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Standard User Link:</p>
                                <code className="text-blue-400 text-sm">https://yoursite.com/#/v/userId</code>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 opacity-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">🔧 Maintenance Mode</h3>
                                <p className="text-gray-400 text-sm">Disable app for maintenance</p>
                                <p className="text-red-400 text-xs mt-2">⚠️ Feature coming soon</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-not-allowed">
                                <input
                                    type="checkbox"
                                    checked={maintenanceMode}
                                    disabled
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-900/20 rounded-xl p-6 border border-red-700">
                        <h3 className="text-lg font-bold text-red-400 mb-4">⚠️ Danger Zone</h3>
                        <button
                            onClick={() => {
                                if (confirm('⚠️ This will delete ALL data! Are you absolutely sure?')) {
                                    alert('Feature disabled for safety. Implement with caution.');
                                }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50"
                            disabled
                        >
                            Clear All Data (Disabled)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
