const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUsers() {
  try {
    // Create regular user
    const { data: regularUser, error: regularError } = await supabase.auth.admin.createUser({
      email: 'user@example.com',
      password: 'user123456',
      email_confirm: true
    });

    if (regularError) throw regularError;

    // Create admin user
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123456',
      email_confirm: true
    });

    if (adminError) throw adminError;

    // Assign roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: regularUser.user.id, role: 'user' },
        { user_id: adminUser.user.id, role: 'admin' }
      ]);

    if (roleError) throw roleError;

    console.log('Test users created successfully!');
    console.log('\nRegular User:');
    console.log('Email: user@example.com');
    console.log('Password: user123456');
    console.log('\nAdmin User:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUsers(); 