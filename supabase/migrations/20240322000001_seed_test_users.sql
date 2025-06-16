-- Insert test users into auth.users (this is handled by Supabase Auth)
-- The following are example credentials that you can use:

-- Regular User:
-- Email: user@example.com
-- Password: user123456

-- Admin User:
-- Email: admin@example.com
-- Password: admin123456

-- Note: You'll need to create these users through the Supabase Auth UI or API first,
-- then their roles will be automatically assigned when they log in through the respective login pages.

-- The roles will be assigned automatically when they log in through the application,
-- but if you want to manually assign roles, you can use these SQL commands:

-- For regular user (after creating the user through Supabase Auth):
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'user'
-- FROM auth.users
-- WHERE email = 'user@example.com';

-- For admin user (after creating the user through Supabase Auth):
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'admin@example.com'; 