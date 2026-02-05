import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

const ADMINS_TABLE = 'admins';
const ADMIN_LOGS_TABLE = 'admin_logs';

export interface Admin {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'super_admin' | 'moderator';
    permissions: Record<string, boolean>;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
}

export interface AdminLog {
    id: string;
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

// Admin Authentication
export const loginAdmin = async (username: string, password: string): Promise<Admin> => {
    // Get admin by username
    const { data: admin, error } = await supabase
        .from(ADMINS_TABLE)
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

    if (error || !admin) throw new Error("Invalid credentials");

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) throw new Error("Invalid credentials");

    // Update last login
    await supabase
        .from(ADMINS_TABLE)
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

    return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || {},
        createdAt: admin.created_at,
        lastLogin: admin.last_login,
        isActive: admin.is_active
    };
};

// Check if current session is admin
export const getAdminSession = (): Admin | null => {
    const adminStr = localStorage.getItem('adminUser');
    if (!adminStr) return null;

    const timestamp = localStorage.getItem('adminSessionTimestamp');
    if (!timestamp) return null;

    // Check if session expired (15 minutes for admin)
    const elapsed = Date.now() - parseInt(timestamp);
    if (elapsed > 15 * 60 * 1000) {
        clearAdminSession();
        return null;
    }

    return JSON.parse(adminStr);
};

export const setAdminSession = (admin: Admin): void => {
    localStorage.setItem('adminUser', JSON.stringify(admin));
    localStorage.setItem('adminSessionTimestamp', Date.now().toString());
};

export const updateAdminActivity = (): void => {
    localStorage.setItem('adminSessionTimestamp', Date.now().toString());
};

export const clearAdminSession = (): void => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSessionTimestamp');
};

// Log admin actions
export const logAdminAction = async (
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any
): Promise<void> => {
    await supabase.from(ADMIN_LOGS_TABLE).insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
    });
};

// Get client IP (approximate)
const getClientIP = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
};

// Check admin permissions
export const hasPermission = (admin: Admin, permission: string): boolean => {
    if (admin.role === 'super_admin') return true;
    return admin.permissions[permission] === true;
};

export const changeAdminPassword = async (adminId: string, newPassword: string): Promise<void> => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
        .from(ADMINS_TABLE)
        .update({ password_hash: hashedPassword })
        .eq('id', adminId);

    if (error) throw new Error(error.message);

    await logAdminAction(adminId, 'change_password', 'admin', adminId);
};
