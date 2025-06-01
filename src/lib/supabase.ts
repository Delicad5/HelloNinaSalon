import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Get environment variables with fallbacks for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validate environment variables at runtime only (not during build)
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "Missing Supabase environment variables. Please check your environment configuration.",
  );
  // In production, we'll show a more user-friendly error
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
        <h1 style="color: #333;">Configuration Error</h1>
        <p style="color: #666;">The application is missing required configuration. Please contact support.</p>
      </div>
    `;
  }
}

// Create Supabase client with error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});
