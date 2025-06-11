import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SupabaseStatus from "./SupabaseStatus";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Scissors,
  ShoppingBag,
  Users,
  Calendar,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { getCurrentUserSync, logout, hasRole } from "@/lib/auth";

const Home = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUserSync();
  const isAdmin = hasRole("admin");

  // State untuk menyimpan pengaturan salon
  const [salonName, setSalonName] = useState("Salon Beauty");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=salon",
  );

  // Load pengaturan dari localStorage saat komponen dimuat
  useEffect(() => {
    const generalSettings = localStorage.getItem("salon_settings_general");
    if (generalSettings) {
      const parsed = JSON.parse(generalSettings);
      setSalonName(parsed.salonName || "Salon Beauty");
      setAvatarUrl(
        parsed.avatarUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=salon",
      );
    }
  }, []);

  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState([]);

  // State for daily summary
  const [dailySummary, setDailySummary] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    topService: "-",
    topStaff: "-",
  });

  // Load recent transactions and calculate daily summary from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactionHistory");
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Filter transactions for today
        const todayTransactions = parsedTransactions.filter((trx) => {
          const trxDate = new Date(trx.date).toISOString().split("T")[0];
          return trxDate === today;
        });

        // Calculate daily summary
        const totalRevenue = todayTransactions.reduce(
          (sum, trx) => sum + trx.total,
          0,
        );
        const transactionCount = todayTransactions.length;

        // Find top service
        const serviceCount: Record<string, number> = {};
        todayTransactions.forEach((trx) => {
          trx.items?.forEach((item) => {
            if (item.type === "service" && item.name) {
              serviceCount[item.name] = (serviceCount[item.name] || 0) + 1;
            }
          });
        });

        // Find top staff
        const staffCount: Record<string, number> = {};
        todayTransactions.forEach((trx) => {
          trx.items?.forEach((item) => {
            if (item.type === "service" && item.staffId) {
              staffCount[item.staffId] = (staffCount[item.staffId] || 0) + 1;
            }
          });
        });

        // Get top service and staff
        let topService = "-";
        let maxServiceCount = 0;
        for (const [service, count] of Object.entries(serviceCount)) {
          if (count > maxServiceCount) {
            maxServiceCount = count;
            topService = service;
          }
        }

        let topStaff = "-";
        let maxStaffCount = 0;
        for (const [staffId, count] of Object.entries(staffCount)) {
          if (count > maxStaffCount) {
            maxStaffCount = count;
            // Get staff name from staffId
            const storedStaff = localStorage.getItem("stafData");
            if (storedStaff) {
              try {
                const staffList = JSON.parse(storedStaff);
                const staff = staffList.find((s: any) => s.id === staffId);
                if (staff && staff.nama) {
                  topStaff = staff.nama;
                }
              } catch (error) {
                console.error("Error parsing staff data:", error);
              }
            }
          }
        }

        // Update daily summary
        setDailySummary({
          totalRevenue,
          transactionCount,
          topService,
          topStaff,
        });

        // Get the 4 most recent transactions
        const recentTrx = parsedTransactions
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 4)
          .map((trx) => ({
            id: trx.id || `trx-${Math.random().toString(36).substr(2, 9)}`,
            customer: trx.customer?.name || "Pelanggan",
            service:
              trx.items && trx.items[0]
                ? trx.items[0].name || "Layanan"
                : "Layanan",
            staff: trx.staff || "-",
            amount: trx.total || 0,
            time:
              trx.time ||
              new Date(trx.date).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              }),
          }));

        if (recentTrx.length > 0) {
          setRecentTransactions(recentTrx);
        }
      } catch (error) {
        console.error("Error parsing transaction history:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="flex items-center mb-8">
          <Avatar className="h-10 w-10 mr-2">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>SB</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">{salonName}</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dasbor
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/transaksi">
              <PlusCircle className="mr-2 h-5 w-5" />
              Transaksi Baru
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/appointment">
              <Calendar className="mr-2 h-5 w-5" />
              Jadwal Appointment
            </Link>
          </Button>

          {/* Admin-only menu items */}
          {isAdmin && (
            <>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/manajemen/layanan">
                  <Scissors className="mr-2 h-5 w-5" />
                  Layanan
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/manajemen/produk">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Produk
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/manajemen/staf">
                  <Users className="mr-2 h-5 w-5" />
                  Staf
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/manajemen/pelanggan">
                  <Users className="mr-2 h-5 w-5" />
                  Pelanggan
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/laporan">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Laporan Harian
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/laporan/komisi">
                  <Users className="mr-2 h-5 w-5" />
                  Laporan Komisi
                </Link>
              </Button>
            </>
          )}
        </nav>

        <div className="pt-4 border-t">
          {isAdmin && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/pengaturan">
                <Settings className="mr-2 h-5 w-5" />
                Pengaturan
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold md:hidden">{salonName}</h1>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground mr-4">
                  <Calendar className="inline mr-1 h-4 w-4" />
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <SupabaseStatus />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden md:inline-block">
                  {currentUser?.name || "User"}
                </span>
                <Avatar>
                  <AvatarFallback>
                    {currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Akses fitur utama dengan cepat
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button className="w-full" asChild>
                  <Link to="/transaksi">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Transaksi Baru
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/appointment">
                    <Calendar className="mr-2 h-5 w-5" />
                    Jadwal Appointment
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {isAdmin ? (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/manajemen/layanan">
                          <Scissors className="mr-2 h-4 w-4" />
                          Layanan
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/manajemen/produk">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Produk
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/manajemen/staf">
                          <Users className="mr-2 h-4 w-4" />
                          Staf
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/laporan">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Laporan
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/transaksi/riwayat">
                          <Clock className="mr-2 h-4 w-4" />
                          Riwayat
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={handleLogout}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profil
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Hari Ini</CardTitle>
                <CardDescription>Statistik transaksi hari ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Total Pendapatan
                  </span>
                  <span className="text-xl font-bold">
                    Rp {dailySummary.totalRevenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Jumlah Transaksi
                  </span>
                  <span className="text-lg font-medium">
                    {dailySummary.transactionCount}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Layanan Terpopuler
                  </span>
                  <Badge variant="secondary">{dailySummary.topService}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Staf Terproduktif
                  </span>
                  <Badge variant="outline">{dailySummary.topStaff}</Badge>
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/laporan">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Lihat Laporan Lengkap
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>
                  Transaksi yang baru saja selesai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.customer}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span>{transaction.service}</span>
                              <span className="mx-1">•</span>
                              <span>{transaction.staff}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{transaction.time}</span>
                            </div>
                          </div>
                          <span className="font-medium">
                            Rp {transaction.amount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada transaksi hari ini
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/transaksi/riwayat">Lihat Semua Transaksi</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Services and Products Tabs */}
          <div className="mt-6">
            <Tabs defaultValue="services">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="services">Layanan</TabsTrigger>
                  <TabsTrigger value="products">Produk</TabsTrigger>
                </TabsList>
                {isAdmin && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/manajemen">Kelola Data</Link>
                  </Button>
                )}
              </div>

              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Sample service cards */}
                  {[
                    { name: "Potong Rambut", price: 75000 },
                    { name: "Creambath", price: 150000 },
                    { name: "Facial", price: 200000 },
                    { name: "Manicure", price: 85000 },
                    { name: "Pedicure", price: 95000 },
                    { name: "Hair Coloring", price: 350000 },
                    { name: "Hair Spa", price: 175000 },
                    { name: "Smoothing", price: 500000 },
                  ].map((service, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-primary/10 p-6 flex items-center justify-center">
                          <Scissors className="h-8 w-8 text-primary" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-muted-foreground mt-1">
                            Rp {service.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Sample product cards */}
                  {[
                    { name: "Shampoo Premium", price: 120000 },
                    { name: "Conditioner", price: 110000 },
                    { name: "Hair Mask", price: 85000 },
                    { name: "Hair Vitamin", price: 150000 },
                    { name: "Hair Serum", price: 95000 },
                    { name: "Face Wash", price: 75000 },
                    { name: "Face Cream", price: 125000 },
                    { name: "Body Lotion", price: 110000 },
                  ].map((product, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-secondary/10 p-6 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-secondary" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-muted-foreground mt-1">
                            Rp {product.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Salon Beauty. Sistem Kasir Salon
            Kecantikan.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
