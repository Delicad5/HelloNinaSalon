-- Enable realtime for all tables

-- Check if tables exist before adding them to the publication
DO $$
BEGIN
  -- Check and add users table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    ALTER publication supabase_realtime ADD TABLE users;
  END IF;

  -- Check and add customers table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    ALTER publication supabase_realtime ADD TABLE customers;
  END IF;

  -- Check and add staff table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff') THEN
    ALTER publication supabase_realtime ADD TABLE staff;
  END IF;

  -- Check and add services table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    ALTER publication supabase_realtime ADD TABLE services;
  END IF;

  -- Check and add products table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    ALTER publication supabase_realtime ADD TABLE products;
  END IF;

  -- Check and add transactions table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    ALTER publication supabase_realtime ADD TABLE transactions;
  END IF;

  -- Check and add transaction_items table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transaction_items') THEN
    ALTER publication supabase_realtime ADD TABLE transaction_items;
  END IF;

  -- Check and add appointments table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments') THEN
    ALTER publication supabase_realtime ADD TABLE appointments;
  END IF;

  -- Check and add settings table
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
    ALTER publication supabase_realtime ADD TABLE settings;
  END IF;
END;
$$;