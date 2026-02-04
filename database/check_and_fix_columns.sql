-- ============================================
-- CHECK IF ADMIN COLUMNS EXIST
-- ============================================
-- Run this to check if the admin columns were added to users table

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- ADD MISSING COLUMNS (if needed)
-- ============================================
-- Only run this if the columns are missing

DO $$ 
BEGIN
    -- Add is_banned column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_banned') THEN
        ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add banned_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='banned_at') THEN
        ALTER TABLE users ADD COLUMN banned_at TIMESTAMP;
    END IF;

    -- Add banned_reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='banned_reason') THEN
        ALTER TABLE users ADD COLUMN banned_reason TEXT;
    END IF;

    -- Add last_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_active') THEN
        ALTER TABLE users ADD COLUMN last_active TIMESTAMP;
    END IF;

    -- Add total_logins column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='total_logins') THEN
        ALTER TABLE users ADD COLUMN total_logins INTEGER DEFAULT 0;
    END IF;

    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ADD COLUMN email TEXT;
    END IF;

    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- ============================================
-- VERIFY COLUMNS WERE ADDED
-- ============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
  AND column_name IN ('is_banned', 'banned_at', 'banned_reason', 'last_active', 'total_logins', 'email', 'preferences')
ORDER BY column_name;
