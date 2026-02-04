-- ============================================
-- UPDATE ADMIN PASSWORD (Run this in Supabase)
-- ============================================
-- This will update the existing admin user with correct password hash
-- Password: admin123

-- Option 1: Update existing admin
UPDATE admins 
SET password_hash = '$2a$10$Vi.kkgS/SKNqSsJ8a/2CwuMIB.pcPxw60xhAINh/GhxnxLY4VDrY6'
WHERE username = 'admin';

-- Option 2: Delete and recreate (if update doesn't work)
-- DELETE FROM admins WHERE username = 'admin';
-- INSERT INTO admins (username, email, password_hash, role)
-- VALUES (
--   'admin',
--   'admin@valentine.com',
--   '$2a$10$Vi.kkgS/SKNqSsJ8a/2CwuMIB.pcPxw60xhAINh/GhxnxLY4VDrY6',
--   'super_admin'
-- );

-- Verify the update
SELECT username, email, role, password_hash 
FROM admins 
WHERE username = 'admin';
