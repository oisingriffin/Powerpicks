import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert the role using the service role client
    const { error } = await supabaseAdmin
      .from('user_roles')
      .insert([{ user_id: userId, role }]);

    if (error) {
      console.error('Role assignment error:', error);
      return NextResponse.json(
        { message: 'Failed to assign role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Error in assign-role route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 