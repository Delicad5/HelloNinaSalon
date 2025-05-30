import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, getMonth, getYear } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  Download,
  Filter,
  Printer,
  ArrowLeft,
} from "lucide-react";

interface Transaction {
  id: string;
  date: Date;
  customer: string;
  staff: string;
  services: string[];
  products: string[];
  total: number;
  paymentMethod: string;
}

const LaporanHarian = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [filterStaff, setFilterStaff] = useState<string>("");
  const [filterService, setFilterService] = useState<string>("");
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Get transaction data from localStorage or use mock data as fallback
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactionHistory");
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);

      // Transform the data to match the Transaction interface
      const formattedTransactions = parsedTransactions.map((trx) => {
        // Extract service and product names from items
        const services = trx.items
          .filter((item) => item.type === "service")
          .map((item) => item.name);

        const products = trx.items
          .filter((item) => item.type === "product")
          .map((item) => item.name);

        return {
          id: trx.id,
          date: new Date(trx.date),
          customer: trx.customer?.name || "",
          staff: trx.items.find((item) => item.staffId)?.staffId || "-",
          services,
          products,
          total: trx.total,
          paymentMethod: trx.paymentMethod,
        };
      });

      setTransactions(formattedTransactions);
    } else {
      // Mock data for demonstration (fallback)
      setTransactions([
        {
          id: "TRX-001",
          date: new Date(),
          customer: "Ani Susanti",
          staff: "Dewi",
          services: ["Potong Rambut", "Creambath"],
          products: ["Shampoo Makarizo"],
          total: 250000,
          paymentMethod: "Tunai",
        },
        {
          id: "TRX-002",
          date: new Date(),
          customer: "Budi Santoso",
          staff: "Rina",
          services: ["Potong Rambut Pria"],
          products: [],
          total: 50000,
          paymentMethod: "QRIS",
        },
        {
          id: "TRX-003",
          date: new Date(),
          customer: "Citra Dewi",
          staff: "Dewi",
          services: ["Facial", "Manicure"],
          products: ["Masker Wajah", "Kutek OPI"],
          total: 350000,
          paymentMethod: "Kartu Kredit",
        },
      ]);
    }
  }, []);

  // Mock data for staff and services
  const staffList = ["Semua Staff", "Dewi", "Rina", "Santi", "Agus"];
  const servicesList = [
    "Semua Layanan",
    "Potong Rambut",
    "Creambath",
    "Facial",
    "Manicure",
    "Pedicure",
    "Hair Coloring",
  ];

  // Calculate summary data
  const totalRevenue = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const cashRevenue = transactions
    .filter((trx) => trx.paymentMethod === "Tunai")
    .reduce((sum, trx) => sum + trx.total, 0);
  const nonCashRevenue = totalRevenue - cashRevenue;
  const serviceRevenue = transactions.reduce(
    (sum, trx) => sum + trx.services.length * 100000,
    0,
  ); // Simplified calculation
  const productRevenue = totalRevenue - serviceRevenue;

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter((trx) => {
    let dateMatches = false;

    if (reportType === "daily") {
      dateMatches =
        format(trx.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    } else if (reportType === "monthly") {
      const trxMonth = getMonth(trx.date);
      const trxYear = getYear(trx.date);
      const selectedMonthValue = getMonth(selectedMonth);
      const selectedYearValue = getYear(selectedMonth);
      dateMatches =
        trxMonth === selectedMonthValue && trxYear === selectedYearValue;
    }

    const staffMatches =
      !filterStaff ||
      filterStaff === "Semua Staff" ||
      trx.staff === filterStaff;
    const serviceMatches =
      !filterService ||
      filterService === "Semua Layanan" ||
      trx.services.some((service) => service === filterService);

    return dateMatches && staffMatches && serviceMatches;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, this would generate a PDF or Excel file
    alert("Mengunduh laporan dalam format PDF...");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {reportType === "daily" ? "Laporan Harian" : "Laporan Bulanan"}
          </h1>
          <div className="flex items-center gap-4">
            <Tabs
              value={reportType}
              onValueChange={(value) =>
                setReportType(value as "daily" | "monthly")
              }
              className="mt-2"
            >
              <TabsList>
                <TabsTrigger value="daily">Harian</TabsTrigger>
                <TabsTrigger value="monthly">Bulanan</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="link"
              onClick={() => navigate("/laporan/komisi")}
              className="text-primary"
            >
              Lihat Laporan Komisi
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendapatan Tunai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {cashRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendapatan Non-Tunai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {nonCashRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendapatan Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {serviceRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendapatan Produk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {productRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata per Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp{" "}
              {(totalRevenue / (transactions.length || 1)).toLocaleString(
                "id-ID",
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan</CardTitle>
              <CardDescription>
                Pilih tanggal, staff, atau layanan untuk memfilter data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportType === "daily" ? (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="date" className="text-sm font-medium">
                    Tanggal
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(date, "dd MMMM yyyy", { locale: id })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="month" className="text-sm font-medium">
                    Bulan
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedMonth, "MMMM yyyy", { locale: id })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedMonth}
                        onSelect={(date) => date && setSelectedMonth(date)}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={2020}
                        toYear={2030}
                        showOutsideDays={false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <label htmlFor="staff" className="text-sm font-medium">
                  Staff
                </label>
                <Select value={filterStaff} onValueChange={setFilterStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff} value={staff}>
                        {staff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label htmlFor="service" className="text-sm font-medium">
                  Layanan
                </label>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesList.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setFilterStaff("");
                  setFilterService("");
                  setDate(new Date());
                  setSelectedMonth(new Date());
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-[2]">
          <Tabs defaultValue="transaksi">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transaksi">Daftar Transaksi</TabsTrigger>
              <TabsTrigger value="staff">Kinerja Staff</TabsTrigger>
            </TabsList>
            <TabsContent value="transaksi" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Transaksi</CardTitle>
                  <CardDescription>
                    {reportType === "daily" ? (
                      <>
                        Transaksi pada tanggal{" "}
                        {format(date, "dd MMMM yyyy", { locale: id })}
                      </>
                    ) : (
                      <>
                        Transaksi pada bulan{" "}
                        {format(selectedMonth, "MMMM yyyy", { locale: id })}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Pembayaran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((trx) => (
                          <TableRow key={trx.id}>
                            <TableCell>{trx.id}</TableCell>
                            <TableCell>{trx.customer}</TableCell>
                            <TableCell>{trx.staff}</TableCell>
                            <TableCell>{trx.services.join(", ")}</TableCell>
                            <TableCell>
                              {trx.products.length > 0
                                ? trx.products.join(", ")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {trx.total.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell>{trx.paymentMethod}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Tidak ada transaksi pada tanggal ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="staff" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kinerja Staff</CardTitle>
                  <CardDescription>
                    {reportType === "daily" ? (
                      <>
                        Ringkasan kinerja staff pada tanggal{" "}
                        {format(date, "dd MMMM yyyy", { locale: id })}
                      </>
                    ) : (
                      <>
                        Ringkasan kinerja staff pada bulan{" "}
                        {format(selectedMonth, "MMMM yyyy", { locale: id })}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead className="text-center">
                          Jumlah Layanan
                        </TableHead>
                        <TableHead className="text-right">
                          Total Pendapatan
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffList
                        .filter((staff) => staff !== "Semua Staff")
                        .map((staff) => {
                          const staffTransactions = filteredTransactions.filter(
                            (trx) => trx.staff === staff,
                          );
                          const totalServices = staffTransactions.reduce(
                            (sum, trx) => sum + trx.services.length,
                            0,
                          );
                          const totalRevenue = staffTransactions.reduce(
                            (sum, trx) => sum + trx.total,
                            0,
                          );

                          return (
                            <TableRow key={staff}>
                              <TableCell>{staff}</TableCell>
                              <TableCell className="text-center">
                                {totalServices}
                              </TableCell>
                              <TableCell className="text-right">
                                Rp {totalRevenue.toLocaleString("id-ID")}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LaporanHarian;
