import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const RunMigrationButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const runMigration = async () => {
    setIsLoading(true);
    try {
      // Get the service key from the environment
      const serviceKey =
        import.meta.env.VITE_SUPABASE_SERVICE_KEY ||
        import.meta.env.SUPABASE_SERVICE_KEY;

      if (!serviceKey) {
        throw new Error(
          "Service key tidak ditemukan. Pastikan SUPABASE_SERVICE_KEY telah diatur.",
        );
      }

      // Call the edge function to run migrations
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-run_migrations",
        {
          headers: {
            Authorization: `Bearer ${serviceKey}`,
          },
        },
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Migrasi Berhasil",
        description: "Database telah berhasil dibuat di Supabase.",
      });

      // After successful migration, you might want to migrate local data
      // This is optional and depends on your needs
      // You can show the MigrationDialog here if needed
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Migrasi Gagal",
        description:
          error.message || "Terjadi kesalahan saat menjalankan migrasi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={runMigration}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Database className="h-4 w-4" />
      {isLoading ? "Menjalankan Migrasi..." : "Jalankan Migrasi Database"}
    </Button>
  );
};

export default RunMigrationButton;
