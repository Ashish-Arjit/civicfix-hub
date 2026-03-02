
-- Create status enum type
CREATE TYPE complaint_status AS ENUM ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated');

-- Create priority enum type  
CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- Create service_categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Allow insert categories" ON public.service_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete categories" ON public.service_categories FOR DELETE USING (true);

-- Create officers table
CREATE TABLE public.officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view officers" ON public.officers FOR SELECT USING (true);
CREATE POLICY "Allow insert officers" ON public.officers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update officers" ON public.officers FOR UPDATE USING (true);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  ward TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'Pending',
  priority complaint_priority NOT NULL DEFAULT 'Medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  image_urls TEXT[] DEFAULT '{}',
  has_image BOOLEAN NOT NULL DEFAULT false,
  image_verified BOOLEAN DEFAULT false,
  officer TEXT,
  officer_designation TEXT,
  funds_allocated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Anyone can create complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update complaints" ON public.complaints FOR UPDATE USING (true);

-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public) VALUES ('complaints', 'complaints', true);

CREATE POLICY "Anyone can upload complaint images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'complaints');
CREATE POLICY "Anyone can view complaint images" ON storage.objects FOR SELECT USING (bucket_id = 'complaints');

-- Seed service categories
INSERT INTO public.service_categories (name) VALUES
  ('Street Lighting'), ('Water Supply'), ('Road Repair'), ('Garbage'),
  ('Sewage'), ('Potholes'), ('Public Toilets'), ('Electricity');
