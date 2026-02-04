import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../services/adminAuth';
import { supabase } from '../../services/supabaseClient';
import AdminSidebar from '../../components/admin/AdminSidebar';

const SystemSettings: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [demoMode, setDemoMode] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await supabase
                .from('system_settings')
                .select('*')
                .in('key', ['demo_mode', 'maintenance_mode']);

            data?.forEach(setting => {
                if (setting.key === 'demo_mode') {
                    setDemoMode(setting.value?.enabled || false);
                } else if (setting.key === 'maintenance_mode') {
                    setMaintenanceMode(setting.value?.enabled || false);
                }
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        setSaving(true);
        try {
            await supabase
                .from('system_settings')
                .upsert({
                    key,
                    value,
                    updated_by: admin?.id,
                    updated_at: new Date().toISOString()
                });
            alert('Setting saved!');
        } catch (error) {
            console.error('Error saving setting:', error);
            alert('Failed to save setting');
        } finally {
            setSaving(false);
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
                    {/* Demo Mode */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Demo Mode</h3>
                                <p className="text-gray-400 text-sm">Allow all users to access all days</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={demoMode}
                                    onChange={(e) => {
                                        setDemoMode(e.target.checked);
                                        saveSetting('demo_mode', { enabled: e.target.checked });
                                    }}
                                    className="sr-only peer"
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Maintenance Mode</h3>
                                <p className="text-gray-400 text-sm">Disable app for maintenance</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={maintenanceMode}
                                    onChange={(e) => {
                                        setMaintenanceMode(e.target.checked);
                                        saveSetting('maintenance_mode', { enabled: e.target.checked });
                                    }}
                                    className="sr-only peer"
                                    disabled={saving}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
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
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
