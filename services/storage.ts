import { User, ValentineConfig, DayType, DEFAULT_CONTENT, Confession } from '../types';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

const USERS_TABLE = 'users';
const CONFIG_TABLE = 'valentine_config';

export const registerUser = async (username: string, partnerName: string, pin: string): Promise<User> => {

  // 1. Check if username exists
  const { data: existingUser } = await supabase
    .from(USERS_TABLE)
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) throw new Error("Username already taken");

  // 2. Hash PIN for security
  const hashedPin = await bcrypt.hash(pin, 10);

  // 3. Create User
  const newUser = {
    username,
    partner_name: partnerName,
    pin: hashedPin
  };

  const { data: user, error: userError } = await supabase
    .from(USERS_TABLE)
    .insert(newUser)
    .select()
    .single();

  if (userError || !user) throw new Error(userError?.message || "Failed to create user");

  // 4. Create Default Config
  const initialConfig = {
    user_id: user.id,
    is_active: false,
    days_content: DEFAULT_CONTENT,
    confessions: []
  };

  const { error: configError } = await supabase
    .from(CONFIG_TABLE)
    .insert(initialConfig);

  if (configError) {
    console.error("Config creation failed:", configError);
    // Ideally rollback user creation here, but for simple app just throw
    throw new Error("Failed to initialize user config");
  }

  // Map back to frontend User type
  return {
    id: user.id,
    username: user.username,
    partnerName: user.partner_name,
    pin: user.pin
  };
};

export const loginUser = async (username: string, pin: string): Promise<User> => {
  // First, get user by username only
  const { data: user, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) throw new Error("Invalid credentials");

  // Then verify PIN using bcrypt
  const isValidPin = await bcrypt.compare(pin, user.pin);
  if (!isValidPin) throw new Error("Invalid credentials");

  return {
    id: user.id,
    username: user.username,
    partnerName: user.partner_name,
    pin: user.pin
  };
};

export const getUser = async (userId: string): Promise<User | null> => {
  const { data: user, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) return null;

  return {
    id: user.id,
    username: user.username,
    partnerName: user.partner_name,
    pin: user.pin
  };
};

export const getUserConfig = async (userId: string): Promise<ValentineConfig | null> => {
  const { data: config, error } = await supabase
    .from(CONFIG_TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !config) return null;

  // Map DB columns to ValentineConfig type
  return {
    userId: config.user_id,
    isActive: config.is_active,
    days: config.days_content, // Supabase handles JSON parsing
    confessions: config.confessions || []
  };
};

export const updateUserConfig = async (userId: string, day: DayType, content: any): Promise<void> => {
  // First get current config to merge
  const current = await getUserConfig(userId);
  if (current) {
    const updatedDays = {
      ...current.days,
      [day]: { ...current.days[day], ...content }
    };

    const { error } = await supabase
      .from(CONFIG_TABLE)
      .update({ days_content: updatedDays })
      .eq('user_id', userId);

    if (error) console.error("Failed to update config:", error);
  }
};

export const updateConfigStatus = async (userId: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from(CONFIG_TABLE)
    .update({ is_active: isActive })
    .eq('user_id', userId);

  if (error) console.error("Failed to update config status:", error);
};

export const saveConfession = async (userId: string, text: string, day: DayType, customId?: string): Promise<void> => {
  const current = await getUserConfig(userId);
  if (current) {
    // Generate ID: Use provided customId (for session persistence) or generate new one
    const confessionId = customId || Date.now().toString();

    // Remove existing entry with the same ID to prevent duplicates (Update Logic)
    const otherConfessions = current.confessions.filter(c => c.id !== confessionId);

    // Create new confession entry
    const confession: Confession = {
      id: confessionId,
      date: new Date().toISOString(),
      text,
      day
    };

    // Add new (or updated) confession
    const updatedConfessions = [...otherConfessions, confession];

    const { error } = await supabase
      .from(CONFIG_TABLE)
      .update({ confessions: updatedConfessions })
      .eq('user_id', userId);

    if (error) console.error("Failed to save confession:", error);
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

export const getAllUsers = async (page = 1, limit = 20, search = '') => {
  try {
    let query = supabase
      .from(USERS_TABLE)
      .select(`
        *,
        valentine_config!valentine_config_user_id_fkey (is_active)
      `, { count: 'exact' });

    if (search) query = query.or(`username.ilike.%${search}%,partner_name.ilike.%${search}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    // Flatten structure for easier UI consumption
    const enrichedUsers = data?.map((user: any) => ({
      ...user,
      isActive: user.valentine_config?.[0]?.is_active ?? false // Default to false (preview)
    }));

    return { users: enrichedUsers, total: count };
  } catch (err) {
    console.error('getAllUsers failed:', err);
    throw err;
  }
};

export const banUser = async (userId: string, reason: string, adminId: string) => {
  await supabase.from(USERS_TABLE).update({ is_banned: true, banned_at: new Date().toISOString(), banned_reason: reason }).eq('id', userId);
  await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'ban_user', target_type: 'user', target_id: userId, details: { reason } });
};

export const unbanUser = async (userId: string, adminId: string) => {
  await supabase.from(USERS_TABLE).update({ is_banned: false, banned_at: null, banned_reason: null }).eq('id', userId);
  await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'unban_user', target_type: 'user', target_id: userId });
};

export const deleteUser = async (userId: string, adminId: string) => {
  await supabase.from(CONFIG_TABLE).delete().eq('user_id', userId);
  await supabase.from(USERS_TABLE).delete().eq('id', userId);
  await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'delete_user', target_type: 'user', target_id: userId });
};

export const getAllConfessions = async () => {
  const { data: configs, error } = await supabase
    .from(CONFIG_TABLE)
    .select(`
      user_id,
      confessions,
      users:user_id (username, partner_name)
    `);

  if (error) {
    console.error('Error fetching confessions:', error);
    return [];
  }

  const allConfessions: any[] = [];
  configs?.forEach(config => {
    const username = (config as any).users?.username || 'Unknown User';
    const partnerName = (config as any).users?.partner_name || 'Unknown';

    config.confessions?.forEach((confession: any) => {
      allConfessions.push({
        ...confession,
        userId: config.user_id,
        username,
        partnerName
      });
    });
  });

  return allConfessions;
};

export const deleteConfession = async (userId: string, confessionId: string, adminId: string) => {
  const { data: config } = await supabase.from(CONFIG_TABLE).select('confessions').eq('user_id', userId).single();
  if (!config) throw new Error('Config not found');
  const updated = config.confessions.filter((c: any) => c.id !== confessionId);
  await supabase.from(CONFIG_TABLE).update({ confessions: updated }).eq('user_id', userId);
  await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'delete_confession', target_type: 'confession', target_id: confessionId });
};
