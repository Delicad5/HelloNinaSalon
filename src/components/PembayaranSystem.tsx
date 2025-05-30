import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Wallet,
  QrCode,
  Banknote,
  Printer,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface PembayaranSystemProps {
  totalBayar?: number;
  onSelesai?: () => void;
  onBatal?: () => void;
}

const PembayaranSystem = ({
  totalBayar: propsTotalBayar,
  onSelesai = () => {},
  onBatal = () => {},
}: PembayaranSystemProps) => {
  const [transactionData, setTransactionData] = useState<any>(null);
  const [totalBayar, setTotalBayar] = useState(propsTotalBayar || 250000);
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState({
    cashEnabled: true,
    cardEnabled: true,
    qrisEnabled: true,
    ewalletEnabled: true,
    defaultPayment: "cash",
  });
  const [showLogoOnReceipt, setShowLogoOnReceipt] = useState(true);
  const [jumlahTunai, setJumlahTunai] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Load transaction data and payment settings from localStorage
  useEffect(() => {
    // Load transaction data
    const storedTransaction = localStorage.getItem("currentTransaction");
    if (storedTransaction) {
      const parsedTransaction = JSON.parse(storedTransaction);
      setTransactionData(parsedTransaction);
      setTotalBayar(parsedTransaction.total);
    }

    // Load payment settings
    const paymentSettings = localStorage.getItem("salon_settings_payment");
    if (paymentSettings) {
      try {
        const parsed = JSON.parse(paymentSettings);
        setEnabledPaymentMethods({
          cashEnabled:
            parsed.cashEnabled !== undefined ? parsed.cashEnabled : true,
          cardEnabled:
            parsed.cardEnabled !== undefined ? parsed.cardEnabled : true,
          qrisEnabled:
            parsed.qrisEnabled !== undefined ? parsed.qrisEnabled : true,
          ewalletEnabled:
            parsed.ewalletEnabled !== undefined ? parsed.ewalletEnabled : true,
          defaultPayment: parsed.defaultPayment || "cash",
        });
      } catch (error) {
        console.error("Error loading payment settings:", error);
      }
    }

    // Load printer settings for logo display
    const printerSettings = localStorage.getItem("salon_settings_printer");
    if (printerSettings) {
      try {
        const parsed = JSON.parse(printerSettings);
        setShowLogoOnReceipt(
          parsed.showLogo !== undefined ? parsed.showLogo : true,
        );
      } catch (error) {
        console.error("Error loading printer settings:", error);
      }
    }
  }, []);

  // Set default payment method based on settings
  useEffect(() => {
    if (enabledPaymentMethods.defaultPayment && metodePembayaran === "") {
      // Check if default payment method is enabled
      const defaultMethod = enabledPaymentMethods.defaultPayment;
      const isDefaultEnabled =
        (defaultMethod === "cash" && enabledPaymentMethods.cashEnabled) ||
        (defaultMethod === "card" && enabledPaymentMethods.cardEnabled) ||
        (defaultMethod === "qris" && enabledPaymentMethods.qrisEnabled) ||
        (defaultMethod === "ewallet" && enabledPaymentMethods.ewalletEnabled);

      if (isDefaultEnabled) {
        setMetodePembayaran(defaultMethod);
      } else {
        // Find first enabled payment method
        if (enabledPaymentMethods.cashEnabled) setMetodePembayaran("tunai");
        else if (enabledPaymentMethods.cardEnabled)
          setMetodePembayaran("kartu");
        else if (enabledPaymentMethods.qrisEnabled) setMetodePembayaran("qris");
        else if (enabledPaymentMethods.ewalletEnabled)
          setMetodePembayaran("ewallet");
      }
    }
  }, [enabledPaymentMethods, metodePembayaran]);

  const kembalian = jumlahTunai ? parseInt(jumlahTunai) - totalBayar : 0;

  const handleSelesaiPembayaran = () => {
    // Save completed transaction to history
    if (transactionData) {
      const completedTransaction = {
        ...transactionData,
        id: `TRX-${Date.now().toString().slice(-6)}`,
        paymentMethod: metodePembayaran,
        status: "completed",
        time: new Date().toLocaleTimeString("id-ID"),
        date: new Date().toISOString(), // Ensure we have a consistent date format
      };

      // Get existing transactions or initialize empty array
      const existingTransactions = JSON.parse(
        localStorage.getItem("transactionHistory") || "[]",
      );

      // Add new transaction to history
      existingTransactions.unshift(completedTransaction); // Add to beginning for most recent first

      // Save updated history
      localStorage.setItem(
        "transactionHistory",
        JSON.stringify(existingTransactions),
      );

      // Clear current transaction
      localStorage.removeItem("currentTransaction");

      // Update customer's last visit date if applicable
      if (transactionData.customer && transactionData.customer.id) {
        try {
          const storedPelanggan = localStorage.getItem("pelangganData");
          if (storedPelanggan) {
            const pelangganItems = JSON.parse(storedPelanggan);
            const updatedPelanggan = pelangganItems.map((pelanggan) => {
              if (pelanggan.id === transactionData.customer.id) {
                return {
                  ...pelanggan,
                  kunjunganTerakhir: new Date().toISOString().split("T")[0],
                };
              }
              return pelanggan;
            });
            localStorage.setItem(
              "pelangganData",
              JSON.stringify(updatedPelanggan),
            );
          }
        } catch (error) {
          console.error("Error updating customer visit date:", error);
        }
      }
    }

    setShowSuccessDialog(true);
  };

  const handleCetakStruk = () => {
    // Get salon settings for receipt
    const generalSettings = localStorage.getItem("salon_settings_general");
    let salonName = "SALON BEAUTY";
    let salonAddress = "Jl. Kecantikan No. 123";
    let salonPhone = "021-12345678";
    let logoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=salon";

    if (generalSettings) {
      try {
        const parsed = JSON.parse(generalSettings);
        salonName = parsed.salonName || "SALON BEAUTY";
        salonAddress = parsed.salonAddress || "Jl. Kecantikan No. 123";
        salonPhone = parsed.salonPhone || "021-12345678";
        logoUrl =
          parsed.avatarUrl ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=salon";
      } catch (error) {
        console.error("Error parsing general settings:", error);
      }
    }

    // Create a printable receipt
    const receiptContent = document.createElement("div");
    receiptContent.innerHTML = `
      <div style="font-family: monospace; width: 300px; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          ${showLogoOnReceipt ? `<img src="${logoUrl}" alt="Logo Salon" style="width: 80px; height: 80px; margin-bottom: 10px;">` : ""}
          <h2 style="margin: 0;">${salonName}</h2>
          <p style="margin: 5px 0;">${salonAddress}</p>
          <p style="margin: 5px 0;">Telp: ${salonPhone}</p>
          <p style="margin: 5px 0;">${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}</p>
          <hr style="border-top: 1px dashed #000; margin: 10px 0;" />
        </div>
        <div>
          <p style="margin: 5px 0;"><b>STRUK PEMBAYARAN</b></p>
          <p style="margin: 5px 0;">Total: ${formatRupiah(totalBayar)}</p>
          ${
            metodePembayaran === "tunai"
              ? `<p style="margin: 5px 0;">Tunai: ${jumlahTunai ? formatRupiah(parseInt(jumlahTunai)) : "-"}</p>
          <p style="margin: 5px 0;">Kembalian: ${jumlahTunai ? formatRupiah(kembalian) : "-"}</p>`
              : ""
          }
          <p style="margin: 5px 0;">Metode: ${metodePembayaran.toUpperCase()}</p>
          <hr style="border-top: 1px dashed #000; margin: 10px 0;" />
        </div>
        <div style="text-align: center;">
          <p style="margin: 5px 0;">Terima kasih atas kunjungan Anda</p>
          <p style="margin: 5px 0;">Sampai jumpa kembali</p>
        </div>
      </div>
    `;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Struk Pembayaran</title></head><body>",
    );
    printWindow.document.write(receiptContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Print the receipt
    setTimeout(() => {
      printWindow.print();
      printWindow.close();

      // Close dialog and return to main page
      setShowSuccessDialog(false);
      onSelesai();
    }, 500);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="bg-background p-6 rounded-lg w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pembayaran Transaksi</CardTitle>
          <CardDescription>
            Pilih metode pembayaran dan selesaikan transaksi
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Total Pembayaran</h3>
              <span className="text-2xl font-bold">
                {formatRupiah(totalBayar)}
              </span>
            </div>
            <Separator className="my-4" />
          </div>

          <Tabs
            defaultValue={metodePembayaran}
            value={metodePembayaran}
            onValueChange={setMetodePembayaran}
          >
            <TabsList
              className={`grid ${[enabledPaymentMethods.cashEnabled, enabledPaymentMethods.cardEnabled, enabledPaymentMethods.qrisEnabled, enabledPaymentMethods.ewalletEnabled].filter(Boolean).length}-cols mb-6`}
            >
              {enabledPaymentMethods.cashEnabled && (
                <TabsTrigger
                  value="tunai"
                  className="flex flex-col items-center gap-2 py-3"
                >
                  <Banknote className="h-5 w-5" />
                  <span>Tunai</span>
                </TabsTrigger>
              )}
              {enabledPaymentMethods.cardEnabled && (
                <TabsTrigger
                  value="kartu"
                  className="flex flex-col items-center gap-2 py-3"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Kartu</span>
                </TabsTrigger>
              )}
              {enabledPaymentMethods.qrisEnabled && (
                <TabsTrigger
                  value="qris"
                  className="flex flex-col items-center gap-2 py-3"
                >
                  <QrCode className="h-5 w-5" />
                  <span>QRIS</span>
                </TabsTrigger>
              )}
              {enabledPaymentMethods.ewalletEnabled && (
                <TabsTrigger
                  value="ewallet"
                  className="flex flex-col items-center gap-2 py-3"
                >
                  <Wallet className="h-5 w-5" />
                  <span>E-wallet</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="tunai" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="jumlah-tunai">Jumlah Tunai</Label>
                  <Input
                    id="jumlah-tunai"
                    type="number"
                    placeholder="Masukkan jumlah uang"
                    value={jumlahTunai}
                    onChange={(e) => setJumlahTunai(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Bayar</span>
                    <span className="font-medium">
                      {formatRupiah(totalBayar)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tunai</span>
                    <span className="font-medium">
                      {jumlahTunai ? formatRupiah(parseInt(jumlahTunai)) : "-"}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Kembalian</span>
                    <span
                      className={`font-bold ${kembalian < 0 ? "text-destructive" : "text-primary"}`}
                    >
                      {jumlahTunai ? formatRupiah(kembalian) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kartu" className="space-y-4">
              <div className="bg-muted p-6 rounded-md text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">
                  Pembayaran dengan Kartu Debit/Kredit
                </h3>
                <p className="text-muted-foreground mb-4">
                  Silakan gunakan mesin EDC untuk memproses pembayaran kartu
                </p>
                <div className="flex justify-center">
                  <div className="bg-background p-3 rounded-md border w-64 text-center">
                    <p className="font-medium">
                      Total: {formatRupiah(totalBayar)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qris" className="space-y-4">
              <div className="bg-muted p-6 rounded-md text-center">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">
                  Pembayaran dengan QRIS
                </h3>
                <p className="text-muted-foreground mb-4">
                  Scan kode QR berikut untuk melakukan pembayaran
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-md border w-48 h-48 flex items-center justify-center">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=qris"
                      alt="QRIS Code"
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-background p-3 rounded-md border w-64 text-center">
                    <p className="font-medium">
                      Total: {formatRupiah(totalBayar)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ewallet" className="space-y-4">
              <div className="bg-muted p-6 rounded-md text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">
                  Pembayaran dengan E-wallet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Pilih penyedia e-wallet untuk melanjutkan pembayaran
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-4">
                  {["GoPay", "OVO", "DANA", "LinkAja"].map((wallet) => (
                    <Button key={wallet} variant="outline" className="h-16">
                      {wallet}
                    </Button>
                  ))}
                </div>

                <div className="flex justify-center">
                  <div className="bg-background p-3 rounded-md border w-64 text-center">
                    <p className="font-medium">
                      Total: {formatRupiah(totalBayar)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBatal}>
            Batal
          </Button>
          <Button
            onClick={handleSelesaiPembayaran}
            disabled={
              metodePembayaran === "tunai" &&
              (jumlahTunai === "" || parseInt(jumlahTunai) < totalBayar)
            }
          >
            Selesaikan Pembayaran
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Pembayaran Berhasil
            </AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi telah berhasil diselesaikan. Apakah Anda ingin mencetak
              struk?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleCetakStruk}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk
            </AlertDialogAction>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                onSelesai();
                window.location.href = "/";
              }}
              className="flex items-center gap-2"
            >
              Kembali ke Beranda
              <ArrowRight className="h-4 w-4" />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PembayaranSystem;
