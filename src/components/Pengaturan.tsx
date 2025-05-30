import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEYS = {
  GENERAL: "salon_settings_general",
  PRINTER: "salon_settings_printer",
  PAYMENT: "salon_settings_payment",
  USER: "salon_settings_user",
};

const Pengaturan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastSavedSection, setLastSavedSection] = useState("");

  // State untuk pengaturan umum
  const [salonName, setSalonName] = useState("Salon Beauty");
  const [salonAddress, setSalonAddress] = useState(
    "Jl. Kecantikan No. 123, Jakarta",
  );
  const [salonPhone, setSalonPhone] = useState("021-12345678");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [receiptEnabled, setReceiptEnabled] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=salon",
  );

  // State untuk pengaturan printer
  const [selectedPrinter, setSelectedPrinter] = useState("thermal-58mm");
  const [paperSize, setPaperSize] = useState("58mm");
  const [showLogo, setShowLogo] = useState(true);

  // State untuk pengaturan pembayaran
  const [cashEnabled, setCashEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [qrisEnabled, setQrisEnabled] = useState(true);
  const [ewalletEnabled, setEwalletEnabled] = useState(true);
  const [defaultPayment, setDefaultPayment] = useState("cash");

  // State untuk pengaturan pengguna
  const [username, setUsername] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Handle file upload untuk avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      // Load general settings
      const generalSettings = localStorage.getItem(STORAGE_KEYS.GENERAL);
      if (generalSettings) {
        const parsed = JSON.parse(generalSettings);
        setSalonName(parsed.salonName || "Salon Beauty");
        setSalonAddress(
          parsed.salonAddress || "Jl. Kecantikan No. 123, Jakarta",
        );
        setSalonPhone(parsed.salonPhone || "021-12345678");
        setTaxEnabled(
          parsed.taxEnabled !== undefined ? parsed.taxEnabled : true,
        );
        setReceiptEnabled(
          parsed.receiptEnabled !== undefined ? parsed.receiptEnabled : true,
        );
        setAvatarUrl(
          parsed.avatarUrl ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=salon",
        );
      }

      // Load printer settings
      const printerSettings = localStorage.getItem(STORAGE_KEYS.PRINTER);
      if (printerSettings) {
        const parsed = JSON.parse(printerSettings);
        setSelectedPrinter(parsed.selectedPrinter || "thermal-58mm");
        setPaperSize(parsed.paperSize || "58mm");
        setShowLogo(parsed.showLogo !== undefined ? parsed.showLogo : true);
      }

      // Load payment settings
      const paymentSettings = localStorage.getItem(STORAGE_KEYS.PAYMENT);
      if (paymentSettings) {
        const parsed = JSON.parse(paymentSettings);
        setCashEnabled(
          parsed.cashEnabled !== undefined ? parsed.cashEnabled : true,
        );
        setCardEnabled(
          parsed.cardEnabled !== undefined ? parsed.cardEnabled : true,
        );
        setQrisEnabled(
          parsed.qrisEnabled !== undefined ? parsed.qrisEnabled : true,
        );
        setEwalletEnabled(
          parsed.ewalletEnabled !== undefined ? parsed.ewalletEnabled : true,
        );
        setDefaultPayment(parsed.defaultPayment || "cash");
      }

      // Load user settings
      const userSettings = localStorage.getItem(STORAGE_KEYS.USER);
      if (userSettings) {
        const parsed = JSON.parse(userSettings);
        setUsername(parsed.username || "admin");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan tersimpan.",
        variant: "destructive",
      });
    }
  };

  // Handle simpan perubahan untuk setiap tab
  const handleSaveGeneral = () => {
    try {
      const generalSettings = {
        salonName,
        salonAddress,
        salonPhone,
        taxEnabled,
        receiptEnabled,
        avatarUrl,
      };

      localStorage.setItem(
        STORAGE_KEYS.GENERAL,
        JSON.stringify(generalSettings),
      );

      setLastSavedSection("umum");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error saving general settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan umum.",
        variant: "destructive",
      });
    }
  };

  const handleSavePrinter = () => {
    try {
      const printerSettings = {
        selectedPrinter,
        paperSize,
        showLogo,
      };

      localStorage.setItem(
        STORAGE_KEYS.PRINTER,
        JSON.stringify(printerSettings),
      );

      setLastSavedSection("printer");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error saving printer settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan printer.",
        variant: "destructive",
      });
    }
  };

  const handleSavePayment = () => {
    try {
      const paymentSettings = {
        cashEnabled,
        cardEnabled,
        qrisEnabled,
        ewalletEnabled,
        defaultPayment,
      };

      localStorage.setItem(
        STORAGE_KEYS.PAYMENT,
        JSON.stringify(paymentSettings),
      );

      setLastSavedSection("pembayaran");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan pembayaran.",
        variant: "destructive",
      });
    }
  };

  const handleSaveUser = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === "") {
      toast({
        title: "Error",
        description: "Masukkan password saat ini untuk melakukan perubahan.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, you would verify the current password and hash the new one
      // For this demo, we'll just store the username
      const userSettings = {
        username,
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSettings));

      setLastSavedSection("pengguna");
      setShowSuccessDialog(true);

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan pengguna.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
        </div>

        <Tabs defaultValue="umum" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="umum">Umum</TabsTrigger>
            <TabsTrigger value="printer">Printer</TabsTrigger>
            <TabsTrigger value="pembayaran">Pembayaran</TabsTrigger>
            <TabsTrigger value="pengguna">Pengguna</TabsTrigger>
          </TabsList>

          <TabsContent value="umum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
                <CardDescription>
                  Konfigurasi dasar untuk aplikasi kasir salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={avatarUrl} alt="Avatar salon" />
                    <AvatarFallback>SB</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md">
                        <Upload className="h-4 w-4" />
                        <span>Ubah Avatar</span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-name">Nama Salon</Label>
                  <Input
                    id="salon-name"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-address">Alamat</Label>
                  <Input
                    id="salon-address"
                    value={salonAddress}
                    onChange={(e) => setSalonAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-phone">Nomor Telepon</Label>
                  <Input
                    id="salon-phone"
                    value={salonPhone}
                    onChange={(e) => setSalonPhone(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-switch">Aktifkan Pajak (PPN 11%)</Label>
                  <Switch
                    id="tax-switch"
                    checked={taxEnabled}
                    onCheckedChange={setTaxEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="receipt-switch">Cetak Struk Otomatis</Label>
                  <Switch
                    id="receipt-switch"
                    checked={receiptEnabled}
                    onCheckedChange={setReceiptEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="printer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Printer</CardTitle>
                <CardDescription>
                  Konfigurasi printer untuk mencetak struk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="printer-select">Pilih Printer</Label>
                  <Select
                    value={selectedPrinter}
                    onValueChange={setSelectedPrinter}
                  >
                    <SelectTrigger id="printer-select">
                      <SelectValue placeholder="Pilih printer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thermal-58mm">
                        Thermal Printer 58mm
                      </SelectItem>
                      <SelectItem value="thermal-80mm">
                        Thermal Printer 80mm
                      </SelectItem>
                      <SelectItem value="inkjet-a4">
                        Inkjet Printer A4
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paper-size">Ukuran Kertas</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger id="paper-size">
                      <SelectValue placeholder="Pilih ukuran kertas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="logo-switch">Tampilkan Logo pada Struk</Label>
                  <Switch
                    id="logo-switch"
                    checked={showLogo}
                    onCheckedChange={setShowLogo}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePrinter}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pembayaran" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Pembayaran</CardTitle>
                <CardDescription>
                  Konfigurasi metode pembayaran yang tersedia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cash-switch">Tunai</Label>
                  <Switch
                    id="cash-switch"
                    checked={cashEnabled}
                    onCheckedChange={setCashEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-switch">Kartu Debit/Kredit</Label>
                  <Switch
                    id="card-switch"
                    checked={cardEnabled}
                    onCheckedChange={setCardEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="qris-switch">QRIS</Label>
                  <Switch
                    id="qris-switch"
                    checked={qrisEnabled}
                    onCheckedChange={setQrisEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ewallet-switch">E-Wallet</Label>
                  <Switch
                    id="ewallet-switch"
                    checked={ewalletEnabled}
                    onCheckedChange={setEwalletEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-payment">
                    Metode Pembayaran Default
                  </Label>
                  <Select
                    value={defaultPayment}
                    onValueChange={setDefaultPayment}
                  >
                    <SelectTrigger id="default-payment">
                      <SelectValue placeholder="Pilih metode default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="card">Kartu</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePayment}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pengguna" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Pengguna</CardTitle>
                <CardDescription>
                  Kelola akun dan hak akses pengguna
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nama Pengguna</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveUser}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Perubahan Berhasil Disimpan
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lastSavedSection === "umum" &&
                "Pengaturan umum telah berhasil disimpan dan akan ditampilkan pada dashboard."}
              {lastSavedSection === "printer" &&
                "Pengaturan printer telah berhasil disimpan."}
              {lastSavedSection === "pembayaran" &&
                "Pengaturan pembayaran telah berhasil disimpan."}
              {lastSavedSection === "pengguna" &&
                "Pengaturan pengguna telah berhasil disimpan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Lanjutkan
            </AlertDialogAction>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pengaturan;
