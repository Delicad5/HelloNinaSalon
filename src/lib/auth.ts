// Authentication and role-based access control utilities

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
const DEFAULT_USERS: User[] = [
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

// Initialize users in localStorage if not exists
export const initializeUsers = (): void => {
  const storedUsers = localStorage.getItem("salon_users");
  if (!storedUsers) {
    localStorage.setItem("salon_users", JSON.stringify(DEFAULT_USERS));
  }
};

// Get all users
export const getUsers = (): User[] => {
  const storedUsers = localStorage.getItem("salon_users");
  return storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
};

// Login function
export const login = (username: string, password: string): User | null => {
  // In a real app, you would validate the password against a hashed version
  // For this demo, we'll just check if the username exists
  const users = getUsers();
  const user = users.find((u) => u.username === username);

  if (user) {
    // Store the current user in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  return null;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get the current logged-in user
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(STORAGE_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user has specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  if (role === "staff") {
    // Admin can do everything staff can do
    return user.role === "staff" || user.role === "admin";
  }

  return user.role === role;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
