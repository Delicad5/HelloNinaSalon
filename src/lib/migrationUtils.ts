import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Function to migrate data from localStorage to Supabase
export async function migrateDataToSupabase() {
  try {
    console.log("Starting data migration to Supabase...");

    // Migrate users
    await migrateUsers();

    // Migrate customers
    await migrateCustomers();

    // Migrate staff
    await migrateStaff();

    // Migrate services
    await migrateServices();

    // Migrate products
    await migrateProducts();

    // Migrate appointments
    await migrateAppointments();

    // Migrate transactions
    await migrateTransactions();

    // Migrate settings
    await migrateSettings();

    console.log("Data migration completed successfully!");
    return { success: true, message: "Data migration completed successfully!" };
  } catch (error) {
    console.error("Error during data migration:", error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}

// Migrate users from localStorage to Supabase
async function migrateUsers() {
  const storedUsers =
    localStorage.getItem("salon_users") || localStorage.getItem("penggunaData");
  if (!storedUsers) return;

  const users = JSON.parse(storedUsers);

  for (const user of users) {
    // Map localStorage user structure to Supabase structure
    const supabaseUser = {
      id: user.id || uuidv4(),
      username: user.username || user.username,
      full_name: user.name || user.namaLengkap || "User",
      role: user.role || user.peran || "staff",
      status: user.status === "Aktif" ? "active" : "active",
      avatar_url: user.avatar || null,
    };

    // Insert user into Supabase
    const { error } = await supabase.from("users").upsert(supabaseUser);

    if (error) {
      console.error(`Error migrating user ${user.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${users.length} users`);
}

// Migrate customers from localStorage to Supabase
async function migrateCustomers() {
  const storedCustomers = localStorage.getItem("pelangganData");
  if (!storedCustomers) return;

  const customers = JSON.parse(storedCustomers);

  for (const customer of customers) {
    // Map localStorage customer structure to Supabase structure
    const supabaseCustomer = {
      id: customer.id || uuidv4(),
      name: customer.nama || customer.name || "Customer",
      phone: customer.telepon || customer.phone || "-",
      email: customer.email || null,
      last_visit: customer.kunjunganTerakhir || null,
    };

    // Insert customer into Supabase
    const { error } = await supabase.from("customers").upsert(supabaseCustomer);

    if (error) {
      console.error(`Error migrating customer ${customer.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${customers.length} customers`);
}

// Migrate staff from localStorage to Supabase
async function migrateStaff() {
  const storedStaff = localStorage.getItem("stafData");
  if (!storedStaff) return;

  const staffList = JSON.parse(storedStaff);

  for (const staff of staffList) {
    // Map localStorage staff structure to Supabase structure
    const supabaseStaff = {
      id: staff.id || uuidv4(),
      name: staff.nama || staff.name || "Staff",
      position: staff.posisi || staff.role || "Staff",
      phone: staff.telepon || staff.phone || "-",
      status: staff.status || "active",
      commission_rate: staff.komisi || staff.commission || 10,
    };

    // Insert staff into Supabase
    const { error } = await supabase.from("staff").upsert(supabaseStaff);

    if (error) {
      console.error(`Error migrating staff ${staff.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${staffList.length} staff members`);
}

// Migrate services from localStorage to Supabase
async function migrateServices() {
  const storedServices = localStorage.getItem("layananData");
  if (!storedServices) return;

  const services = JSON.parse(storedServices);

  for (const service of services) {
    // Map localStorage service structure to Supabase structure
    const supabaseService = {
      id: service.id || uuidv4(),
      name: service.nama || service.name || "Service",
      price: service.harga || service.price || 0,
      duration: service.durasi || service.duration || 30,
      category: service.kategori || service.category || "General",
    };

    // Insert service into Supabase
    const { error } = await supabase.from("services").upsert(supabaseService);

    if (error) {
      console.error(`Error migrating service ${service.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${services.length} services`);
}

// Migrate products from localStorage to Supabase
async function migrateProducts() {
  const storedProducts = localStorage.getItem("produkData");
  if (!storedProducts) return;

  const products = JSON.parse(storedProducts);

  for (const product of products) {
    // Map localStorage product structure to Supabase structure
    const supabaseProduct = {
      id: product.id || uuidv4(),
      name: product.nama || product.name || "Product",
      price: product.harga || product.price || 0,
      stock: product.stok || product.stock || 0,
      category: product.kategori || product.category || "General",
    };

    // Insert product into Supabase
    const { error } = await supabase.from("products").upsert(supabaseProduct);

    if (error) {
      console.error(`Error migrating product ${product.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${products.length} products`);
}

// Migrate appointments from localStorage to Supabase
async function migrateAppointments() {
  const storedAppointments = localStorage.getItem("salon_appointments");
  if (!storedAppointments) return;

  const appointments = JSON.parse(storedAppointments);

  for (const appointment of appointments) {
    // Map localStorage appointment structure to Supabase structure
    const supabaseAppointment = {
      id: appointment.id || uuidv4(),
      customer_id: appointment.customerId,
      staff_id: appointment.staffId,
      service_id: appointment.serviceId,
      date: new Date(appointment.date).toISOString().split("T")[0],
      time: appointment.time,
      duration: appointment.duration || 30,
      status: appointment.status || "scheduled",
      notes: appointment.notes || null,
    };

    // Insert appointment into Supabase
    const { error } = await supabase
      .from("appointments")
      .upsert(supabaseAppointment);

    if (error) {
      console.error(`Error migrating appointment ${appointment.id}:`, error);
      throw error;
    }
  }

  console.log(`Migrated ${appointments.length} appointments`);
}

// Migrate transactions from localStorage to Supabase
async function migrateTransactions() {
  const storedTransactions = localStorage.getItem("transactionHistory");
  if (!storedTransactions) return;

  const transactions = JSON.parse(storedTransactions);

  for (const transaction of transactions) {
    const transactionId = transaction.id || uuidv4();
    const transactionDate = new Date(transaction.date);

    // Map localStorage transaction structure to Supabase structure
    const supabaseTransaction = {
      id: transactionId,
      customer_id: transaction.customer?.id || null,
      subtotal: transaction.subtotal || transaction.total || 0,
      discount_type: transaction.discountType || null,
      discount_value: transaction.discountValue || 0,
      discount_amount: transaction.discountAmount || 0,
      total: transaction.total || 0,
      payment_method: transaction.paymentMethod || "cash",
      status: transaction.status || "completed",
      date: transactionDate.toISOString().split("T")[0],
      time: transaction.time || transactionDate.toTimeString().slice(0, 5),
    };

    // Insert transaction into Supabase
    const { error: transactionError } = await supabase
      .from("transactions")
      .upsert(supabaseTransaction);

    if (transactionError) {
      console.error(
        `Error migrating transaction ${transaction.id}:`,
        transactionError,
      );
      throw transactionError;
    }

    // Migrate transaction items
    if (transaction.items && transaction.items.length > 0) {
      for (const item of transaction.items) {
        const supabaseTransactionItem = {
          id: `${transactionId}-${item.id || Math.random().toString(36).substring(2, 9)}`,
          transaction_id: transactionId,
          type:
            item.type ||
            (item.name &&
              (item.name.includes("Potong") ||
                item.name.includes("Facial") ||
                item.name.includes("Cream")))
              ? "service"
              : "product",
          item_id: item.id || "",
          name: item.name || "Item",
          price: item.price || 0,
          quantity: item.quantity || 1,
          staff_id: item.staffId || null,
        };

        const { error: itemError } = await supabase
          .from("transaction_items")
          .upsert(supabaseTransactionItem);

        if (itemError) {
          console.error(
            `Error migrating transaction item for transaction ${transactionId}:`,
            itemError,
          );
          throw itemError;
        }
      }
    }
  }

  console.log(`Migrated ${transactions.length} transactions`);
}

// Migrate settings from localStorage to Supabase
async function migrateSettings() {
  const settingsKeys = [
    "salon_settings_general",
    "salon_settings_printer",
    "salon_settings_payment",
    "salon_settings_user",
  ];

  for (const key of settingsKeys) {
    const storedSettings = localStorage.getItem(key);
    if (!storedSettings) continue;

    try {
      const settings = JSON.parse(storedSettings);
      const category = key.replace("salon_settings_", "");

      const supabaseSettings = {
        id: `settings-${category}`,
        category,
        settings,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("settings")
        .upsert(supabaseSettings);

      if (error) {
        console.error(`Error migrating settings ${category}:`, error);
        throw error;
      }

      console.log(`Migrated ${category} settings`);
    } catch (error) {
      console.error(`Error parsing settings ${key}:`, error);
    }
  }
}
