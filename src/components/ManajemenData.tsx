import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Key,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { staffService } from "@/lib/dataService";

interface LayananItem {
  id: string;
  nama: string;
  harga: number;
  durasi: number;
  kategori: string;
}

interface ProdukItem {
  id: string;
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
}

interface StafItem {
  id: string;
  nama: string;
  posisi: string;
  telepon: string;
  status: string;
  komisi: number;
}

interface PelangganItem {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  kunjunganTerakhir: string;
}

interface PenggunaItem {
  id: string;
  username: string;
  namaLengkap: string;
  peran: "admin" | "staff";
  status: "Aktif" | "Nonaktif";
  password?: string;
}

const ManajemenData = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("layanan");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "add" | "edit" | "view" | "reset"
  >("add");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const layananData: LayananItem[] = [
    {
      id: "1",
      nama: "Potong Rambut",
      harga: 50000,
      durasi: 30,
      kategori: "Rambut",
    },
    {
      id: "2",
      nama: "Creambath",
      harga: 100000,
      durasi: 60,
      kategori: "Rambut",
    },
    { id: "3", nama: "Facial", harga: 150000, durasi: 60, kategori: "Wajah" },
    { id: "4", nama: "Manicure", harga: 80000, durasi: 45, kategori: "Kuku" },
  ];

  const produkData: ProdukItem[] = [
    {
      id: "1",
      nama: "Shampoo Premium",
      harga: 120000,
      stok: 15,
      kategori: "Perawatan Rambut",
    },
    {
      id: "2",
      nama: "Conditioner",
      harga: 100000,
      stok: 12,
      kategori: "Perawatan Rambut",
    },
    {
      id: "3",
      nama: "Face Mask",
      harga: 25000,
      stok: 30,
      kategori: "Perawatan Wajah",
    },
    { id: "4", nama: "Nail Polish", harga: 45000, stok: 20, kategori: "Kuku" },
  ];

  const stafData: StafItem[] = [
    {
      id: "1",
      nama: "Siti Nurhaliza",
      posisi: "Hair Stylist",
      telepon: "081234567890",
      status: "Aktif",
      komisi: 10,
    },
    {
      id: "2",
      nama: "Budi Santoso",
      posisi: "Beautician",
      telepon: "081234567891",
      status: "Aktif",
      komisi: 15,
    },
    {
      id: "3",
      nama: "Dewi Lestari",
      posisi: "Nail Artist",
      telepon: "081234567892",
      status: "Aktif",
      komisi: 12,
    },
    {
      id: "4",
      nama: "Agus Pratama",
      posisi: "Massage Therapist",
      telepon: "081234567893",
      status: "Cuti",
      komisi: 8,
    },
  ];

  const pelangganData: PelangganItem[] = [
    {
      id: "1",
      nama: "Ratna Sari",
      telepon: "081234567894",
      email: "ratna@email.com",
      kunjunganTerakhir: "2023-05-15",
    },
    {
      id: "2",
      nama: "Joko Widodo",
      telepon: "081234567895",
      email: "joko@email.com",
      kunjunganTerakhir: "2023-05-10",
    },
    {
      id: "3",
      nama: "Anisa Rahma",
      telepon: "081234567896",
      email: "anisa@email.com",
      kunjunganTerakhir: "2023-05-05",
    },
    {
      id: "4",
      nama: "Bambang Sutrisno",
      telepon: "081234567897",
      email: "bambang@email.com",
      kunjunganTerakhir: "2023-04-28",
    },
  ];

  const penggunaData: PenggunaItem[] = [
    {
      id: "1",
      username: "admin",
      namaLengkap: "Administrator",
      peran: "admin",
      status: "Aktif",
    },
    {
      id: "2",
      username: "staff1",
      namaLengkap: "Siti Nurhaliza",
      peran: "staff",
      status: "Aktif",
    },
    {
      id: "3",
      username: "staff2",
      namaLengkap: "Budi Santoso",
      peran: "staff",
      status: "Aktif",
    },
    {
      id: "4",
      username: "manager",
      namaLengkap: "Dewi Lestari",
      peran: "admin",
      status: "Nonaktif",
    },
  ];

  // Set initial data after mock data is defined
  useEffect(() => {
    // Check if there's stored data in localStorage
    const storedLayanan = localStorage.getItem("layananData");
    const storedProduk = localStorage.getItem("produkData");
    const storedPelanggan = localStorage.getItem("pelangganData");
    const storedPengguna = localStorage.getItem("penggunaData");

    // Set layanan data
    if (storedLayanan) {
      try {
        setLayananItems(JSON.parse(storedLayanan));
      } catch (error) {
        console.error("Error parsing layanan data:", error);
        setLayananItems(layananData);
      }
    } else {
      setLayananItems(layananData);
      localStorage.setItem("layananData", JSON.stringify(layananData));
    }

    // Set produk data
    if (storedProduk) {
      try {
        setProdukItems(JSON.parse(storedProduk));
      } catch (error) {
        console.error("Error parsing produk data:", error);
        setProdukItems(produkData);
      }
    } else {
      setProdukItems(produkData);
      localStorage.setItem("produkData", JSON.stringify(produkData));
    }

    // Staf data will be loaded from Supabase in a separate effect

    // Set pelanggan data
    if (storedPelanggan) {
      try {
        setPelangganItems(JSON.parse(storedPelanggan));
      } catch (error) {
        console.error("Error parsing pelanggan data:", error);
        setPelangganItems(pelangganData);
      }
    } else {
      setPelangganItems(pelangganData);
      localStorage.setItem("pelangganData", JSON.stringify(pelangganData));
    }

    // Set pengguna data
    if (storedPengguna) {
      try {
        setPenggunaItems(JSON.parse(storedPengguna));
      } catch (error) {
        console.error("Error parsing pengguna data:", error);
        setPenggunaItems(penggunaData);
      }
    } else {
      setPenggunaItems(penggunaData);
      localStorage.setItem("penggunaData", JSON.stringify(penggunaData));
    }

    // Also check for new customers from transactions
    const transactionHistory = localStorage.getItem("transactionHistory");
    if (transactionHistory) {
      try {
        const transactions = JSON.parse(transactionHistory);
        const newCustomers = [];

        transactions.forEach((transaction) => {
          if (
            transaction.customer &&
            transaction.customer.id &&
            transaction.customer.name
          ) {
            // Check if this customer is already in our list
            const existingCustomer = pelangganItems.find(
              (p) => p.id === transaction.customer.id,
            );
            if (!existingCustomer) {
              newCustomers.push({
                id: transaction.customer.id,
                nama: transaction.customer.name,
                telepon: transaction.customer.phone || "",
                email: transaction.customer.email || "",
                kunjunganTerakhir:
                  transaction.date || new Date().toISOString().split("T")[0],
              });
            }
          }
        });

        if (newCustomers.length > 0) {
          const updatedPelanggan = [...pelangganItems, ...newCustomers];
          setPelangganItems(updatedPelanggan);
          localStorage.setItem(
            "pelangganData",
            JSON.stringify(updatedPelanggan),
          );
        }
      } catch (error) {
        console.error("Error processing transaction customers:", error);
      }
    }
  }, []);

  // Load staff data from Supabase
  useEffect(() => {
    const loadStaffData = async () => {
      setIsLoading(true);
      try {
        const staffData = await staffService.getAll();

        // Map Supabase staff data to the format expected by the component
        const mappedStaffData = staffData.map((staff) => ({
          id: staff.id,
          nama: staff.name,
          posisi: staff.position,
          telepon: staff.phone,
          status: staff.status,
          komisi: staff.commission_rate,
        }));

        setStafItems(mappedStaffData);
      } catch (error) {
        console.error("Error loading staff data from Supabase:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data staf dari database.",
          variant: "destructive",
        });
        // Fallback to mock data if Supabase fails
        setStafItems(stafData);
      } finally {
        setIsLoading(false);
      }
    };

    loadStaffData();
  }, []);

  // Set active tab based on URL path
  useEffect(() => {
    if (location.pathname === "/manajemen/layanan") {
      setActiveTab("layanan");
    } else if (location.pathname === "/manajemen/produk") {
      setActiveTab("produk");
    } else if (location.pathname === "/manajemen/staf") {
      setActiveTab("staf");
    } else if (location.pathname === "/manajemen/pelanggan") {
      setActiveTab("pelanggan");
    }
  }, [location.pathname]);

  // Initialize state with mock data
  const [layananItems, setLayananItems] = useState<LayananItem[]>([]);
  const [produkItems, setProdukItems] = useState<ProdukItem[]>([]);
  const [stafItems, setStafItems] = useState<StafItem[]>([]);
  const [pelangganItems, setPelangganItems] = useState<PelangganItem[]>([]);
  const [penggunaItems, setPenggunaItems] = useState<PenggunaItem[]>([]);

  const handleAddItem = () => {
    setDialogMode("add");

    // Initialize empty item based on active tab
    if (activeTab === "layanan") {
      setCurrentItem({ nama: "", harga: 0, durasi: 30, kategori: "Rambut" });
    } else if (activeTab === "produk") {
      setCurrentItem({
        nama: "",
        harga: 0,
        stok: 0,
        kategori: "Perawatan Rambut",
      });
    } else if (activeTab === "staf") {
      setCurrentItem({
        nama: "",
        posisi: "Hair Stylist",
        telepon: "",
        status: "Aktif",
        komisi: 10,
      });
    } else if (activeTab === "pelanggan") {
      setCurrentItem({
        nama: "",
        telepon: "",
        email: "",
        kunjunganTerakhir: new Date().toISOString().split("T")[0],
      });
    } else if (activeTab === "pengguna") {
      setCurrentItem({
        username: "",
        namaLengkap: "",
        peran: "staff",
        status: "Aktif",
        password: "",
      });
    }

    setIsDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setDialogMode("edit");
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const handleViewItem = (item: any) => {
    setDialogMode("view");
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    // Delete item based on active tab
    if (activeTab === "layanan") {
      const updatedItems = layananItems.filter((item) => item.id !== id);
      setLayananItems(updatedItems);
      localStorage.setItem("layananData", JSON.stringify(updatedItems));
    } else if (activeTab === "produk") {
      const updatedItems = produkItems.filter((item) => item.id !== id);
      setProdukItems(updatedItems);
      localStorage.setItem("produkData", JSON.stringify(updatedItems));
    } else if (activeTab === "staf") {
      setIsLoading(true);
      try {
        // Delete staff from Supabase
        const success = await staffService.delete(id);
        if (success) {
          const updatedItems = stafItems.filter((item) => item.id !== id);
          setStafItems(updatedItems);
          toast({
            title: "Sukses",
            description: "Data staf berhasil dihapus.",
          });
        } else {
          throw new Error("Failed to delete staff from Supabase");
        }
      } catch (error) {
        console.error("Error deleting staff:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus data staf.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "pelanggan") {
      const updatedItems = pelangganItems.filter((item) => item.id !== id);
      setPelangganItems(updatedItems);
      localStorage.setItem("pelangganData", JSON.stringify(updatedItems));
    } else if (activeTab === "pengguna") {
      // Prevent deleting the last admin user
      const isAdmin =
        penggunaItems.find((item) => item.id === id)?.peran === "admin";
      const adminCount = penggunaItems.filter(
        (item) => item.peran === "admin",
      ).length;

      if (isAdmin && adminCount <= 1) {
        toast({
          title: "Error",
          description: "Tidak dapat menghapus admin terakhir.",
          variant: "destructive",
        });
        return;
      }

      const updatedItems = penggunaItems.filter((item) => item.id !== id);
      setPenggunaItems(updatedItems);
      localStorage.setItem("penggunaData", JSON.stringify(updatedItems));
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a new ID (in a real app, this would be done by the database)
    const newId = Date.now().toString();

    if (dialogMode === "add") {
      // Add new item based on active tab
      if (activeTab === "layanan") {
        const newItem: LayananItem = { ...currentItem, id: newId };
        const updatedItems = [...layananItems, newItem];
        setLayananItems(updatedItems);
        localStorage.setItem("layananData", JSON.stringify(updatedItems));
      } else if (activeTab === "produk") {
        const newItem: ProdukItem = { ...currentItem, id: newId };
        const updatedItems = [...produkItems, newItem];
        setProdukItems(updatedItems);
        localStorage.setItem("produkData", JSON.stringify(updatedItems));
      } else if (activeTab === "staf") {
        setIsLoading(true);
        try {
          // Map the form data to Supabase staff format
          const staffData = {
            name: currentItem.nama,
            position: currentItem.posisi,
            phone: currentItem.telepon,
            status: currentItem.status,
            commission_rate: currentItem.komisi,
          };

          // Save to Supabase
          const success = await staffService.save([
            ...stafItems.map((item) => ({
              id: item.id,
              name: item.nama,
              position: item.posisi,
              phone: item.telepon,
              status: item.status,
              commission_rate: item.komisi,
            })),
            staffData,
          ]);

          if (success) {
            // Refresh staff data from Supabase
            const staffData = await staffService.getAll();
            const mappedStaffData = staffData.map((staff) => ({
              id: staff.id,
              nama: staff.name,
              posisi: staff.position,
              telepon: staff.phone,
              status: staff.status,
              komisi: staff.commission_rate,
            }));

            setStafItems(mappedStaffData);
            toast({
              title: "Sukses",
              description: "Data staf berhasil ditambahkan.",
            });
          } else {
            throw new Error("Failed to save staff to Supabase");
          }
        } catch (error) {
          console.error("Error adding staff:", error);
          toast({
            title: "Error",
            description: "Gagal menambahkan data staf.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (activeTab === "pelanggan") {
        const newItem: PelangganItem = { ...currentItem, id: newId };
        const updatedItems = [...pelangganItems, newItem];
        setPelangganItems(updatedItems);
        localStorage.setItem("pelangganData", JSON.stringify(updatedItems));
      } else if (activeTab === "pengguna") {
        // Check if username already exists
        const usernameExists = penggunaItems.some(
          (item) => item.username === currentItem.username,
        );

        if (usernameExists) {
          toast({
            title: "Error",
            description:
              "Username sudah digunakan. Silakan pilih username lain.",
            variant: "destructive",
          });
          return;
        }

        // Create new user without the password in storage
        const { password, ...userWithoutPassword } = currentItem;
        const newItem: PenggunaItem = { ...userWithoutPassword, id: newId };
        const updatedItems = [...penggunaItems, newItem];
        setPenggunaItems(updatedItems);
        localStorage.setItem("penggunaData", JSON.stringify(updatedItems));

        // In a real app, you would hash the password and store it securely
        toast({
          title: "Sukses",
          description: "Pengguna baru berhasil ditambahkan.",
        });
      }
    } else if (dialogMode === "edit") {
      // Edit existing item based on active tab
      if (activeTab === "layanan") {
        const updatedItems = layananItems.map((item) =>
          item.id === currentItem.id ? currentItem : item,
        );
        setLayananItems(updatedItems);
        localStorage.setItem("layananData", JSON.stringify(updatedItems));
      } else if (activeTab === "produk") {
        const updatedItems = produkItems.map((item) =>
          item.id === currentItem.id ? currentItem : item,
        );
        setProdukItems(updatedItems);
        localStorage.setItem("produkData", JSON.stringify(updatedItems));
      } else if (activeTab === "staf") {
        setIsLoading(true);
        try {
          // Map all staff items to Supabase format
          const updatedItems = stafItems.map((item) =>
            item.id === currentItem.id ? currentItem : item,
          );

          // Convert to Supabase format
          const supabaseStaffData = updatedItems.map((item) => ({
            id: item.id,
            name: item.nama,
            position: item.posisi,
            phone: item.telepon,
            status: item.status,
            commission_rate: item.komisi,
          }));

          // Save to Supabase
          const success = await staffService.save(supabaseStaffData);

          if (success) {
            setStafItems(updatedItems);
            toast({
              title: "Sukses",
              description: "Data staf berhasil diperbarui.",
            });
          } else {
            throw new Error("Failed to update staff in Supabase");
          }
        } catch (error) {
          console.error("Error updating staff:", error);
          toast({
            title: "Error",
            description: "Gagal memperbarui data staf.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (activeTab === "pelanggan") {
        const updatedItems = pelangganItems.map((item) =>
          item.id === currentItem.id ? currentItem : item,
        );
        setPelangganItems(updatedItems);
        localStorage.setItem("pelangganData", JSON.stringify(updatedItems));
      } else if (activeTab === "pengguna") {
        // Check if username already exists (except for the current user)
        const usernameExists = penggunaItems.some(
          (item) =>
            item.username === currentItem.username &&
            item.id !== currentItem.id,
        );

        if (usernameExists) {
          toast({
            title: "Error",
            description:
              "Username sudah digunakan. Silakan pilih username lain.",
            variant: "destructive",
          });
          return;
        }

        // Check if this would remove the last admin
        const isChangingFromAdmin =
          penggunaItems.find((item) => item.id === currentItem.id)?.peran ===
            "admin" && currentItem.peran !== "admin";

        const adminCount = penggunaItems.filter(
          (item) => item.peran === "admin",
        ).length;

        if (isChangingFromAdmin && adminCount <= 1) {
          toast({
            title: "Error",
            description: "Tidak dapat mengubah peran admin terakhir.",
            variant: "destructive",
          });
          return;
        }

        // Remove password field if it's empty (no password change)
        const itemToSave = { ...currentItem };
        if (!itemToSave.password) {
          delete itemToSave.password;
        }

        const updatedItems = penggunaItems.map((item) =>
          item.id === currentItem.id ? itemToSave : item,
        );

        setPenggunaItems(updatedItems);
        localStorage.setItem("penggunaData", JSON.stringify(updatedItems));

        toast({
          title: "Sukses",
          description: "Data pengguna berhasil diperbarui.",
        });
      }
    } else if (dialogMode === "reset") {
      // Reset password for user
      if (activeTab === "pengguna" && currentItem.password) {
        // In a real app, you would hash the password and store it securely
        toast({
          title: "Sukses",
          description: "Password pengguna berhasil direset.",
        });
      }
    }

    // Close the dialog
    setIsDialogOpen(false);
  };

  const renderLayananForm = () => (
    <form onSubmit={handleSaveItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nama" className="text-right">
            Nama Layanan
          </Label>
          <Input
            id="nama"
            className="col-span-3"
            value={currentItem?.nama || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, nama: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="harga" className="text-right">
            Harga (Rp)
          </Label>
          <Input
            id="harga"
            type="number"
            className="col-span-3"
            value={currentItem?.harga || ""}
            onChange={(e) =>
              setCurrentItem({
                ...currentItem,
                harga: parseInt(e.target.value),
              })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="durasi" className="text-right">
            Durasi (menit)
          </Label>
          <Input
            id="durasi"
            type="number"
            className="col-span-3"
            value={currentItem?.durasi || ""}
            onChange={(e) =>
              setCurrentItem({
                ...currentItem,
                durasi: parseInt(e.target.value),
              })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="kategori" className="text-right">
            Kategori
          </Label>
          <Select
            disabled={dialogMode === "view"}
            value={currentItem?.kategori || ""}
            onValueChange={(value) =>
              setCurrentItem({ ...currentItem, kategori: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rambut">Rambut</SelectItem>
              <SelectItem value="Wajah">Wajah</SelectItem>
              <SelectItem value="Kuku">Kuku</SelectItem>
              <SelectItem value="Tubuh">Tubuh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {dialogMode !== "view" && (
        <DialogFooter>
          <Button type="submit">
            {dialogMode === "add" ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  const renderProdukForm = () => (
    <form onSubmit={handleSaveItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nama" className="text-right">
            Nama Produk
          </Label>
          <Input
            id="nama"
            className="col-span-3"
            value={currentItem?.nama || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, nama: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="harga" className="text-right">
            Harga (Rp)
          </Label>
          <Input
            id="harga"
            type="number"
            className="col-span-3"
            value={currentItem?.harga || ""}
            onChange={(e) =>
              setCurrentItem({
                ...currentItem,
                harga: parseInt(e.target.value),
              })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stok" className="text-right">
            Stok
          </Label>
          <Input
            id="stok"
            type="number"
            className="col-span-3"
            value={currentItem?.stok || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, stok: parseInt(e.target.value) })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="kategori" className="text-right">
            Kategori
          </Label>
          <Select
            disabled={dialogMode === "view"}
            value={currentItem?.kategori || ""}
            onValueChange={(value) =>
              setCurrentItem({ ...currentItem, kategori: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Perawatan Rambut">Perawatan Rambut</SelectItem>
              <SelectItem value="Perawatan Wajah">Perawatan Wajah</SelectItem>
              <SelectItem value="Kuku">Kuku</SelectItem>
              <SelectItem value="Perawatan Tubuh">Perawatan Tubuh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {dialogMode !== "view" && (
        <DialogFooter>
          <Button type="submit">
            {dialogMode === "add" ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  const renderStafForm = () => (
    <form onSubmit={handleSaveItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nama" className="text-right">
            Nama Staf
          </Label>
          <Input
            id="nama"
            className="col-span-3"
            value={currentItem?.nama || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, nama: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="posisi" className="text-right">
            Posisi
          </Label>
          <Select
            disabled={dialogMode === "view"}
            value={currentItem?.posisi || ""}
            onValueChange={(value) =>
              setCurrentItem({ ...currentItem, posisi: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih posisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hair Stylist">Hair Stylist</SelectItem>
              <SelectItem value="Beautician">Beautician</SelectItem>
              <SelectItem value="Nail Artist">Nail Artist</SelectItem>
              <SelectItem value="Massage Therapist">
                Massage Therapist
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="telepon" className="text-right">
            Telepon
          </Label>
          <Input
            id="telepon"
            className="col-span-3"
            value={currentItem?.telepon || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, telepon: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="komisi" className="text-right">
            Komisi (%)
          </Label>
          <Input
            id="komisi"
            type="number"
            min="0"
            max="100"
            className="col-span-3"
            value={currentItem?.komisi || ""}
            onChange={(e) =>
              setCurrentItem({
                ...currentItem,
                komisi: parseInt(e.target.value),
              })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <Select
            disabled={dialogMode === "view"}
            value={currentItem?.status || ""}
            onValueChange={(value) =>
              setCurrentItem({ ...currentItem, status: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Cuti">Cuti</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {dialogMode !== "view" && (
        <DialogFooter>
          <Button type="submit">
            {dialogMode === "add" ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  const renderPelangganForm = () => (
    <form onSubmit={handleSaveItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nama" className="text-right">
            Nama Pelanggan
          </Label>
          <Input
            id="nama"
            className="col-span-3"
            value={currentItem?.nama || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, nama: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="telepon" className="text-right">
            Telepon
          </Label>
          <Input
            id="telepon"
            className="col-span-3"
            value={currentItem?.telepon || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, telepon: e.target.value })
            }
            readOnly={dialogMode === "view"}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="col-span-3"
            value={currentItem?.email || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, email: e.target.value })
            }
            readOnly={dialogMode === "view"}
          />
        </div>
        {dialogMode === "view" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kunjunganTerakhir" className="text-right">
              Kunjungan Terakhir
            </Label>
            <Input
              id="kunjunganTerakhir"
              className="col-span-3"
              value={currentItem?.kunjunganTerakhir || ""}
              readOnly
            />
          </div>
        )}
      </div>
      {dialogMode !== "view" && (
        <DialogFooter>
          <Button type="submit">
            {dialogMode === "add" ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  const getDialogTitle = () => {
    const action =
      dialogMode === "add"
        ? "Tambah"
        : dialogMode === "edit"
          ? "Edit"
          : "Detail";
    const type =
      activeTab === "layanan"
        ? "Layanan"
        : activeTab === "produk"
          ? "Produk"
          : activeTab === "staf"
            ? "Staf"
            : "Pelanggan";
    return `${action} ${type}`;
  };

  const handleResetPassword = (item: PenggunaItem) => {
    setDialogMode("reset");
    setCurrentItem({ ...item, password: "" });
    setIsDialogOpen(true);
  };

  const renderPenggunaForm = () => (
    <form onSubmit={handleSaveItem}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <Input
            id="username"
            className="col-span-3"
            value={currentItem?.username || ""}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, username: e.target.value })
            }
            readOnly={dialogMode === "view" || dialogMode === "reset"}
            required={dialogMode !== "reset"}
          />
        </div>

        {dialogMode !== "view" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              {dialogMode === "reset" ? "Password Baru" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              className="col-span-3"
              value={currentItem?.password || ""}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, password: e.target.value })
              }
              required={dialogMode === "add" || dialogMode === "reset"}
              placeholder={
                dialogMode === "edit" ? "Biarkan kosong jika tidak diubah" : ""
              }
            />
          </div>
        )}

        {dialogMode !== "reset" && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="namaLengkap" className="text-right">
                Nama Lengkap
              </Label>
              <Input
                id="namaLengkap"
                className="col-span-3"
                value={currentItem?.namaLengkap || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    namaLengkap: e.target.value,
                  })
                }
                readOnly={dialogMode === "view"}
                required={dialogMode !== "view"}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="peran" className="text-right">
                Peran
              </Label>
              <Select
                disabled={dialogMode === "view"}
                value={currentItem?.peran || "staff"}
                onValueChange={(value) =>
                  setCurrentItem({
                    ...currentItem,
                    peran: value as "admin" | "staff",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                disabled={dialogMode === "view"}
                value={currentItem?.status || "Aktif"}
                onValueChange={(value) =>
                  setCurrentItem({
                    ...currentItem,
                    status: value as "Aktif" | "Nonaktif",
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      {dialogMode !== "view" && (
        <DialogFooter>
          <Button type="submit">
            {dialogMode === "add"
              ? "Tambah"
              : dialogMode === "reset"
                ? "Reset Password"
                : "Simpan"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  const renderForm = () => {
    switch (activeTab) {
      case "layanan":
        return renderLayananForm();
      case "produk":
        return renderProdukForm();
      case "staf":
        return renderStafForm();
      case "pelanggan":
        return renderPelangganForm();
      case "pengguna":
        return renderPenggunaForm();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Data</CardTitle>
          <CardDescription>
            Kelola data layanan, produk, staf, dan pelanggan salon Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="layanan">Layanan</TabsTrigger>
                <TabsTrigger value="produk">Produk</TabsTrigger>
                <TabsTrigger value="staf">Staf</TabsTrigger>
                <TabsTrigger value="pelanggan">Pelanggan</TabsTrigger>
                <TabsTrigger value="pengguna">Pengguna</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari..."
                    className="pl-8 w-[200px] md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddItem}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah
                </Button>
              </div>
            </div>

            <TabsContent value="layanan" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Layanan</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layananItems.map((layanan) => (
                      <TableRow key={layanan.id}>
                        <TableCell className="font-medium">
                          {layanan.nama}
                        </TableCell>
                        <TableCell>
                          Rp {layanan.harga.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{layanan.durasi} menit</TableCell>
                        <TableCell>{layanan.kategori}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(layanan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(layanan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(layanan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="produk" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produkItems.map((produk) => (
                      <TableRow key={produk.id}>
                        <TableCell className="font-medium">
                          {produk.nama}
                        </TableCell>
                        <TableCell>
                          Rp {produk.harga.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{produk.stok}</TableCell>
                        <TableCell>{produk.kategori}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(produk)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(produk)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(produk.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="staf" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Posisi</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Komisi (%)</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Memuat data staf...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : stafItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Tidak ada data staf. Silakan tambahkan staf baru.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stafItems.map((staf) => (
                        <TableRow key={staf.id}>
                          <TableCell className="font-medium">
                            {staf.nama}
                          </TableCell>
                          <TableCell>{staf.posisi}</TableCell>
                          <TableCell>{staf.telepon}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${staf.status === "Aktif" ? "bg-green-100 text-green-800" : staf.status === "Cuti" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {staf.status}
                            </span>
                          </TableCell>
                          <TableCell>{staf.komisi}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewItem(staf)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditItem(staf)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(staf.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pelanggan" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Kunjungan Terakhir</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pelangganItems.map((pelanggan) => (
                      <TableRow key={pelanggan.id}>
                        <TableCell className="font-medium">
                          {pelanggan.nama}
                        </TableCell>
                        <TableCell>{pelanggan.telepon}</TableCell>
                        <TableCell>{pelanggan.email}</TableCell>
                        <TableCell>
                          {new Date(
                            pelanggan.kunjunganTerakhir,
                          ).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(pelanggan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(pelanggan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(pelanggan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pengguna" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Peran</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {penggunaItems.map((pengguna) => (
                      <TableRow key={pengguna.id}>
                        <TableCell className="font-medium">
                          {pengguna.username}
                        </TableCell>
                        <TableCell>{pengguna.namaLengkap}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pengguna.peran === "admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {pengguna.peran === "admin" ? "Admin" : "Staff"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${pengguna.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {pengguna.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewItem(pengguna)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(pengguna)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetPassword(pengguna)}
                              title="Reset Password"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M2 12c0-3.5 2.5-6 6.5-6 4 0 6 2.5 6 6 0 3.5-2 6-6 6s-6.5-2.5-6.5-6z"></path>
                                <path d="M13 12h9"></path>
                                <path d="M18 7v10"></path>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(pengguna.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Tambahkan data baru ke sistem."
                : dialogMode === "edit"
                  ? "Edit data yang sudah ada."
                  : "Lihat detail data."}
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenData;
