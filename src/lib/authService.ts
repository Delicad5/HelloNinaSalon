import { supabase } from "./supabase";
import { User, UserRole } from "./auth";

// Authentication service using Supabase
export const authService = {
  // Sign up a new user
  signUp: async (
    email: string,
    password: string,
    username: string,
    fullName: string,
  ) => {
    // Step 1: Create user in auth.users using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role: "staff" as UserRole,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from signUp");

    // Step 2: Create user in public.users table
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        username: username,
        full_name: fullName,
        role: "staff", // Default role for new users
        status: "active",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    return data.user;
  },

  // Sign in a user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from signIn");

    // Get additional user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found in public.users table");

    // Map to our User type
    const user: User = {
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      name: userData.full_name,
      avatar: userData.avatar_url,
    };

    return user;
  },

  // Sign out a user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get the current user
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return null;

    // Get additional user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (userError) return null;
    if (!userData) return null;

    // Map to our User type
    const user: User = {
      id: userData.id,
      username: userData.username,
      role: userData.role as UserRole,
      name: userData.full_name,
      avatar: userData.avatar_url,
    };

    return user;
  },

  // Check if user has a specific role
  hasRole: async (role: UserRole) => {
    const user = await authService.getCurrentUser();
    if (!user) return false;

    if (role === "staff") {
      // Admin can do everything staff can do
      return user.role === "staff" || user.role === "admin";
    }

    return user.role === role;
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const user = await authService.getCurrentUser();
    return user !== null;
  },
};
