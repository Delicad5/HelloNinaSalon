import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/authService";
import { supabase } from "@/lib/supabase";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (password !== confirmPassword) {
      toast({
        title: "Pendaftaran gagal",
        description: "Password dan konfirmasi password tidak sama",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!email) {
      toast({
        title: "Pendaftaran gagal",
        description: "Email harus diisi",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username);

      if (checkError) {
        console.error("Error checking username:", checkError.message);
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Pendaftaran gagal",
          description: "Username sudah digunakan",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Use the authService to sign up the user
      await authService.signUp(email, password, username, fullName);

      toast({
        title: "Pendaftaran berhasil",
        description: `Selamat datang, ${fullName}! Silakan cek email Anda untuk verifikasi.`,
      });

      // Sign in the user after successful registration
      const user = await authService.signIn(email, password);
      if (user) {
        navigate("/");
      } else {
        // If sign in fails, redirect to login page
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Pendaftaran gagal",
        description:
          error.message ||
          "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Salon Beauty</CardTitle>
          <CardDescription>Daftar untuk mengakses sistem kasir</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Masukkan password kembali"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
            <div className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login di sini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupForm;
