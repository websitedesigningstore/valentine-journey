import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession, updateAdminActivity } from '../../services/adminAuth';
import { supabase } from '../../services/supabaseClient';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCard from '../../components/admin/StatsCard';

const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalConfessions: 0,
        avgConfessionsPerUser: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
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

            // Get confessions
            const { data: configs } = await supabase
                .from('valentine_config')
                .select('confessions');

            const totalConfessions = configs?.reduce((sum, config) => {
                return sum + (config.confessions?.length || 0);
            }, 0) || 0;

            setStats({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalConfessions,
                avgConfessionsPerUser: totalUsers ? (totalConfessions / totalUsers).toFixed(1) : 0
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics 📈</h1>
                    <p className="text-gray-400">Detailed insights and statistics</p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading analytics...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                icon="👥"
                                title="Total Users"
                                value={stats.totalUsers}
                                color="purple"
                            />
                            <StatsCard
                                icon="⚡"
                                title="Active Users (7d)"
                                value={stats.activeUsers}
                                color="blue"
                            />
                            <StatsCard
                                icon="💬"
                                title="Total Confessions"
                                value={stats.totalConfessions}
                                color="green"
                            />
                            <StatsCard
                                icon="📊"
                                title="Avg per User"
                                value={stats.avgConfessionsPerUser}
                                color="orange"
                            />
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Coming Soon</h2>
                            <p className="text-gray-400">Advanced charts and graphs will be added here.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
