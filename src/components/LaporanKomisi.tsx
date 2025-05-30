import React, { useState } from "react";
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
  TableFooter,
} from "@/components/ui/table";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  getMonth,
  getYear,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  Download,
  Filter,
  Printer,
  ArrowLeft,
  Users,
} from "lucide-react";

interface Transaction {
  id: string;
  date: Date;
  customer: string;
  staff: string;
  staffId: string;
  services: Array<{
    name: string;
    price: number;
    staffId: string;
    staffName: string;
    staffCommissionRate: number;
  }>;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  paymentMethod: string;
}

interface Staff {
  id: string;
  name: string;
  position: string;
  commissionRate: number;
}

const LaporanKomisi = () => {
  const [dateRange, setDateRange] = useState<
    "daily" | "weekly" | "monthly" | "custom"
  >("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDateRange, setShowDateRange] = useState<boolean>(false);

  // Mock data for staff
  const staffList: Staff[] = [
    { id: "1", name: "Dewi", position: "Hair Stylist", commissionRate: 10 },
    { id: "2", name: "Rina", position: "Beautician", commissionRate: 15 },
    { id: "3", name: "Santi", position: "Nail Artist", commissionRate: 12 },
    { id: "4", name: "Agus", position: "Massage Therapist", commissionRate: 8 },
  ];

  // Mock data for transactions
  const allTransactions: Transaction[] = [
    {
      id: "TRX-001",
      date: new Date(),
      customer: "Ani Susanti",
      staff: "Dewi",
      staffId: "1",
      services: [
        {
          name: "Potong Rambut",
          price: 75000,
          staffId: "1",
          staffName: "Dewi",
          staffCommissionRate: 10,
        },
        {
          name: "Creambath",
          price: 150000,
          staffId: "1",
          staffName: "Dewi",
          staffCommissionRate: 10,
        },
      ],
      products: [{ name: "Shampoo Makarizo", price: 120000, quantity: 1 }],
      total: 345000,
      paymentMethod: "Tunai",
    },
    {
      id: "TRX-002",
      date: new Date(),
      customer: "Budi Santoso",
      staff: "Rina",
      staffId: "2",
      services: [
        {
          name: "Facial",
          price: 200000,
          staffId: "2",
          staffName: "Rina",
          staffCommissionRate: 15,
        },
      ],
      products: [],
      total: 200000,
      paymentMethod: "QRIS",
    },
    {
      id: "TRX-003",
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      customer: "Citra Dewi",
      staff: "Santi",
      staffId: "3",
      services: [
        {
          name: "Manicure",
          price: 80000,
          staffId: "3",
          staffName: "Santi",
          staffCommissionRate: 12,
        },
        {
          name: "Pedicure",
          price: 90000,
          staffId: "3",
          staffName: "Santi",
          staffCommissionRate: 12,
        },
      ],
      products: [{ name: "Kutek OPI", price: 85000, quantity: 1 }],
      total: 255000,
      paymentMethod: "Kartu Kredit",
    },
    {
      id: "TRX-004",
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      customer: "Dian Sastro",
      staff: "Agus",
      staffId: "4",
      services: [
        {
          name: "Massage",
          price: 250000,
          staffId: "4",
          staffName: "Agus",
          staffCommissionRate: 8,
        },
      ],
      products: [],
      total: 250000,
      paymentMethod: "Tunai",
    },
    {
      id: "TRX-005",
      date: new Date(new Date().setDate(new Date().getDate() - 7)),
      customer: "Eko Prasetyo",
      staff: "Dewi",
      staffId: "1",
      services: [
        {
          name: "Hair Coloring",
          price: 350000,
          staffId: "1",
          staffName: "Dewi",
          staffCommissionRate: 10,
        },
      ],
      products: [{ name: "Hair Tonic", price: 95000, quantity: 1 }],
      total: 445000,
      paymentMethod: "E-wallet",
    },
  ];

  // Filter transactions based on selected date range and staff
  const getFilteredTransactions = () => {
    let filteredByDate: Transaction[] = [];

    switch (dateRange) {
      case "daily":
        filteredByDate = allTransactions.filter(
          (trx) =>
            format(trx.date, "yyyy-MM-dd") ===
            format(selectedDate, "yyyy-MM-dd"),
        );
        break;
      case "weekly":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as start of week
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        filteredByDate = allTransactions.filter((trx) =>
          isWithinInterval(trx.date, { start: weekStart, end: weekEnd }),
        );
        break;
      case "monthly":
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        filteredByDate = allTransactions.filter((trx) =>
          isWithinInterval(trx.date, { start: monthStart, end: monthEnd }),
        );
        break;
      case "custom":
        filteredByDate = allTransactions.filter((trx) =>
          isWithinInterval(trx.date, { start: startDate, end: endDate }),
        );
        break;
    }

    // Filter by staff if selected
    if (selectedStaff && selectedStaff !== "all") {
      return filteredByDate.filter((trx) => {
        // Check if any service was performed by the selected staff
        return trx.services.some(
          (service) => service.staffId === selectedStaff,
        );
      });
    }

    return filteredByDate;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate commission data for each staff member
  const calculateStaffCommissions = () => {
    const staffCommissions: Record<
      string,
      {
        staffId: string;
        name: string;
        position: string;
        commissionRate: number;
        totalCommission: number;
        serviceCount: number;
        serviceValue: number;
      }
    > = {};

    // Initialize with all staff
    staffList.forEach((staff) => {
      staffCommissions[staff.id] = {
        staffId: staff.id,
        name: staff.name,
        position: staff.position,
        commissionRate: staff.commissionRate,
        totalCommission: 0,
        serviceCount: 0,
        serviceValue: 0,
      };
    });

    // Calculate commissions from filtered transactions
    filteredTransactions.forEach((transaction) => {
      transaction.services.forEach((service) => {
        if (staffCommissions[service.staffId]) {
          const commission =
            (service.price * service.staffCommissionRate) / 100;
          staffCommissions[service.staffId].totalCommission += commission;
          staffCommissions[service.staffId].serviceCount += 1;
          staffCommissions[service.staffId].serviceValue += service.price;
        }
      });
    });

    return Object.values(staffCommissions);
  };

  const staffCommissions = calculateStaffCommissions();

  // Calculate total commission across all staff
  const totalCommission = staffCommissions.reduce(
    (sum, staff) => sum + staff.totalCommission,
    0,
  );
  const totalServiceValue = staffCommissions.reduce(
    (sum, staff) => sum + staff.serviceValue,
    0,
  );

  // Get all services with commission details
  const getAllCommissionServices = () => {
    const services: Array<{
      transactionId: string;
      date: Date;
      serviceName: string;
      staffName: string;
      price: number;
      commissionRate: number;
      commissionAmount: number;
    }> = [];

    filteredTransactions.forEach((transaction) => {
      transaction.services.forEach((service) => {
        const commissionAmount =
          (service.price * service.staffCommissionRate) / 100;
        services.push({
          transactionId: transaction.id,
          date: transaction.date,
          serviceName: service.name,
          staffName: service.staffName,
          price: service.price,
          commissionRate: service.staffCommissionRate,
          commissionAmount: commissionAmount,
        });
      });
    });

    return services;
  };

  const commissionServices = getAllCommissionServices();

  // Format date range for display
  const getDateRangeText = () => {
    switch (dateRange) {
      case "daily":
        return format(selectedDate, "dd MMMM yyyy", { locale: id });
      case "weekly":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, "dd MMM", { locale: id })} - ${format(weekEnd, "dd MMM yyyy", { locale: id })}`;
      case "monthly":
        return format(selectedDate, "MMMM yyyy", { locale: id });
      case "custom":
        return `${format(startDate, "dd MMM", { locale: id })} - ${format(endDate, "dd MMM yyyy", { locale: id })}`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, this would generate a PDF or Excel file
    alert("Mengunduh laporan komisi dalam format PDF...");
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
            Laporan Komisi Staff
          </h1>
          <Tabs
            value={dateRange}
            onValueChange={(value) =>
              setDateRange(value as "daily" | "weekly" | "monthly" | "custom")
            }
            className="mt-2"
          >
            <TabsList>
              <TabsTrigger value="daily">Harian</TabsTrigger>
              <TabsTrigger value="weekly">Mingguan</TabsTrigger>
              <TabsTrigger value="monthly">Bulanan</TabsTrigger>
              <TabsTrigger value="custom">Kustom</TabsTrigger>
            </TabsList>
          </Tabs>
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
              Total Komisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {totalCommission.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {totalServiceValue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                staffCommissions.filter((staff) => staff.serviceCount > 0)
                  .length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{commissionServices.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan</CardTitle>
              <CardDescription>
                Pilih periode waktu dan staff untuk memfilter data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dateRange === "daily" && (
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
                        {format(selectedDate, "dd MMMM yyyy", { locale: id })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {dateRange === "weekly" && (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="week" className="text-sm font-medium">
                    Minggu
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(
                          startOfWeek(selectedDate, { weekStartsOn: 1 }),
                          "dd MMM",
                          { locale: id },
                        )}{" "}
                        -{" "}
                        {format(
                          endOfWeek(selectedDate, { weekStartsOn: 1 }),
                          "dd MMM yyyy",
                          { locale: id },
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {dateRange === "monthly" && (
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
                        {format(selectedDate, "MMMM yyyy", { locale: id })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
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

              {dateRange === "custom" && (
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Tanggal Mulai
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "dd MMMM yyyy", { locale: id })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      Tanggal Akhir
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "dd MMMM yyyy", { locale: id })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-1.5">
                <label htmlFor="staff" className="text-sm font-medium">
                  Staff
                </label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Staff</SelectItem>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
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
                  setSelectedStaff("all");
                  setSelectedDate(new Date());
                  setStartDate(new Date());
                  setEndDate(new Date());
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-[2]">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Ringkasan Komisi</TabsTrigger>
              <TabsTrigger value="details">Detail Transaksi</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Komisi Staff</CardTitle>
                  <CardDescription>
                    Periode: {getDateRangeText()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Staff</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead className="text-center">
                          Jumlah Layanan
                        </TableHead>
                        <TableHead className="text-right">
                          Nilai Layanan
                        </TableHead>
                        <TableHead className="text-center">
                          Persentase Komisi
                        </TableHead>
                        <TableHead className="text-right">
                          Total Komisi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffCommissions.length > 0 ? (
                        staffCommissions.map((staff) => (
                          <TableRow key={staff.staffId}>
                            <TableCell className="font-medium">
                              {staff.name}
                            </TableCell>
                            <TableCell>{staff.position}</TableCell>
                            <TableCell className="text-center">
                              {staff.serviceCount}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {staff.serviceValue.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-center">
                              {staff.commissionRate}%
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {staff.totalCommission.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Tidak ada data komisi pada periode ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">
                          Rp {totalServiceValue.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          Rp {totalCommission.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Transaksi Komisi</CardTitle>
                  <CardDescription>
                    Periode: {getDateRangeText()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead className="text-right">
                          Harga Layanan
                        </TableHead>
                        <TableHead className="text-center">
                          Persentase
                        </TableHead>
                        <TableHead className="text-right">
                          Jumlah Komisi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionServices.length > 0 ? (
                        commissionServices.map((service, index) => (
                          <TableRow key={`${service.transactionId}-${index}`}>
                            <TableCell>{service.transactionId}</TableCell>
                            <TableCell>
                              {format(service.date, "dd/MM/yyyy", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>{service.serviceName}</TableCell>
                            <TableCell>{service.staffName}</TableCell>
                            <TableCell className="text-right">
                              Rp {service.price.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-center">
                              {service.commissionRate}%
                            </TableCell>
                            <TableCell className="text-right">
                              Rp{" "}
                              {service.commissionAmount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Tidak ada data transaksi pada periode ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4}>Total</TableCell>
                        <TableCell className="text-right">
                          Rp {totalServiceValue.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          Rp {totalCommission.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
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

export default LaporanKomisi;
