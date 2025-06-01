import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Calendar, Download, Filter } from "lucide-react";

const RiwayatTransaksi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get transaction history from localStorage or use mock data as fallback
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactionHistory");
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions);
    } else {
      // Mock data untuk riwayat transaksi (fallback)
      setTransactions([
        {
          id: "TRX-001",
          date: "2023-06-15",
          time: "10:30",
          customer: { name: "Ratna" },
          items: [{ name: "Potong Rambut" }, { name: "Creambath" }],
          total: 150000,
          paymentMethod: "Tunai",
          status: "completed",
          staff: "Siti",
        },
        {
          id: "TRX-002",
          date: "2023-06-15",
          time: "13:45",
          customer: { name: "Joko" },
          items: [{ name: "Hair Coloring" }],
          total: 350000,
          paymentMethod: "Kartu",
          status: "completed",
          staff: "Budi",
        },
        {
          id: "TRX-003",
          date: "2023-06-14",
          time: "15:20",
          customer: { name: "Maya" },
          items: [{ name: "Facial" }, { name: "Manicure" }],
          total: 230000,
          paymentMethod: "QRIS",
          status: "completed",
          staff: "Dewi",
        },
        {
          id: "TRX-004",
          date: "2023-06-14",
          time: "11:10",
          customer: { name: "Dian" },
          items: [{ name: "Shampoo Premium" }, { name: "Hair Mask" }],
          total: 205000,
          paymentMethod: "E-wallet",
          status: "completed",
          staff: "-",
        },
        {
          id: "TRX-005",
          date: "2023-06-13",
          time: "14:30",
          customer: { name: "Budi" },
          items: [{ name: "Potong Rambut" }],
          total: 50000,
          paymentMethod: "Tunai",
          status: "completed",
          staff: "Siti",
        },
      ]);
    }
  }, []);

  // Filter transaksi berdasarkan pencarian dan status
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.customer?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Format tanggal ke format Indonesia
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-background p-4 md:p-6 rounded-lg">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Riwayat Transaksi</h2>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Filter and Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filter & Pencarian</CardTitle>
            <CardDescription>Cari dan filter riwayat transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <Label htmlFor="search">Cari Transaksi</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Cari berdasarkan ID atau nama pelanggan"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <Label>Filter Status</Label>
                <Tabs
                  defaultValue="all"
                  className="mt-2"
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="completed">Selesai</TabsTrigger>
                    <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Calendar size={14} /> Pilih Tanggal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter size={14} /> Filter Lanjutan
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download size={14} /> Ekspor Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>
              Menampilkan {filteredTransactions.length} transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(transaction.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.customer?.name || transaction.customer}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {transaction.items.map((item, index) => (
                            <span key={index} className="text-sm">
                              {item.name || item}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        Rp {transaction.total.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>{transaction.staff}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "outline"
                              : "destructive"
                          }
                          className={
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {transaction.status === "completed"
                            ? "Selesai"
                            : "Dibatalkan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada transaksi yang ditemukan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiwayatTransaksi;
