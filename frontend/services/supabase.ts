import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const applyLeave = async (leaveData: {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  team_name: string;
}) => {
  try {
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User authentication error:', userError);
      throw new Error('Authentication failed: ' + userError.message);
    }
    
    if (!user) {
      throw new Error("User not authenticated. Please login again.");
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Prepare the leave data
    const leaveRecord = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
      email: user.email,
      leave_type: leaveData.leave_type,
      start_date: leaveData.start_date,
      end_date: leaveData.end_date,
      reason: leaveData.reason,
      team_name: leaveData.team_name,
      status: "Pending"
    };

    console.log('Inserting leave record:', leaveRecord);

    // Insert leave request into database
    const { data, error } = await supabase
      .from("leaves")
      .insert([leaveRecord])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error('Failed to submit leave request: ' + error.message);
    }

    console.log('Leave request submitted successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('Apply leave error:', error);
    throw error;
  }
};

// Additional helper function to get user leaves
export const getUserLeaves = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("leaves")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;

  } catch (error: any) {
    console.error('Get user leaves error:', error);
    throw error;
  }
};