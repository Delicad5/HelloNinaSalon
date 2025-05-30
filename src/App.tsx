import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import TransaksiForm from "./components/TransaksiForm";
import RiwayatTransaksi from "./components/RiwayatTransaksi";
import PembayaranSystem from "./components/PembayaranSystem";
import ManajemenData from "./components/ManajemenData";
import LaporanHarian from "./components/LaporanHarian";
import LaporanKomisi from "./components/LaporanKomisi";
import Pengaturan from "./components/Pengaturan";
import LoginForm from "./components/LoginForm";
import Unauthorized from "./components/Unauthorized";
import AuthGuard from "./components/AuthGuard";
import AppointmentScheduling from "./components/AppointmentScheduling";
import routes from "tempo-routes";
import { isAuthenticated } from "./lib/auth";

function App() {
  // Use Tempo routes if VITE_TEMPO is true
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {tempoRoutes}
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" /> : <LoginForm />}
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

        {/* Tempo route for storyboards */}
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route path="/tempobook/*" element={<div />} />
        )}

        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
