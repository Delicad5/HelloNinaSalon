import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Database, Wifi, WifiOff } from "lucide-react";

const SupabaseStatus = () => {
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setStatus("checking");
      // Just check if we can connect to Supabase at all
      const { error } = await supabase
        .from("users")
        .select("count")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Supabase connection error:", error);
        setStatus("disconnected");
      } else {
        setStatus("connected");
      }
    } catch (error) {
      console.error("Error checking Supabase connection:", error);
      setStatus("disconnected");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();

    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge
              variant={
                status === "connected"
                  ? "success"
                  : status === "checking"
                    ? "outline"
                    : "destructive"
              }
              className={`flex items-center gap-1 ${status === "connected" ? "bg-green-100 text-green-800" : status === "checking" ? "" : ""}`}
            >
              <Database className="h-3 w-3" />
              {status === "connected" ? (
                <Wifi className="h-3 w-3" />
              ) : status === "checking" ? (
                <span className="animate-pulse">...</span>
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              Supabase
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status === "connected"
              ? "Terhubung ke database Supabase"
              : status === "checking"
                ? "Memeriksa koneksi ke Supabase..."
                : "Tidak terhubung ke database Supabase"}
          </p>
          {lastChecked && (
            <p className="text-xs text-muted-foreground">
              Terakhir diperiksa: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SupabaseStatus;
