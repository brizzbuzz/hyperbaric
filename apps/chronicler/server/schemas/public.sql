CREATE SCHEMA IF NOT EXISTS public;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a function to generate UUIDs (fallback if extensions fail)
CREATE OR REPLACE FUNCTION public.gen_random_uuid()
RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v4();
EXCEPTION WHEN OTHERS THEN
  -- Fallback to a simple random UUID generation
  RETURN (
    SELECT (array_to_string(ARRAY(SELECT lpad(to_hex(width_bucket(random(), 0, 1, 256)-1),2,'0') FROM generate_series(1, 16)), ''))::uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
