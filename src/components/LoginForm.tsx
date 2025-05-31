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
import { login, initializeUsers } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize default users if needed
  React.useEffect(() => {
    const initUsers = async () => {
      try {
        await initializeUsers();
        console.log("Users initialized successfully");
      } catch (error) {
        console.error("Failed to initialize users:", error);
      }
    };
    initUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, we'll use simple credentials
      // Admin: username="admin", password="admin"
      // Staff: username="staff", password="staff"
      const user = await login(username, password);

      if (user) {
        toast({
          title: "Login berhasil",
          description: `Selamat datang, ${user.name}!`,
        });
        navigate("/");
      } else {
        toast({
          title: "Login gagal",
          description: "Username atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login gagal",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Salon Beauty</CardTitle>
          <CardDescription>Login untuk mengakses sistem kasir</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="grid gap-4">
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Belum punya akun?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Daftar di sini
              </Link>
            </div>
          </CardFooter>
        </form>
        <div className="px-6 pb-4 text-center text-sm text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Admin: username="admin", password="admin"</p>
          <p>Staff: username="staff", password="staff"</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
