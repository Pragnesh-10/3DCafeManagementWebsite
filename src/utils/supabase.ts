import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client if keys are present, otherwise log a warning
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://your-project-id.supabase.co")
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    "Supabase credentials are not configured or are using placeholder values. " +
    "The application will run in offline / mock localStorage mode."
  );
}
