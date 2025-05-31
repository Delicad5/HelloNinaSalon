import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  isAuthenticated,
  hasRole,
  UserRole,
  isAuthenticatedAsync,
  hasRoleAsync,
} from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout to ensure we don't get stuck in checking state
    const maxCheckingTimeout = setTimeout(() => {
      if (isChecking) {
        console.log("Auth check taking too long, using fallback");
        // Use sync check as fallback
        if (!isAuthenticated()) {
          setRedirectTo("/login");
        } else if (requiredRole && !hasRole(requiredRole)) {
          setRedirectTo("/unauthorized");
        } else {
          setIsAuthorized(true);
        }
        setIsChecking(false);
      }
    }, 5000); // 5 seconds max for auth checking

    // Add a small delay to ensure auth state is properly initialized
    const timer = setTimeout(() => {
      const checkAuth = async () => {
        try {
          // First do a quick sync check to avoid flickering
          if (!isAuthenticated()) {
            console.log("Sync check: Not authenticated");
            setRedirectTo("/login");
            setIsChecking(false);
            return;
          }

          // Then do a more thorough async check against Supabase with timeout
          try {
            const authCheckPromise = isAuthenticatedAsync();
            const timeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error("Auth check timed out")), 3000);
            });

            const authenticated = await Promise.race([
              authCheckPromise,
              timeoutPromise,
            ]).catch((error) => {
              console.error("Auth check timed out or failed:", error);
              // Fall back to sync check result
              return isAuthenticated();
            });

            if (!authenticated) {
              console.log("Async check: Not authenticated");
              setRedirectTo("/login");
              setIsChecking(false);
              return;
            }
          } catch (asyncError) {
            console.error("Error in async auth check:", asyncError);
            // Continue with sync check result if async fails
          }

          // If a specific role is required, check for that role
          if (requiredRole) {
            try {
              const roleCheckPromise = hasRoleAsync(requiredRole);
              const roleTimeoutPromise = new Promise<boolean>((_, reject) => {
                setTimeout(
                  () => reject(new Error("Role check timed out")),
                  3000,
                );
              });

              const hasRequiredRole = await Promise.race([
                roleCheckPromise,
                roleTimeoutPromise,
              ]).catch((error) => {
                console.error("Role check timed out or failed:", error);
                // Fall back to sync role check
                return hasRole(requiredRole);
              });

              if (!hasRequiredRole) {
                console.log(
                  `User does not have required role: ${requiredRole}`,
                );
                setRedirectTo("/unauthorized");
                setIsChecking(false);
                return;
              }
            } catch (roleError) {
              console.error("Error checking role:", roleError);
              // Fall back to sync role check
              if (!hasRole(requiredRole)) {
                setRedirectTo("/unauthorized");
                setIsChecking(false);
                return;
              }
            }
          }

          // User is authenticated and has the required role (if any)
          console.log("User is authorized");
          setIsAuthorized(true);
          setIsChecking(false);
        } catch (error) {
          console.error("Error checking authentication:", error);

          // Fallback to sync checks if async fails
          if (!isAuthenticated()) {
            setRedirectTo("/login");
          } else if (requiredRole && !hasRole(requiredRole)) {
            setRedirectTo("/unauthorized");
          } else {
            setIsAuthorized(true);
          }

          setIsChecking(false);
        }
      };

      checkAuth();
    }, 300); // Slightly longer delay to ensure auth state is initialized

    return () => {
      clearTimeout(timer);
      clearTimeout(maxCheckingTimeout);
    };
  }, [requiredRole]);

  if (isChecking) {
    // Show a loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking authentication...
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default AuthGuard;
