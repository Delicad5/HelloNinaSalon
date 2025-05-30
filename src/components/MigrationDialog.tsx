import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { migrateDataToSupabase } from "@/lib/migrationUtils";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [migrationStatus, setMigrationStatus] = useState<
    "idle" | "migrating" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleStartMigration = async () => {
    try {
      setMigrationStatus("migrating");
      setMessage("Memulai migrasi data ke Supabase...");

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Perform the actual migration
      const result = await migrateDataToSupabase();

      clearInterval(progressInterval);

      if (result.success) {
        setProgress(100);
        setMigrationStatus("success");
        setMessage(
          "Migrasi data berhasil! Semua data telah dipindahkan ke Supabase.",
        );
        toast({
          title: "Migrasi Berhasil",
          description: "Semua data telah berhasil dipindahkan ke Supabase.",
        });
      } else {
        setMigrationStatus("error");
        setMessage(`Migrasi gagal: ${result.message}`);
        toast({
          title: "Migrasi Gagal",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setMigrationStatus("error");
      setMessage(`Terjadi kesalahan: ${error.message}`);
      toast({
        title: "Terjadi Kesalahan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (migrationStatus !== "migrating") {
      onOpenChange(false);
      // Reset state if dialog is closed
      if (migrationStatus === "success" || migrationStatus === "error") {
        setTimeout(() => {
          setMigrationStatus("idle");
          setProgress(0);
          setMessage("");
        }, 300);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migrasi Data ke Supabase
          </DialogTitle>
          <DialogDescription>
            Proses ini akan memindahkan semua data dari penyimpanan lokal
            (localStorage) ke database Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {migrationStatus === "idle" && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm">
                Pastikan Anda telah mengatur kredensial Supabase dengan benar di
                pengaturan aplikasi sebelum melanjutkan.
              </p>
              <p className="text-sm mt-2">Data yang akan dimigrasi:</p>
              <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                <li>Pengguna</li>
                <li>Pelanggan</li>
                <li>Staf</li>
                <li>Layanan</li>
                <li>Produk</li>
                <li>Transaksi</li>
                <li>Appointment</li>
                <li>Pengaturan</li>
              </ul>
            </div>
          )}

          {migrationStatus === "migrating" && (
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm">{message}</p>
            </div>
          )}

          {migrationStatus === "success" && (
            <div className="bg-green-50 p-4 rounded-md flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Migrasi Berhasil</h4>
                <p className="text-sm text-green-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          {migrationStatus === "error" && (
            <div className="bg-red-50 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Migrasi Gagal</h4>
                <p className="text-sm text-red-700 mt-1">{message}</p>
                <p className="text-sm text-red-700 mt-2">
                  Silakan periksa konsol browser untuk detail lebih lanjut.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {migrationStatus === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button onClick={handleStartMigration}>Mulai Migrasi</Button>
            </>
          )}

          {migrationStatus === "migrating" && (
            <Button disabled>Sedang Migrasi...</Button>
          )}

          {(migrationStatus === "success" || migrationStatus === "error") && (
            <Button onClick={handleClose}>Tutup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;
