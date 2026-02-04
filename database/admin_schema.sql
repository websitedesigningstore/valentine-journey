-- ============================================
-- VALENTINE WEEK ADMIN PANEL - DATABASE SCHEMA
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Update users table with admin features
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_logins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 3. Create admin_logs table (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create content_flags table
CREATE TABLE IF NOT EXISTS content_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confession_id UUID,
  flagged_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  reason TEXT,
  ai_score FLOAT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  reviewed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create analytics_cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
  metric_name TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (CHANGE THIS IMMEDIATELY!)
-- Hash generated with bcrypt, 10 rounds

INSERT INTO admins (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@valentine.com',
  '$2a$10$Vi.kkgS/SKNqSsJ8a/2CwuMIB.pcPxw60xhAINh/GhxnxLY4VDrY6',
  'super_admin'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- ============================================

INSERT INTO system_settings (key, value) VALUES
  ('demo_mode', '{"enabled": false}'::jsonb),
  ('maintenance_mode', '{"enabled": false, "message": "We are under maintenance"}'::jsonb),
  ('theme', '{"primary": "#f43f5e", "secondary": "#ec4899"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DONE! 🎉
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase
-- 2. Change default admin password
-- 3. Test admin login
