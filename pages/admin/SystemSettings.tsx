import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../services/adminAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { isDemoMode, setDemoMode as setDemoModeUtil, clearAdminOverride } from '../../utils/dateLock';

const SystemSettings: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [adminOverride, setAdminOverride] = useState<'none' | 'demo' | 'live'>('none');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        // Check current admin override
        const forcedMode = localStorage.getItem('admin_forced_mode');
        if (forcedMode === 'demo' || forcedMode === 'live') {
            setAdminOverride(forcedMode);
        } else {
            setAdminOverride('none');
        }
    }, []);

    const handleAdminOverrideChange = (mode: 'none' | 'demo' | 'live') => {
        setAdminOverride(mode);

        if (mode === 'none') {
            clearAdminOverride();
            alert('✅ Admin override cleared!\n\nUsers can now choose their own mode (demo/live) via URL parameters.');
        } else if (mode === 'demo') {
            setDemoModeUtil(true);
            alert('✅ Admin override: DEMO MODE\n\nAll users will now see 10-second countdowns, regardless of their URL parameters.');
        } else {
            setDemoModeUtil(false);
            alert('✅ Admin override: LIVE MODE\n\nAll users will now see real-time countdowns to actual dates, regardless of their URL parameters.');
        }
    };

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
                    {/* Admin Override Mode */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-1">🎛️ Admin Mode Override</h3>
                            <p className="text-gray-400 text-sm">Force all users to use a specific mode</p>
                        </div>

                        <div className="space-y-3">
                            {/* No Override */}
                            <label className="flex items-center p-4 bg-gray-900 rounded-lg border-2 border-gray-700 cursor-pointer hover:border-blue-500 transition-all">
                                <input
                                    type="radio"
                                    name="admin-override"
                                    value="none"
                                    checked={adminOverride === 'none'}
                                    onChange={() => handleAdminOverrideChange('none')}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div className="ml-3">
                                    <p className="text-white font-medium">No Override (User Choice)</p>
                                    <p className="text-gray-400 text-sm">Users control mode via URL: <code className="text-purple-400">?mode=demo</code> or <code className="text-purple-400">?mode=live</code></p>
                                </div>
                            </label>

                            {/* Force Demo */}
                            <label className="flex items-center p-4 bg-gray-900 rounded-lg border-2 border-gray-700 cursor-pointer hover:border-purple-500 transition-all">
                                <input
                                    type="radio"
                                    name="admin-override"
                                    value="demo"
                                    checked={adminOverride === 'demo'}
                                    onChange={() => handleAdminOverrideChange('demo')}
                                    className="w-4 h-4 text-purple-600"
                                />
                                <div className="ml-3">
                                    <p className="text-white font-medium">Force Demo Mode 🎮</p>
                                    <p className="text-gray-400 text-sm">All users see 10-second countdowns (for testing)</p>
                                </div>
                            </label>

                            {/* Force Live */}
                            <label className="flex items-center p-4 bg-gray-900 rounded-lg border-2 border-gray-700 cursor-pointer hover:border-green-500 transition-all">
                                <input
                                    type="radio"
                                    name="admin-override"
                                    value="live"
                                    checked={adminOverride === 'live'}
                                    onChange={() => handleAdminOverrideChange('live')}
                                    className="w-4 h-4 text-green-600"
                                />
                                <div className="ml-3">
                                    <p className="text-white font-medium">Force Live Mode 🚀</p>
                                    <p className="text-gray-400 text-sm">All users see real-time countdowns to actual dates</p>
                                </div>
                            </label>
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
                            <p className="text-sm text-blue-300 mb-2"><strong>📖 How it works:</strong></p>
                            <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                                <li><strong>No Override:</strong> Users add <code>?mode=demo</code> or <code>?mode=live</code> to URL</li>
                                <li><strong>Force Demo:</strong> Overrides all user choices → everyone sees 10s countdown</li>
                                <li><strong>Force Live:</strong> Overrides all user choices → everyone sees real dates</li>
                            </ul>
                        </div>
                    </div>

                    {/* User Link Examples */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">🔗 User Link Examples</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Demo Mode Link:</p>
                                <code className="text-purple-400 text-sm">https://yoursite.com/#/v/userId<strong>?mode=demo</strong></code>
                            </div>
                            <div className="p-3 bg-gray-900 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Live Mode Link:</p>
                                <code className="text-green-400 text-sm">https://yoursite.com/#/v/userId<strong>?mode=live</strong></code>
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
