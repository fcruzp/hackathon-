import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { v4 as uuidv4 } from 'npm:uuid@9.0.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  position?: string;
  departmentId?: string;
  phone?: string;
  imageUrl?: string;
  licenseImageUrl?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify that the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user is an admin by checking their role in the users table
    const { data: adminData, error: adminError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData || adminData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only administrators can create new users' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get and validate request payload
    let payload: CreateUserPayload;
    try {
      payload = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate required fields
    if (!payload.email || !payload.firstName || !payload.lastName || !payload.role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName, lastName, and role are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    if (!validateEmail(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate role
    if (payload.role !== 'driver') {
      return new Response(
        JSON.stringify({ error: 'Only driver accounts can be created' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if email already exists
    const { data: existingUser, error: existingUserError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', payload.email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      throw existingUserError;
    }

    // Generate a unique ID for the new user
    const userId = uuidv4();

    // Create user profile
    const { data, error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: userId,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        role: payload.role,
        position: payload.position || null,
        department_id: payload.departmentId || null,
        phone: payload.phone || null,
        image_url: payload.imageUrl || null,
        license_image_url: payload.licenseImageUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique violation
        return new Response(
          JSON.stringify({ error: 'A user with this email already exists' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (insertError.code === '23503') { // Foreign key violation
        return new Response(
          JSON.stringify({ error: 'Invalid department ID' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw insertError;
    }

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        user: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Error in create-user function:', error);

    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred while creating the user',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});