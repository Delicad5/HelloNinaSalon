import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PlusCircle,
  Trash2,
  UserPlus,
  Calculator,
  Percent,
  ArrowLeft,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface TransactionItem {
  id: string;
  type: "service" | "product";
  name: string;
  price: number;
  quantity: number;
  staffId?: string;
}

interface TransaksiFormProps {
  onComplete?: (transactionData: any) => void;
  onCancel?: () => void;
}

const TransaksiForm = ({
  onComplete = () => {},
  onCancel = () => {},
}: TransaksiFormProps) => {
  // State for services, products, staff, and customers
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Potong Rambut", price: 50000 },
    { id: "2", name: "Creambath", price: 100000 },
    { id: "3", name: "Hair Coloring", price: 350000 },
    { id: "4", name: "Facial", price: 150000 },
    { id: "5", name: "Manicure", price: 80000 },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Shampoo Premium", price: 120000, stock: 15 },
    { id: "2", name: "Hair Mask", price: 85000, stock: 8 },
    { id: "3", name: "Hair Vitamin", price: 75000, stock: 12 },
    { id: "4", name: "Face Serum", price: 190000, stock: 5 },
  ]);

  const [staffList, setStaffList] = useState<Staff[]>([
    { id: "1", name: "Siti", role: "Senior Stylist" },
    { id: "2", name: "Budi", role: "Hair Specialist" },
    { id: "3", name: "Dewi", role: "Beautician" },
    { id: "4", name: "Andi", role: "Nail Artist" },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Ratna",
      phone: "081234567890",
      email: "ratna@example.com",
    },
    { id: "2", name: "Joko", phone: "082345678901" },
    { id: "3", name: "Maya", phone: "083456789012", email: "maya@example.com" },
  ]);

  // Load data from localStorage
  useEffect(() => {
    // Load services
    const storedLayanan = localStorage.getItem("layananData");
    if (storedLayanan) {
      try {
        const layananItems = JSON.parse(storedLayanan);
        const mappedServices = layananItems.map((item) => ({
          id: item.id,
          name: item.nama,
          price: item.harga,
        }));
        setServices(mappedServices);
      } catch (error) {
        console.error("Error loading services:", error);
      }
    }

    // Load products
    const storedProduk = localStorage.getItem("produkData");
    if (storedProduk) {
      try {
        const produkItems = JSON.parse(storedProduk);
        const mappedProducts = produkItems.map((item) => ({
          id: item.id,
          name: item.nama,
          price: item.harga,
          stock: item.stok,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }

    // Load staff
    const storedStaf = localStorage.getItem("stafData");
    if (storedStaf) {
      try {
        const stafItems = JSON.parse(storedStaf);
        const mappedStaff = stafItems.map((item) => ({
          id: item.id,
          name: item.nama,
          role: item.posisi,
        }));
        setStaffList(mappedStaff);
      } catch (error) {
        console.error("Error loading staff:", error);
      }
    }

    // Load customers
    const storedPelanggan = localStorage.getItem("pelangganData");
    if (storedPelanggan) {
      try {
        const pelangganItems = JSON.parse(storedPelanggan);
        const mappedCustomers = pelangganItems.map((item) => ({
          id: item.id,
          name: item.nama,
          phone: item.telepon,
          email: item.email,
        }));
        setCustomers(mappedCustomers);
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    }
  }, []);

  // State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>(
    [],
  );
  const [discountType, setDiscountType] = useState<"percentage" | "nominal">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: "",
    phone: "",
    email: "",
  });
  const [activeTab, setActiveTab] = useState("services");

  // Calculate totals
  const subtotal = transactionItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * discountValue) / 100
      : discountValue;
  const total = subtotal - discountAmount;

  // Add service to transaction
  const addService = (service: Service) => {
    const existingItemIndex = transactionItems.findIndex(
      (item) => item.id === service.id && item.type === "service",
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...transactionItems];
      updatedItems[existingItemIndex].quantity += 1;
      setTransactionItems(updatedItems);
    } else {
      setTransactionItems([
        ...transactionItems,
        {
          id: service.id,
          type: "service",
          name: service.name,
          price: service.price,
          quantity: 1,
        },
      ]);
    }
  };

  // Add product to transaction
  const addProduct = (product: Product) => {
    const existingItemIndex = transactionItems.findIndex(
      (item) => item.id === product.id && item.type === "product",
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...transactionItems];
      updatedItems[existingItemIndex].quantity += 1;
      setTransactionItems(updatedItems);
    } else {
      setTransactionItems([
        ...transactionItems,
        {
          id: product.id,
          type: "product",
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  // Remove item from transaction
  const removeItem = (index: number) => {
    const updatedItems = [...transactionItems];
    updatedItems.splice(index, 1);
    setTransactionItems(updatedItems);
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = [...transactionItems];
    updatedItems[index].quantity = quantity;
    setTransactionItems(updatedItems);
  };

  // Assign staff to service
  const assignStaff = (itemIndex: number, staffId: string) => {
    const updatedItems = [...transactionItems];
    updatedItems[itemIndex].staffId = staffId;
    setTransactionItems(updatedItems);
  };

  // Handle new customer submission
  const handleAddNewCustomer = () => {
    const newCustomerId = `new-${Date.now()}`;
    const customerData = {
      id: newCustomerId,
      name: newCustomer.name || "",
      phone: newCustomer.phone || "",
      email: newCustomer.email,
    };

    // Update local state
    setSelectedCustomer(customerData);
    setCustomers([...customers, customerData]);

    // Also update the pelanggan data in localStorage for ManajemenData component
    const pelangganData = {
      id: newCustomerId,
      nama: newCustomer.name || "",
      telepon: newCustomer.phone || "",
      email: newCustomer.email || "",
      kunjunganTerakhir: new Date().toISOString().split("T")[0],
    };

    const storedPelanggan = localStorage.getItem("pelangganData");
    if (storedPelanggan) {
      try {
        const pelangganItems = JSON.parse(storedPelanggan);
        pelangganItems.push(pelangganData);
        localStorage.setItem("pelangganData", JSON.stringify(pelangganItems));
      } catch (error) {
        console.error("Error updating pelanggan data:", error);
      }
    } else {
      localStorage.setItem("pelangganData", JSON.stringify([pelangganData]));
    }

    setNewCustomerDialogOpen(false);
    setNewCustomer({ name: "", phone: "", email: "" });
  };

  // Handle form submission
  const handleSubmit = () => {
    const transactionData = {
      customer: selectedCustomer,
      items: transactionItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      total,
      date: new Date(),
    };

    // Store transaction data in localStorage
    localStorage.setItem("currentTransaction", JSON.stringify(transactionData));

    // Navigate to payment page
    window.location.href = "/pembayaran";

    onComplete(transactionData);
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
          <h2 className="text-2xl font-bold">Transaksi Baru</h2>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Customer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Informasi Pelanggan</CardTitle>
            <CardDescription>
              Pilih pelanggan atau tambahkan pelanggan baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="w-full md:w-2/3">
                <Label htmlFor="customer">Pelanggan</Label>
                <Select
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}
                  value={selectedCustomer?.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog
                open={newCustomerDialogOpen}
                onOpenChange={setNewCustomerDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserPlus size={16} />
                    <span>Pelanggan Baru</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi pelanggan baru di bawah ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={newCustomer.name}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email (Opsional)</Label>
                      <Input
                        id="email"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setNewCustomerDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleAddNewCustomer}>Simpan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {selectedCustomer && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedCustomer.phone}
                  {selectedCustomer.email && ` • ${selectedCustomer.email}`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services and Products Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pilih Layanan & Produk</CardTitle>
            <CardDescription>
              Tambahkan layanan dan produk ke transaksi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">Layanan</TabsTrigger>
                <TabsTrigger value="products">Produk</TabsTrigger>
                <TabsTrigger value="commission">Komisi Staff</TabsTrigger>
              </TabsList>
              <TabsContent value="services" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => addService(service)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Rp {service.price.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <PlusCircle size={18} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="products" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => addProduct(product)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Rp {product.price.toLocaleString("id-ID")} • Stok:{" "}
                            {product.stock}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <PlusCircle size={18} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="commission" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Informasi Komisi Staff</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Berikut adalah perkiraan komisi yang akan diterima oleh
                      setiap staff berdasarkan layanan yang dipilih.
                    </p>
                  </div>

                  {transactionItems.filter(
                    (item) => item.type === "service" && item.staffId,
                  ).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff</TableHead>
                          <TableHead>Layanan</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Komisi (10%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionItems
                          .filter(
                            (item) => item.type === "service" && item.staffId,
                          )
                          .map((item, index) => {
                            const staff = staffList.find(
                              (s) => s.id === item.staffId,
                            );
                            const commission = item.price * 0.1 * item.quantity;

                            return (
                              <TableRow key={`commission-${index}`}>
                                <TableCell>
                                  {staff ? staff.name : "Staff tidak dipilih"}
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                  Rp{" "}
                                  {(item.price * item.quantity).toLocaleString(
                                    "id-ID",
                                  )}
                                </TableCell>
                                <TableCell>
                                  Rp {commission.toLocaleString("id-ID")}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={3}>Total Komisi</TableCell>
                          <TableCell>
                            Rp{" "}
                            {transactionItems
                              .filter(
                                (item) =>
                                  item.type === "service" && item.staffId,
                              )
                              .reduce(
                                (sum, item) =>
                                  sum + item.price * 0.1 * item.quantity,
                                0,
                              )
                              .toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada layanan dengan staff yang dipilih. Silakan pilih
                      layanan dan staff untuk melihat informasi komisi.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Detail Transaksi</CardTitle>
            <CardDescription>
              Daftar layanan dan produk yang dipilih
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Subtotal</TableHead>
                    {transactionItems.some(
                      (item) => item.type === "service",
                    ) && <TableHead>Staf</TableHead>}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionItems.map((item, index) => (
                    <TableRow key={`${item.id}-${index}`}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.type === "service" ? "Layanan" : "Produk"}
                        </div>
                      </TableCell>
                      <TableCell>
                        Rp {item.price.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(index, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(index, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </TableCell>
                      {transactionItems.some(
                        (item) => item.type === "service",
                      ) && (
                        <TableCell>
                          {item.type === "service" ? (
                            <Select
                              value={item.staffId}
                              onValueChange={(value) =>
                                assignStaff(index, value)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Pilih staf" />
                              </SelectTrigger>
                              <SelectContent>
                                {staffList.map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada item yang dipilih. Silakan pilih layanan atau produk.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount and Total */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pembayaran</CardTitle>
            <CardDescription>
              Terapkan diskon dan lihat total pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <Label>Jenis Diskon</Label>
                  <RadioGroup
                    className="flex gap-4 mt-2"
                    defaultValue="percentage"
                    value={discountType}
                    onValueChange={(value) =>
                      setDiscountType(value as "percentage" | "nominal")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label
                        htmlFor="percentage"
                        className="flex items-center gap-1"
                      >
                        <Percent size={14} /> Persentase
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nominal" id="nominal" />
                      <Label
                        htmlFor="nominal"
                        className="flex items-center gap-1"
                      >
                        <Calculator size={14} /> Nominal
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="w-full md:w-1/2">
                  <Label htmlFor="discount-value">
                    {discountType === "percentage"
                      ? "Persentase Diskon (%)"
                      : "Nominal Diskon (Rp)"}
                  </Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min="0"
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diskon</span>
                  <span>Rp {discountAmount.toLocaleString("id-ID")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCustomer || transactionItems.length === 0}
            >
              Lanjut ke Pembayaran
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TransaksiForm;
