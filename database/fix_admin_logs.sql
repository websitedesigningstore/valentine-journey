-- Fix admin_logs table to accept NULL for admin_id
-- This allows logging actions even when admin session might be expired

ALTER TABLE admin_logs ALTER COLUMN admin_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'admin_logs' AND column_name = 'admin_id';
