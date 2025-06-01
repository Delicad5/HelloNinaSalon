import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  appointmentsService,
  customersService,
  staffService,
  servicesService,
} from "@/lib/dataService";
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
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Bell,
} from "lucide-react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO string
  time: string; // HH:MM format
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const STORAGE_KEY = "salon_appointments";

const AppointmentScheduling = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    customerId: "",
    staffId: "",
    serviceId: "",
    date: new Date(),
    time: "09:00",
    notes: "",
  });

  // Load data using dataService
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load appointments
        const appointmentsData = await appointmentsService.getAll();

        // Load customers
        const customersData = await customersService.getAll();
        console.log("Customers data from Supabase:", customersData);
        const mappedCustomers = customersData.map((customer) => ({
          id: customer.id,
          name: customer.name || customer.nama,
          phone: customer.phone || customer.telepon,
          email: customer.email,
        }));
        setCustomers(mappedCustomers);

        // Load staff
        const staffData = await staffService.getAll();
        console.log("Staff data from Supabase:", staffData);
        const mappedStaff = staffData.map((staff) => ({
          id: staff.id,
          name: staff.name || staff.nama,
          role: staff.position || staff.role || staff.posisi,
        }));
        setStaffList(mappedStaff);

        // Load services
        const servicesData = await servicesService.getAll();
        console.log("Services data from Supabase:", servicesData);
        const mappedServices = servicesData.map((service) => ({
          id: service.id,
          name: service.name || service.nama,
          price: service.price || service.harga,
          duration: service.duration || service.durasi || 30,
        }));
        setServices(mappedServices);

        // If no services, create default ones
        if (mappedServices.length === 0) {
          const defaultServices = [
            {
              id: uuidv4(),
              name: "Potong Rambut",
              price: 50000,
              duration: 30,
              category: "Hair",
            },
            {
              id: uuidv4(),
              name: "Creambath",
              price: 100000,
              duration: 60,
              category: "Hair",
            },
            {
              id: uuidv4(),
              name: "Hair Coloring",
              price: 350000,
              duration: 120,
              category: "Hair",
            },
            {
              id: uuidv4(),
              name: "Facial",
              price: 150000,
              duration: 60,
              category: "Face",
            },
            {
              id: uuidv4(),
              name: "Manicure",
              price: 80000,
              duration: 45,
              category: "Nails",
            },
          ];
          setServices(defaultServices);
          await servicesService.save(defaultServices);
        }

        // Process appointments with related data
        if (appointmentsData && appointmentsData.length > 0) {
          const processedAppointments = appointmentsData.map((appointment) => {
            // Convert from Supabase format if needed
            const appointmentId = appointment.id;
            const customerId =
              appointment.customer_id || appointment.customerId;
            const staffId = appointment.staff_id || appointment.staffId;
            const serviceId = appointment.service_id || appointment.serviceId;

            // Find related entities
            const customer = mappedCustomers.find((c) => c.id === customerId);
            const staff = mappedStaff.find((s) => s.id === staffId);
            const service = mappedServices.find((s) => s.id === serviceId);

            return {
              id: appointmentId,
              customerId: customerId,
              customerName: customer?.name || "Unknown Customer",
              staffId: staffId,
              staffName: staff?.name || "Unknown Staff",
              serviceId: serviceId,
              serviceName: service?.name || "Unknown Service",
              date: appointment.date,
              time: appointment.time,
              duration: appointment.duration || service?.duration || 30,
              status: appointment.status || "scheduled",
              notes: appointment.notes,
            };
          });

          setAppointments(processedAppointments);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description:
            "Gagal memuat data. Menggunakan data lokal jika tersedia.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  // Save appointments using dataService whenever they change
  useEffect(() => {
    const saveAppointments = async () => {
      try {
        // Convert appointments to the format expected by Supabase
        const supabaseAppointments = appointments.map((appointment) => ({
          id: appointment.id,
          customer_id: appointment.customerId,
          staff_id: appointment.staffId,
          service_id: appointment.serviceId,
          date: new Date(appointment.date).toISOString().split("T")[0],
          time: appointment.time,
          duration: appointment.duration,
          status: appointment.status,
          notes: appointment.notes || null,
        }));

        await appointmentsService.save(supabaseAppointments);
      } catch (error) {
        console.error("Error saving appointments:", error);
        toast({
          title: "Error",
          description: "Gagal menyimpan data appointment ke database.",
          variant: "destructive",
        });
      }
    };

    if (appointments.length > 0) {
      saveAppointments();
    }
  }, [appointments]);

  // Filter appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter((appointment) => {
    return isSameDay(parseISO(appointment.date), date);
  });

  // Check if a time slot is available for a staff member
  const isTimeSlotAvailable = (staffId: string, time: string) => {
    const conflictingAppointment = appointmentsForSelectedDate.find(
      (appointment) => {
        if (appointment.staffId !== staffId) return false;
        if (appointment.status === "cancelled") return false;

        // Convert appointment time to minutes since start of day
        const [appointmentHour, appointmentMinute] = appointment.time
          .split(":")
          .map(Number);
        const appointmentStartMinutes =
          appointmentHour * 60 + appointmentMinute;
        const appointmentEndMinutes =
          appointmentStartMinutes + appointment.duration;

        // Convert time slot to minutes since start of day
        const [slotHour, slotMinute] = time.split(":").map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;

        // Get duration for the new appointment
        const selectedService = services.find(
          (s) => s.id === newAppointment.serviceId,
        );
        const slotDuration = selectedService ? selectedService.duration : 30;
        const slotEndMinutes = slotStartMinutes + slotDuration;

        // Check for overlap
        return (
          (slotStartMinutes >= appointmentStartMinutes &&
            slotStartMinutes < appointmentEndMinutes) ||
          (slotEndMinutes > appointmentStartMinutes &&
            slotEndMinutes <= appointmentEndMinutes) ||
          (slotStartMinutes <= appointmentStartMinutes &&
            slotEndMinutes >= appointmentEndMinutes)
        );
      },
    );

    return !conflictingAppointment;
  };

  // Handle adding a new appointment
  const handleAddAppointment = async () => {
    try {
      const selectedCustomer = customers.find(
        (c) => c.id === newAppointment.customerId,
      );
      const selectedStaff = staffList.find(
        (s) => s.id === newAppointment.staffId,
      );
      const selectedService = services.find(
        (s) => s.id === newAppointment.serviceId,
      );

      if (!selectedCustomer || !selectedStaff || !selectedService) {
        toast({
          title: "Error",
          description: "Mohon lengkapi semua data appointment",
          variant: "destructive",
        });
        return;
      }

      const appointmentId = `app-${uuidv4()}`;

      // Create appointment in the format expected by the component
      const newAppointmentData: Appointment = {
        id: appointmentId,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: newAppointment.date.toISOString(),
        time: newAppointment.time,
        duration: selectedService.duration,
        status: "scheduled",
        notes: newAppointment.notes,
      };

      // Create appointment in the format expected by Supabase
      const supabaseAppointment = {
        id: appointmentId,
        customer_id: selectedCustomer.id,
        staff_id: selectedStaff.id,
        service_id: selectedService.id,
        date: newAppointment.date.toISOString().split("T")[0],
        time: newAppointment.time,
        duration: selectedService.duration,
        status: "scheduled",
        notes: newAppointment.notes || null,
      };

      // Save to Supabase first
      await appointmentsService.save([supabaseAppointment]);

      // Then update local state
      setAppointments([...appointments, newAppointmentData]);
      setIsAddDialogOpen(false);

      // Reset form
      setNewAppointment({
        customerId: "",
        staffId: "",
        serviceId: "",
        date: new Date(),
        time: "09:00",
        notes: "",
      });

      toast({
        title: "Berhasil",
        description: "Appointment berhasil ditambahkan",
      });
    } catch (error) {
      console.error("Error adding appointment:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan appointment",
        variant: "destructive",
      });
    }
  };

  // Handle updating an appointment
  const handleUpdateAppointment = async () => {
    try {
      if (!selectedAppointment) return;

      // Create appointment in the format expected by Supabase
      const supabaseAppointment = {
        id: selectedAppointment.id,
        customer_id: selectedAppointment.customerId,
        staff_id: selectedAppointment.staffId,
        service_id: selectedAppointment.serviceId,
        date: new Date(selectedAppointment.date).toISOString().split("T")[0],
        time: selectedAppointment.time,
        duration: selectedAppointment.duration,
        status: selectedAppointment.status,
        notes: selectedAppointment.notes || null,
      };

      // Save to Supabase first
      await appointmentsService.save([supabaseAppointment]);

      // Then update local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? selectedAppointment
          : appointment,
      );

      setAppointments(updatedAppointments);
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);

      toast({
        title: "Berhasil",
        description: "Appointment berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui appointment",
        variant: "destructive",
      });
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (id: string) => {
    try {
      await appointmentsService.delete(id);

      const updatedAppointments = appointments.filter(
        (appointment) => appointment.id !== id,
      );
      setAppointments(updatedAppointments);

      toast({
        title: "Berhasil",
        description: "Appointment berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus appointment",
        variant: "destructive",
      });
    }
  };

  // Handle changing appointment status
  const handleChangeStatus = async (
    id: string,
    status: "scheduled" | "completed" | "cancelled",
  ) => {
    try {
      // Find the appointment to update
      const appointmentToUpdate = appointments.find((app) => app.id === id);
      if (!appointmentToUpdate) return;

      // Create appointment in the format expected by Supabase
      const supabaseAppointment = {
        id: appointmentToUpdate.id,
        customer_id: appointmentToUpdate.customerId,
        staff_id: appointmentToUpdate.staffId,
        service_id: appointmentToUpdate.serviceId,
        date: new Date(appointmentToUpdate.date).toISOString().split("T")[0],
        time: appointmentToUpdate.time,
        duration: appointmentToUpdate.duration,
        status: status,
        notes: appointmentToUpdate.notes || null,
      };

      // Save to Supabase first
      await appointmentsService.save([supabaseAppointment]);

      // Then update local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      );

      setAppointments(updatedAppointments);

      toast({
        title: "Berhasil",
        description: `Status appointment berhasil diubah menjadi ${status === "scheduled" ? "Terjadwal" : status === "completed" ? "Selesai" : "Dibatalkan"}`,
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status appointment",
        variant: "destructive",
      });
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Terjadwal</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Selesai
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get upcoming appointments (for notifications)
  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = parseISO(appointment.date);
      const today = new Date();
      return (
        appointment.status === "scheduled" &&
        isSameDay(appointmentDate, today) &&
        appointmentDate > today
      );
    })
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Jadwal Appointment</h1>
          </div>

          {upcomingAppointments.length > 0 && (
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium">
                {upcomingAppointments.length} appointment hari ini
              </span>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "calendar" | "list")}
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="calendar">Kalender</TabsTrigger>
              <TabsTrigger value="list">Daftar Appointment</TabsTrigger>
            </TabsList>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Tambah Appointment Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail appointment di bawah ini
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Pelanggan</Label>
                    <Select
                      value={newAppointment.customerId}
                      onValueChange={(value) =>
                        setNewAppointment({
                          ...newAppointment,
                          customerId: value,
                        })
                      }
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Pilih pelanggan" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length > 0 ? (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-customers" disabled>
                            Tidak ada data pelanggan
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="service">Layanan</Label>
                    <Select
                      value={newAppointment.serviceId}
                      onValueChange={(value) =>
                        setNewAppointment({
                          ...newAppointment,
                          serviceId: value,
                        })
                      }
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {service.duration} menit - Rp{" "}
                              {service.price.toLocaleString("id-ID")}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-services" disabled>
                            Tidak ada data layanan
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="staff">Staff</Label>
                    <Select
                      value={newAppointment.staffId}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, staffId: value })
                      }
                    >
                      <SelectTrigger id="staff">
                        <SelectValue placeholder="Pilih staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.length > 0 ? (
                          staffList.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name} - {staff.role}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-staff" disabled>
                            Tidak ada data staff
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Tanggal</Label>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        <div className="w-full">
                          <Calendar
                            mode="single"
                            selected={newAppointment.date}
                            onSelect={(date) =>
                              date &&
                              setNewAppointment({ ...newAppointment, date })
                            }
                            disabled={(date) => date < new Date()}
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="time">Waktu</Label>
                      <Select
                        value={newAppointment.time}
                        onValueChange={(value) =>
                          setNewAppointment({ ...newAppointment, time: value })
                        }
                      >
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => {
                            const isAvailable =
                              !newAppointment.staffId ||
                              isTimeSlotAvailable(newAppointment.staffId, time);
                            return (
                              <SelectItem
                                key={time}
                                value={time}
                                disabled={!isAvailable}
                                className={
                                  !isAvailable
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }
                              >
                                {time} {!isAvailable && "(Tidak tersedia)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Input
                      id="notes"
                      value={newAppointment.notes}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Tambahkan catatan untuk appointment ini"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAddAppointment}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kalender Appointment</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDate(new Date())}
                    >
                      Hari Ini
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDate(addDays(date, -1))}
                    >
                      &lt;
                    </Button>
                    <div className="font-medium">
                      {format(date, "EEEE, d MMMM yyyy", { locale: id })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDate(addDays(date, 1))}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Staff schedules */}
                  {staffList.map((staff) => {
                    const staffAppointments =
                      appointmentsForSelectedDate.filter(
                        (appointment) => appointment.staffId === staff.id,
                      );

                    return (
                      <Card key={staff.id} className="overflow-hidden">
                        <CardHeader className="bg-muted py-2">
                          <CardTitle className="text-base">
                            {staff.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative min-h-[200px] p-4">
                            {staffAppointments.length > 0 ? (
                              staffAppointments.map((appointment) => {
                                // Calculate position based on time
                                const [hour, minute] = appointment.time
                                  .split(":")
                                  .map(Number);
                                const startMinutes =
                                  hour * 60 + minute - 9 * 60; // 9:00 is the start of the day
                                const heightPerMinute = 1.5; // 1.5px per minute

                                return (
                                  <div
                                    key={appointment.id}
                                    className={`absolute left-4 right-4 p-2 rounded-md ${appointment.status === "cancelled" ? "bg-red-100 border-red-200" : appointment.status === "completed" ? "bg-green-100 border-green-200" : "bg-blue-100 border-blue-200"} border`}
                                    style={{
                                      top: `${startMinutes * heightPerMinute}px`,
                                      height: `${appointment.duration * heightPerMinute}px`,
                                    }}
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <div className="font-medium text-sm">
                                      {appointment.time} -{" "}
                                      {appointment.customerName}
                                    </div>
                                    <div className="text-xs">
                                      {appointment.serviceName}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                Tidak ada appointment untuk hari ini
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Semua Appointment</CardTitle>
                <CardDescription>
                  Kelola semua appointment salon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Tanggal & Waktu</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.length > 0 ? (
                        appointments
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime(),
                          )
                          .map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {appointment.customerName}
                                </div>
                              </TableCell>
                              <TableCell>{appointment.serviceName}</TableCell>
                              <TableCell>{appointment.staffName}</TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {format(
                                    parseISO(appointment.date),
                                    "d MMM yyyy",
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {appointment.time} ({appointment.duration}{" "}
                                  menit)
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(appointment.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {appointment.status === "scheduled" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() =>
                                        handleChangeStatus(
                                          appointment.id,
                                          "completed",
                                        )
                                      }
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {appointment.status === "scheduled" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() =>
                                        handleChangeStatus(
                                          appointment.id,
                                          "cancelled",
                                        )
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteAppointment(appointment.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Belum ada appointment yang terdaftar
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Ubah detail appointment</DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-customer">Pelanggan</Label>
                  <Select
                    value={selectedAppointment.customerId}
                    onValueChange={(value) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        customerId: value,
                        customerName:
                          customers.find((c) => c.id === value)?.name || "",
                      })
                    }
                  >
                    <SelectTrigger id="edit-customer">
                      <SelectValue placeholder="Pilih pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length > 0 ? (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-customers" disabled>
                          Tidak ada data pelanggan
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-service">Layanan</Label>
                  <Select
                    value={selectedAppointment.serviceId}
                    onValueChange={(value) => {
                      const service = services.find((s) => s.id === value);
                      setSelectedAppointment({
                        ...selectedAppointment,
                        serviceId: value,
                        serviceName: service?.name || "",
                        duration: service?.duration || 30,
                      });
                    }}
                  >
                    <SelectTrigger id="edit-service">
                      <SelectValue placeholder="Pilih layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length > 0 ? (
                        services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.duration} menit - Rp{" "}
                            {service.price.toLocaleString("id-ID")}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-services" disabled>
                          Tidak ada data layanan
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-staff">Staff</Label>
                  <Select
                    value={selectedAppointment.staffId}
                    onValueChange={(value) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        staffId: value,
                        staffName:
                          staffList.find((s) => s.id === value)?.name || "",
                      })
                    }
                  >
                    <SelectTrigger id="edit-staff">
                      <SelectValue placeholder="Pilih staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.length > 0 ? (
                        staffList.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} - {staff.role}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-staff" disabled>
                          Tidak ada data staff
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={selectedAppointment.status}
                    onValueChange={(value) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        status: value as
                          | "scheduled"
                          | "completed"
                          | "cancelled",
                      })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Terjadwal</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Catatan (Opsional)</Label>
                  <Input
                    id="edit-notes"
                    value={selectedAppointment.notes || ""}
                    onChange={(e) =>
                      setSelectedAppointment({
                        ...selectedAppointment,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Tambahkan catatan untuk appointment ini"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleUpdateAppointment}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AppointmentScheduling;
