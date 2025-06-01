import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Create a function to initialize the Supabase client
const createSupabaseClient = () => {
  // Only run this code in the browser
  if (typeof window === "undefined") {
    // Return a dummy client during SSR/build time
    return {
      from: () => ({}),
      auth: { onAuthStateChange: () => ({ data: null, error: null }) },
      // Add other methods that might be used during SSR
    } as any;
  }

  // Get environment variables with fallbacks for production
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Validate environment variables at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables. Please check your environment configuration.",
    );

    // In production, we'll show a more user-friendly error
    if (import.meta.env.PROD && typeof document !== "undefined") {
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h1 style="color: #333;">Configuration Error</h1>
          <p style="color: #666;">The application is missing required configuration. Please contact support.</p>
        </div>
      `;
    }

    // Return a dummy client to prevent crashes
    return {
      from: () => ({}),
      auth: { onAuthStateChange: () => ({ data: null, error: null }) },
      // Add other methods that might be used
    } as any;
  }

  // Create and return the real Supabase client
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
    },
  });
};

// Export the initialized client
export const supabase = createSupabaseClient();
