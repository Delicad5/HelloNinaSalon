import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, hasRole, UserRole } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check for that role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default AuthGuard;
