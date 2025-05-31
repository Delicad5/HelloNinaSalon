import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Generic function to get data from Supabase with fallback to localStorage
export async function getData<T>(
  table: string,
  localStorageKey: string,
): Promise<T[]> {
  try {
    // Try to get data from Supabase first
    const { data, error } = await supabase.from(table).select("*");

    if (error) {
      console.error(`Error fetching data from ${table}:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      // Also update localStorage with the latest data for offline access
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      return data as T[];
    }

    // If no data in Supabase, try localStorage
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      const parsedData = JSON.parse(localData) as T[];

      // Try to sync localStorage data to Supabase
      try {
        const dataWithIds = parsedData.map((item) => ({
          ...item,
          id: (item as any).id || uuidv4(),
        }));

        await supabase.from(table).upsert(dataWithIds);
        console.log(
          `Synced ${dataWithIds.length} items from localStorage to Supabase for ${table}`,
        );
      } catch (syncError) {
        console.error(
          `Failed to sync localStorage data to Supabase for ${table}:`,
          syncError,
        );
      }

      return parsedData;
    }

    return [];
  } catch (error) {
    console.error(`Error in getData for ${table}:`, error);

    // Fallback to localStorage if Supabase fails
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      return JSON.parse(localData) as T[];
    }

    return [];
  }
}

// Generic function to save data to Supabase with fallback to localStorage
export async function saveData<T extends { id: string }>(
  table: string,
  localStorageKey: string,
  data: T[],
): Promise<boolean> {
  try {
    // Always save to localStorage as backup for offline access
    localStorage.setItem(localStorageKey, JSON.stringify(data));

    // Ensure all items have an ID
    const dataWithIds = data.map((item) => ({
      ...item,
      id: item.id || uuidv4(),
    }));

    // Try to save to Supabase
    const { error } = await supabase.from(table).upsert(dataWithIds);

    if (error) {
      console.error(`Error saving data to ${table}:`, error);
      throw error;
    }

    console.log(
      `Successfully saved ${dataWithIds.length} items to Supabase for ${table}`,
    );
    return true;
  } catch (error) {
    console.error(`Error in saveData for ${table}:`, error);
    // Data is already saved to localStorage as backup
    return false;
  }
}

// Generic function to delete data from Supabase with fallback to localStorage
export async function deleteData(
  table: string,
  localStorageKey: string,
  id: string,
): Promise<boolean> {
  try {
    // Try to delete from Supabase
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      console.error(`Error deleting data from ${table}:`, error);
      throw error;
    }

    // Also update localStorage to keep it in sync
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      const parsedData = JSON.parse(localData);
      const updatedData = parsedData.filter((item) => item.id !== id);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }

    console.log(`Successfully deleted item with id ${id} from ${table}`);
    return true;
  } catch (error) {
    console.error(`Error in deleteData for ${table}:`, error);

    // Fallback to localStorage if Supabase fails
    const localData = localStorage.getItem(localStorageKey);
    if (localData) {
      const parsedData = JSON.parse(localData);
      const updatedData = parsedData.filter((item) => item.id !== id);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    }

    return false;
  }
}

// Function to get settings from Supabase with fallback to localStorage
export async function getSettings(category: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("settings")
      .eq("category", category)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error(`Error fetching settings for ${category}:`, error);
      throw error;
    }

    if (data) {
      // Update localStorage with the latest settings for offline access
      localStorage.setItem(
        `salon_settings_${category}`,
        JSON.stringify(data.settings),
      );
      return data.settings;
    }

    // If no data in Supabase, try localStorage
    const localData = localStorage.getItem(`salon_settings_${category}`);
    if (localData) {
      const parsedSettings = JSON.parse(localData);

      // Try to sync localStorage settings to Supabase
      try {
        await supabase.from("settings").upsert({
          id: `settings-${category}`,
          category,
          settings: parsedSettings,
          updated_at: new Date().toISOString(),
        });
        console.log(
          `Synced settings for ${category} from localStorage to Supabase`,
        );
      } catch (syncError) {
        console.error(
          `Failed to sync settings for ${category} to Supabase:`,
          syncError,
        );
      }

      return parsedSettings;
    }

    return null;
  } catch (error) {
    console.error(`Error in getSettings for ${category}:`, error);

    // Fallback to localStorage if Supabase fails
    const localData = localStorage.getItem(`salon_settings_${category}`);
    if (localData) {
      return JSON.parse(localData);
    }

    return null;
  }
}

// Function to save settings to Supabase with fallback to localStorage
export async function saveSettings(
  category: string,
  settings: any,
): Promise<boolean> {
  try {
    // Always save to localStorage as backup for offline access
    localStorage.setItem(
      `salon_settings_${category}`,
      JSON.stringify(settings),
    );

    // Try to save to Supabase
    const { error } = await supabase.from("settings").upsert({
      id: `settings-${category}`,
      category,
      settings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error saving settings for ${category}:`, error);
      throw error;
    }

    console.log(`Successfully saved settings for ${category} to Supabase`);
    return true;
  } catch (error) {
    console.error(`Error in saveSettings for ${category}:`, error);
    // Settings are already saved to localStorage as backup
    return false;
  }
}

// Specific data service functions for each entity
export const servicesService = {
  getAll: () => getData<any>("services", "layananData"),
  save: (data: any[]) => saveData("services", "layananData", data),
  delete: (id: string) => deleteData("services", "layananData", id),
};

export const productsService = {
  getAll: () => getData<any>("products", "produkData"),
  save: (data: any[]) => saveData("products", "produkData", data),
  delete: (id: string) => deleteData("products", "produkData", id),
};

export const staffService = {
  getAll: () => getData<any>("staff", "stafData"),
  save: (data: any[]) => saveData("staff", "stafData", data),
  delete: (id: string) => deleteData("staff", "stafData", id),
};

export const customersService = {
  getAll: () => getData<any>("customers", "pelangganData"),
  save: (data: any[]) => saveData("customers", "pelangganData", data),
  delete: (id: string) => deleteData("customers", "pelangganData", id),
};

export const usersService = {
  getAll: () => getData<any>("users", "salon_users"),
  save: (data: any[]) => saveData("users", "salon_users", data),
  delete: (id: string) => deleteData("users", "salon_users", id),
};

export const appointmentsService = {
  getAll: () => getData<any>("appointments", "salon_appointments"),
  save: (data: any[]) => saveData("appointments", "salon_appointments", data),
  delete: (id: string) => deleteData("appointments", "salon_appointments", id),
};

export const transactionsService = {
  getAll: async () => {
    try {
      // Try to get transactions from Supabase first
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      if (transactions && transactions.length > 0) {
        // For each transaction, get its items
        for (const transaction of transactions) {
          const { data: items, error: itemsError } = await supabase
            .from("transaction_items")
            .select("*")
            .eq("transaction_id", transaction.id);

          if (itemsError) {
            console.error(
              `Error fetching items for transaction ${transaction.id}:`,
              itemsError,
            );
          } else if (items) {
            transaction.items = items;
          }
        }

        // Update localStorage with the latest data
        localStorage.setItem(
          "transactionHistory",
          JSON.stringify(transactions),
        );
        return transactions;
      }

      // If no data in Supabase, try localStorage
      const localData = localStorage.getItem("transactionHistory");
      if (localData) {
        return JSON.parse(localData);
      }

      return [];
    } catch (error) {
      console.error("Error fetching transactions:", error);

      // Fallback to localStorage
      const localData = localStorage.getItem("transactionHistory");
      if (localData) {
        return JSON.parse(localData);
      }

      return [];
    }
  },
  save: async (data: any[]) => {
    try {
      // Save transactions to localStorage as backup
      localStorage.setItem("transactionHistory", JSON.stringify(data));

      for (const transaction of data) {
        const transactionId = transaction.id || uuidv4();

        // Save transaction
        const { error: transactionError } = await supabase
          .from("transactions")
          .upsert({
            id: transactionId,
            customer_id: transaction.customer?.id || null,
            subtotal: transaction.subtotal || transaction.total || 0,
            discount_type: transaction.discountType || null,
            discount_value: transaction.discountValue || 0,
            discount_amount: transaction.discountAmount || 0,
            total: transaction.total || 0,
            payment_method: transaction.paymentMethod || "cash",
            status: transaction.status || "completed",
            date: new Date(transaction.date).toISOString().split("T")[0],
            time: transaction.time || new Date().toTimeString().slice(0, 5),
          });

        if (transactionError) throw transactionError;

        // Save transaction items
        if (transaction.items && transaction.items.length > 0) {
          for (const item of transaction.items) {
            const { error: itemError } = await supabase
              .from("transaction_items")
              .upsert({
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
              });

            if (itemError) throw itemError;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving transactions:", error);
      return false;
    }
  },
  delete: async (id: string) => {
    try {
      // Delete transaction items first
      const { error: itemsError } = await supabase
        .from("transaction_items")
        .delete()
        .eq("transaction_id", id);

      if (itemsError) throw itemsError;

      // Then delete the transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (transactionError) throw transactionError;

      // Update localStorage
      const localData = localStorage.getItem("transactionHistory");
      if (localData) {
        const parsedData = JSON.parse(localData);
        const updatedData = parsedData.filter((item) => item.id !== id);
        localStorage.setItem("transactionHistory", JSON.stringify(updatedData));
      }

      return true;
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);

      // Fallback to localStorage
      const localData = localStorage.getItem("transactionHistory");
      if (localData) {
        const parsedData = JSON.parse(localData);
        const updatedData = parsedData.filter((item) => item.id !== id);
        localStorage.setItem("transactionHistory", JSON.stringify(updatedData));
      }

      return false;
    }
  },
};
