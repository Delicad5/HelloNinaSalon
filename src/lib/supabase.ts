import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Create a more robust dummy client with all necessary methods
const createDummyClient = () => {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: { from: () => ({}) },
    functions: { invoke: () => Promise.resolve({}) },
  } as any;
};

// Create a function to initialize the Supabase client
const createSupabaseClient = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // During build/SSR, return a dummy client
  if (!isBrowser) {
    return createDummyClient();
  }

  try {
    // Get environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Validate environment variables at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Missing Supabase environment variables. Using fallback configuration.",
      );

      // Try to use the non-VITE prefixed variables as fallback
      const fallbackUrl = import.meta.env.SUPABASE_URL;
      const fallbackKey = import.meta.env.SUPABASE_ANON_KEY;

      if (fallbackUrl && fallbackKey) {
        return createClient<Database>(fallbackUrl, fallbackKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      }

      // Log warning but don't show error screen in production
      if (import.meta.env.PROD && isBrowser) {
        console.warn("Using fallback Supabase configuration in production");
      }

      // Return a dummy client to prevent crashes
      return createDummyClient();
    }

    // Create and return the real Supabase client
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error("Error initializing Supabase client:", error);

    // Return a dummy client to prevent crashes
    return createDummyClient();
  }
};

// Create a lazy-loaded Supabase client
let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

// Export a function to get the Supabase client
export const supabase = (() => {
  if (!_supabase) {
    _supabase = createSupabaseClient();
  }
  return _supabase;
})();
