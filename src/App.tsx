import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import Home from "./components/home";
import TransaksiForm from "./components/TransaksiForm";
import RiwayatTransaksi from "./components/RiwayatTransaksi";
import PembayaranSystem from "./components/PembayaranSystem";
import ManajemenData from "./components/ManajemenData";
import LaporanHarian from "./components/LaporanHarian";
import LaporanKomisi from "./components/LaporanKomisi";
import Pengaturan from "./components/Pengaturan";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Unauthorized from "./components/Unauthorized";
import AuthGuard from "./components/AuthGuard";
import AppointmentScheduling from "./components/AppointmentScheduling";
import { isAuthenticated, getCurrentUser, initializeUsers } from "./lib/auth";
import { supabase } from "./lib/supabase";

function App() {
  // Tempo routes are only used in development
  // Import routes dynamically only in development
  let tempoRoutes;
  if (import.meta.env.DEV && import.meta.env.VITE_TEMPO === "true") {
    try {
      // @ts-ignore - This import is handled by the tempo plugin in development
      tempoRoutes = useRoutes(import("tempo-routes").default);
    } catch (e) {
      console.error("Failed to load tempo routes:", e);
    }
  }

  const [isLoading, setIsLoading] = useState(true);

  // Initialize users and set up auth state listener
  useEffect(() => {
    // Set a timeout to ensure loading state is eventually updated
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, forcing loading state to false");
        setIsLoading(false);
      }
    }, 5000); // Reduced to 5 seconds timeout

    const initApp = async () => {
      try {
        // Initialize default users in localStorage first for faster startup
        if (!localStorage.getItem("salon_auth_user")) {
          localStorage.setItem(
            "salon_auth_user",
            JSON.stringify(DEFAULT_USERS[0]),
          );
        }

        // Add a timeout promise to prevent hanging
        const initPromise = initializeUsers();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Initialization timed out")), 5000);
        });

        await Promise.race([initPromise, timeoutPromise]).catch((error) => {
          console.error("Initialization timed out or failed:", error);
        });

        console.log("Users initialization completed");

        // Check if user is already authenticated
        try {
          const user = getCurrentUserSync(); // Use sync version to avoid additional delays
          if (user) {
            console.log("User already authenticated:", user);
          }
        } catch (authError) {
          console.error("Error checking authentication:", authError);
        }
      } catch (error) {
        console.error("Failed to initialize users:", error);
      } finally {
        // Always set loading to false, even if there was an error
        setIsLoading(false);
      }
    };

    // Set up auth state listener with error handling
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          if (event === "SIGNED_IN") {
            try {
              // Update user in localStorage
              const user = await getCurrentUser();
              console.log("User signed in:", user);
            } catch (error) {
              console.error("Error handling sign in:", error);
            } finally {
              // Ensure loading state is updated
              setIsLoading(false);
            }
          } else if (event === "SIGNED_OUT") {
            // Clear user from localStorage
            localStorage.removeItem("salon_auth_user");
            console.log("User signed out");
            setIsLoading(false);
          }
        },
      );

      subscription = data.subscription;
    } catch (subError) {
      console.error("Error setting up auth state listener:", subError);
      setIsLoading(false);
    }

    initApp();

    // Clean up subscription and timeout
    return () => {
      clearTimeout(loadingTimeout);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      }
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" /> : <LoginForm />}
        />
        <Route
          path="/signup"
          element={isAuthenticated() ? <Navigate to="/" /> : <SignupForm />}
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Home />
            </AuthGuard>
          }
        />
        <Route
          path="/transaksi"
          element={
            <AuthGuard>
              <TransaksiForm />
            </AuthGuard>
          }
        />
        <Route
          path="/transaksi/riwayat"
          element={
            <AuthGuard>
              <RiwayatTransaksi />
            </AuthGuard>
          }
        />
        <Route
          path="/pembayaran"
          element={
            <AuthGuard>
              <PembayaranSystem />
            </AuthGuard>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/manajemen"
          element={
            <AuthGuard requiredRole="admin">
              <ManajemenData />
            </AuthGuard>
          }
        />
        <Route
          path="/manajemen/layanan"
          element={
            <AuthGuard requiredRole="admin">
              <ManajemenData />
            </AuthGuard>
          }
        />
        <Route
          path="/manajemen/produk"
          element={
            <AuthGuard requiredRole="admin">
              <ManajemenData />
            </AuthGuard>
          }
        />
        <Route
          path="/manajemen/staf"
          element={
            <AuthGuard requiredRole="admin">
              <ManajemenData />
            </AuthGuard>
          }
        />
        <Route
          path="/manajemen/pelanggan"
          element={
            <AuthGuard requiredRole="admin">
              <ManajemenData />
            </AuthGuard>
          }
        />
        <Route
          path="/laporan"
          element={
            <AuthGuard requiredRole="admin">
              <LaporanHarian />
            </AuthGuard>
          }
        />
        <Route
          path="/laporan/komisi"
          element={
            <AuthGuard requiredRole="admin">
              <LaporanKomisi />
            </AuthGuard>
          }
        />
        <Route
          path="/pengaturan"
          element={
            <AuthGuard requiredRole="admin">
              <Pengaturan />
            </AuthGuard>
          }
        />
        <Route
          path="/appointment"
          element={
            <AuthGuard>
              <AppointmentScheduling />
            </AuthGuard>
          }
        />

        {/* Tempo route for storyboards - only in development */}
        {import.meta.env.DEV && import.meta.env.VITE_TEMPO === "true" && (
          <Route path="/tempobook/*" element={<div />} />
        )}
        {/* The tempoRoutes variable is defined above and only used in development */}

        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
