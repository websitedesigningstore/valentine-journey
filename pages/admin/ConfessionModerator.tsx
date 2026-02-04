import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession } from '../../services/adminAuth';
import { getAllConfessions, deleteConfession } from '../../services/storage';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Confession {
    id: string;
    text: string;
    day: string;
    timestamp: string;
    userId: string;
    username?: string;
    partnerName?: string;
}

const ConfessionModerator: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);
    const [dayFilter, setDayFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        loadConfessions();
    }, []);

    const loadConfessions = async () => {
        try {
            const data = await getAllConfessions();
            setConfessions(data);
        } catch (error) {
            console.error('Error loading confessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (confession: Confession) => {
        if (!admin) return;
        if (!confirm(`Delete confession from ${confession.username}?`)) return;

        try {
            await deleteConfession(confession.userId, confession.id, admin.id);
            loadConfessions();
        } catch (error) {
            console.error('Error deleting confession:', error);
            alert('Failed to delete confession');
        }
    };

    const handleLogout = () => {
        clearAdminSession();
        navigate('/admin/login');
    };

    // Get unique users for filter dropdown
    const uniqueUsers = Array.from(new Set(confessions.map(c => c.username))).filter(Boolean).sort();

    // Apply all filters
    const filteredConfessions = confessions.filter(c => {
        const dayMatch = dayFilter === 'all' || c.day === dayFilter;
        const userMatch = userFilter === 'all' || c.username === userFilter;
        const textMatch = searchText === '' || c.text.toLowerCase().includes(searchText.toLowerCase());
        return dayMatch && userMatch && textMatch;
    });

    if (!admin) return null;

    return (
        <div className="flex min-h-screen bg-gray-950">
            <AdminSidebar onLogout={handleLogout} />

            <div className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Confession Moderator 💬</h1>
                    <p className="text-gray-400">Review and moderate user confessions</p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    {/* Day Filter */}
                    <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                    >
                        <option value="all">All Days</option>
                        <option value="rose">Rose Day</option>
                        <option value="propose">Propose Day</option>
                        <option value="chocolate">Chocolate Day</option>
                        <option value="teddy">Teddy Day</option>
                        <option value="promise">Promise Day</option>
                        <option value="hug">Hug Day</option>
                        <option value="kiss">Kiss Day</option>
                        <option value="valentine">Valentine's Day</option>
                    </select>

                    {/* User Filter */}
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                    >
                        <option value="all">All Users ({uniqueUsers.length})</option>
                        {uniqueUsers.map(username => (
                            <option key={username} value={username}>{username}</option>
                        ))}
                    </select>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search confession text..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 flex-1 min-w-[200px]"
                    />

                    {/* Count */}
                    <span className="text-gray-400 text-sm font-medium">
                        {filteredConfessions.length} of {confessions.length}
                    </span>

                    {/* Clear Filters */}
                    {(dayFilter !== 'all' || userFilter !== 'all' || searchText !== '') && (
                        <button
                            onClick={() => {
                                setDayFilter('all');
                                setUserFilter('all');
                                setSearchText('');
                            }}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading confessions...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredConfessions.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                {confessions.length === 0 ? 'No confessions yet' : 'No confessions match your filters'}
                            </div>
                        ) : (
                            filteredConfessions.map((confession) => (
                                <div key={confession.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full capitalize font-medium">
                                                {confession.day}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                                                👤 {confession.username || 'Unknown'}
                                            </span>
                                            <span className="px-3 py-1 bg-pink-600 text-white text-xs rounded-full font-medium">
                                                💕 {confession.partnerName || 'Unknown'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(confession)}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-all flex-shrink-0 font-medium"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                    <p className="text-white mb-3 leading-relaxed">{confession.text}</p>
                                    <p className="text-gray-400 text-xs">
                                        📅 {confession.timestamp ? new Date(confession.timestamp).toLocaleString('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        }) : 'No date'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfessionModerator;
