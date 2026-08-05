import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey !== 'placeholder' &&
    supabaseAnonKey.length > 20
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

