// Authentication and role-based access control utilities
import { supabase } from "./supabase";
import { authService } from "./authService";

export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

const STORAGE_KEY = "salon_auth_user";

// Default users for the system
export const DEFAULT_USERS: User[] = [
  {
    id: "admin-1",
    username: "admin",
    role: "admin",
    name: "Administrator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  {
    id: "staff-1",
    username: "staff",
    role: "staff",
    name: "Staff",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
  },
];

// Initialize users in Supabase and localStorage if not exists
export const initializeUsers = async (): Promise<void> => {
  try {
    // First check if we already have users in localStorage to avoid unnecessary initialization
    const localUsers = localStorage.getItem(STORAGE_KEY);
    if (localUsers) {
      console.log("Users already exist in localStorage");
      return; // Skip initialization if users already exist locally
    }

    // Check if users exist in Supabase with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Supabase query timed out")), 15000); // Increased timeout
    });

    // Safely access Supabase client
    let queryPromise;
    try {
      // Check if supabase client is properly initialized
      if (!supabase || !supabase.from) {
        console.error("Supabase client not properly initialized");
        // Initialize default users in localStorage as fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return; // Exit early if supabase client is not available
      }
      queryPromise = supabase.from("users").select("*");
    } catch (err) {
      console.error("Error creating Supabase query:", err);
      // Initialize default users in localStorage as fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return;
    }

    const { data: supabaseUsers, error } = (await Promise.race([
      queryPromise,
      timeoutPromise,
    ]).catch((err) => {
      console.error("Timeout or error checking users:", err);
      return { data: null, error: err };
    })) || { data: null, error: new Error("Failed to query users") };

    if (error) {
      console.error("Error checking users in Supabase:", error.message);
      // Continue execution instead of throwing error
      console.log("Continuing despite error checking users");
    }

    // If no users in Supabase, initialize with default users
    if (!supabaseUsers || supabaseUsers.length === 0) {
      console.log(
        "No users found in Supabase, initializing with default users",
      );

      // Create admin user in auth.users
      try {
        const { data: adminAuthData, error: adminAuthError } =
          await supabase.auth.signUp({
            email: "admin@example.com",
            password: "admin",
            options: {
              data: {
                username: "admin",
                full_name: "Administrator",
                role: "admin",
                avatar_url:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
              },
            },
          });

        if (adminAuthError) {
          console.error("Error creating admin auth user:", adminAuthError);
        } else {
          console.log("Admin auth user created successfully");
        }

        // Create staff user in auth.users
        const { data: staffAuthData, error: staffAuthError } =
          await supabase.auth.signUp({
            email: "staff@example.com",
            password: "staff",
            options: {
              data: {
                username: "staff",
                full_name: "Staff",
                role: "staff",
                avatar_url:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
              },
            },
          });

        if (staffAuthError) {
          console.error("Error creating staff auth user:", staffAuthError);
        } else {
          console.log("Staff auth user created successfully");
        }
      } catch (authError) {
        console.error("Error creating default auth users:", authError);
      }

      // Map default users to Supabase structure
      const supabaseDefaultUsers = DEFAULT_USERS.map((user) => ({
        id: user.id,
        username: user.username,
        full_name: user.name,
        role: user.role,
        status: "active",
        avatar_url: user.avatar || null,
      }));

      // Insert default users into Supabase
      try {
        const { error: insertError } = await supabase
          .from("users")
          .upsert(supabaseDefaultUsers);

        if (insertError) {
          console.error("Error initializing users in Supabase:", insertError);
        } else {
          console.log("Successfully initialized users in Supabase");
        }
      } catch (upsertError) {
        console.error("Failed to upsert users:", upsertError);
        // Continue execution despite error
      }
    } else {
      console.log("Users already exist in Supabase:", supabaseUsers.length);
    }
  } catch (error: any) {
    console.error("Error in initializeUsers:", error?.message || error);
    // Don't rethrow the error, allow the application to continue
  }
};

// Get all users from Supabase
export const getUsers = async (): Promise<User[]> => {
  try {
    // Try to get users from Supabase
    const { data: supabaseUsers, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      console.error("Error fetching users from Supabase:", error);
      throw error;
    }

    if (supabaseUsers && supabaseUsers.length > 0) {
      // Map Supabase users to our User type
      const mappedUsers: User[] = supabaseUsers.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
        name: user.full_name,
        avatar: user.avatar_url,
      }));

      return mappedUsers;
    }

    return [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    return [];
  }
};

// Login function - uses Supabase authentication
export const login = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    // First, find the user's email by username
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("status", "active");

    if (userError) {
      console.error("Error finding user by username:", userError);
      throw userError;
    }

    if (!users || users.length === 0) {
      console.error("User not found:", username);
      return null;
    }

    // For demo purposes, use hardcoded emails for default users
    let email = "";
    if (username === "admin") {
      email = "admin@example.com";
    } else if (username === "staff") {
      email = "staff@example.com";
    } else {
      // For other users, we would need to store their email in the users table
      // This is a simplification for the demo
      email = `${username}@example.com`;
    }

    // Now sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error during login:", error);

      // For demo purposes, if login fails with Supabase auth, use the public.users table
      const user: User = {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role as UserRole,
        name: users[0].full_name,
        avatar: users[0].avatar_url,
      };

      // Store the current user in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    if (!data.user) {
      console.error("No user returned from signIn");
      return null;
    }

    // Map Supabase user to our User type
    const user: User = {
      id: users[0].id,
      username: users[0].username,
      role: users[0].role as UserRole,
      name: users[0].full_name,
      avatar: users[0].avatar_url,
    };

    // Store the current user in localStorage for offline access
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error in login:", error);
    return null;
  }
};

// Logout function - uses Supabase authentication
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  } catch (error) {
    console.error("Error in logout:", error);
  } finally {
    // Always clear local storage
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Get the current logged-in user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First check Supabase session with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Session query timed out")), 3000);
    });

    const sessionPromise = supabase.auth.getSession();

    const { data: sessionData, error: sessionError } = (await Promise.race([
      sessionPromise,
      timeoutPromise,
    ]).catch((err) => {
      console.error("Timeout or error getting session:", err);
      return { data: { session: null }, error: err };
    })) || {
      data: { session: null },
      error: new Error("Failed to get session"),
    };

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue to fallback instead of throwing error
    }

    if (sessionData?.session) {
      // User is authenticated with Supabase
      try {
        const userPromise = supabase
          .from("users")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single();

        const { data: userData, error: userError } = (await Promise.race([
          userPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("User data query timed out")),
              3000,
            ),
          ),
        ]).catch((err) => {
          console.error("Timeout or error getting user data:", err);
          return { data: null, error: err };
        })) || { data: null, error: new Error("Failed to get user data") };

        if (userError) {
          console.error("Error getting user data:", userError);
          // Continue to next fallback instead of throwing error
        } else if (userData) {
          const user: User = {
            id: userData.id,
            username: userData.username,
            role: userData.role as UserRole,
            name: userData.full_name,
            avatar: userData.avatar_url,
          };

          // Update localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      } catch (innerError) {
        console.error("Error fetching user data:", innerError);
        // Continue to fallback
      }

      // If we couldn't get user data from the database but have a session,
      // try to get user data from the session
      try {
        const authUserPromise = supabase.auth.getUser();

        const { data: authUser } = (await Promise.race([
          authUserPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Auth user query timed out")),
              3000,
            ),
          ),
        ]).catch((err) => {
          console.error("Timeout or error getting auth user:", err);
          return { data: { user: null } };
        })) || { data: { user: null } };

        if (authUser?.user?.user_metadata) {
          const metadata = authUser.user.user_metadata;
          const user: User = {
            id: authUser.user.id,
            username: metadata.username || "user",
            role: (metadata.role as UserRole) || "staff",
            name: metadata.full_name || metadata.username || "User",
            avatar: metadata.avatar_url,
          };

          // Update localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      } catch (authUserError) {
        console.error("Error getting auth user:", authUserError);
        // Continue to fallback
      }
    }

    // Fallback to localStorage for offline access
    const userJson = localStorage.getItem(STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    // Fallback to localStorage
    const userJson = localStorage.getItem(STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
};

// Synchronous version for immediate use (falls back to localStorage)
// This is used for components that can't wait for async operations
export const getCurrentUserSync = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user has specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUserSync();
  if (!user) return false;

  if (role === "staff") {
    // Admin can do everything staff can do
    return user.role === "staff" || user.role === "admin";
  }

  return user.role === role;
};

// Async version that checks against Supabase
export const hasRoleAsync = async (role: UserRole): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // Verify user exists and is active in Supabase
    const { data, error } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .eq("status", "active")
      .single();

    if (error || !data) {
      console.error("Error verifying user role:", error);
      // Fall back to local check
      return hasRole(role);
    }

    if (role === "staff") {
      // Admin can do everything staff can do
      return data.role === "staff" || data.role === "admin";
    }

    return data.role === role;
  } catch (error) {
    console.error("Error in hasRoleAsync:", error);
    // Fall back to local check
    return hasRole(role);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUserSync() !== null;
};

// Async version that checks against Supabase
export const isAuthenticatedAsync = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};
