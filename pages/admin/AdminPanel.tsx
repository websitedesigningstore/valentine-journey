import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession, updateAdminActivity } from '../../services/adminAuth';
import { supabase } from '../../services/supabaseClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(getAdminSession());
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalConfessions: 0,
        bannedUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        loadStats();
        loadRecentActivity();

        // Update activity on interaction
        const handleActivity = () => updateAdminActivity();
        window.addEventListener('click', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, [admin, navigate]);

    const loadStats = async () => {
        try {
            // Get total users
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Get active users (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count: activeUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('last_active', sevenDaysAgo.toISOString());

            // Get total confessions
            const { data: configs } = await supabase
                .from('valentine_config')
                .select('confessions');

            const totalConfessions = configs?.reduce((sum, config) => {
                return sum + (config.confessions?.length || 0);
            }, 0) || 0;

            // Get banned users
            const { count: bannedUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('is_banned', true);

            setStats({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalConfessions,
                bannedUsers: bannedUsers || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentActivity = async () => {
        try {
            const { data } = await supabase
                .from('admin_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            setRecentActivity(data || []);
        } catch (error) {
            console.error('Error loading activity:', error);
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {admin.username}! 👋</h1>
                    <p className="text-gray-400">Here's what's happening with your Valentine Week app</p>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading stats...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            icon="👥"
                            title="Total Users"
                            value={stats.totalUsers}
                            change="+12%"
                            trend="up"
                            color="purple"
                        />
                        <StatsCard
                            icon="⚡"
                            title="Active Users"
                            value={stats.activeUsers}
                            change="+5%"
                            trend="up"
                            color="blue"
                        />
                        <StatsCard
                            icon="💬"
                            title="Total Confessions"
                            value={stats.totalConfessions}
                            change="+23%"
                            trend="up"
                            color="green"
                        />
                        <StatsCard
                            icon="🚫"
                            title="Banned Users"
                            value={stats.bannedUsers}
                            trend="neutral"
                            color="red"
                        />
                    </div>
                )}

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    {recentActivity.length === 0 ? (
                        <p className="text-gray-400 text-sm">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                                    <span className="text-2xl">📝</span>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{log.action}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all"
                    >
                        👥 Manage Users
                    </button>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
                    >
                        📊 View Analytics
                    </button>
                    <button
                        onClick={() => navigate('/admin/confessions')}
                        className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-all"
                    >
                        💬 Moderate Content
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
