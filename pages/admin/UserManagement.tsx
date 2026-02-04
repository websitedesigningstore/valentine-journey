import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, clearAdminSession, updateAdminActivity, logAdminAction } from '../../services/adminAuth';
import { getAllUsers, banUser, unbanUser, deleteUser } from '../../services/storage';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface UserData {
    id: string;
    username: string;
    partner_name: string;
    created_at: string;
    is_banned: boolean;
    banned_reason?: string;
    last_active?: string;
    isActive?: boolean;
}

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const admin = getAdminSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');

    useEffect(() => {
        if (!admin) {
            navigate('/admin/login');
            return;
        }

        loadUsers();

        const handleActivity = () => updateAdminActivity();
        window.addEventListener('click', handleActivity);
        return () => window.removeEventListener('click', handleActivity);
    }, [page, search]); // Removed admin and navigate from dependencies

    const loadUsers = async () => {
        setLoading(true);
        try {
            console.log('Loading users...');
            const { users: data, total: count } = await getAllUsers(page, 20, search);
            console.log('Users loaded:', data);
            console.log('Total count:', count);

            // Add fallback for missing columns
            const usersWithDefaults = (data || []).map(user => ({
                ...user,
                is_banned: user.is_banned ?? false,
                banned_reason: user.banned_reason ?? '',
                last_active: user.last_active ?? user.created_at
            }));

            setUsers(usersWithDefaults);
            setTotal(count || 0);
        } catch (error) {
            console.error('Error loading users:', error);
            alert(`Failed to load users: ${error}`);
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (!selectedUser || !admin) return;

        try {
            await banUser(selectedUser.id, banReason, admin.id);
            await logAdminAction(admin.id, `Banned user: ${selectedUser.username}`, 'user', selectedUser.id, { reason: banReason });
            setShowBanModal(false);
            setBanReason('');
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            console.error('Error banning user:', error);
            alert('Failed to ban user');
        }
    };

    const handleUnban = async (user: UserData) => {
        if (!admin) return;

        if (!confirm(`Unban user ${user.username}?`)) return;

        try {
            await unbanUser(user.id, admin.id);
            await logAdminAction(admin.id, `Unbanned user: ${user.username}`, 'user', user.id);
            loadUsers();
        } catch (error) {
            console.error('Error unbanning user:', error);
            alert('Failed to unban user');
        }
    };

    const handleDelete = async (user: UserData) => {
        if (!admin) return;

        if (!confirm(`⚠️ DELETE user ${user.username}? This cannot be undone!`)) return;

        try {
            await deleteUser(user.id, admin.id);
            await logAdminAction(admin.id, `Deleted user: ${user.username}`, 'user', user.id);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
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
                    <h1 className="text-3xl font-bold text-white mb-2">User Management 👥</h1>
                    <p className="text-gray-400">Manage all registered users</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by username or partner name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading users...</div>
                ) : (
                    <>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Username</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Partner</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Registered</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-white font-medium">{user.username}</td>
                                            <td className="px-6 py-4 text-gray-300">{user.partner_name}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2 items-start">
                                                    {user.is_banned ? (
                                                        <span className="px-2 py-1 text-xs font-medium bg-red-900/30 text-red-400 rounded-full">
                                                            🚫 Banned
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full">
                                                            ✅ Active
                                                        </span>
                                                    )}

                                                    {/* Mode Badge */}
                                                    {user.isActive ? (
                                                        <span className="px-2 py-1 text-xs font-bold bg-purple-900/30 text-purple-400 rounded-full border border-purple-500/30">
                                                            🚀 Live Mode
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-bold bg-yellow-900/30 text-yellow-500 rounded-full border border-yellow-500/30">
                                                            🛠️ Preview Mode
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {user.is_banned ? (
                                                        <button
                                                            onClick={() => handleUnban(user)}
                                                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all"
                                                        >
                                                            Unban
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowBanModal(true);
                                                            }}
                                                            className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-all"
                                                        >
                                                            Ban
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-gray-400 text-sm">
                                Showing {users.length} of {total} users
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={users.length < 20}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Ban Modal */}
                {showBanModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Ban User: {selectedUser.username}</h3>
                            <textarea
                                placeholder="Reason for ban..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 mb-4"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBan}
                                    disabled={!banReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Ban User
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBanModal(false);
                                        setBanReason('');
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
