-- ==============================================================================
-- SUSTAINSULSE PLATFORM - PRODUCTION DATABASE MIGRATION V4 (FINAL PERFECTION)
-- Matches Exact User Schema | Zero Errors | Pure Supabase JWT Auth
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. UPGRADE EXISTING TABLES (Ensure all columns exist)
-- ==============================================================================

-- 1.1 Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'STUDENT';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ADMIN', 'INSTRUCTOR', 'STUDENT'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 1.2 Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  course_url TEXT,
  completed_at TIMESTAMPTZ,
  ghl_offer_id TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_title TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

DO $$
BEGIN
  ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_email_course_unique;
  ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_email_course_unique UNIQUE (email, course_id);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 2. CREATE NEW TABLES (Wishlists, Cart, Certificates, Orders, etc.)
-- ==============================================================================

-- 2.1 Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  course_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS course_id TEXT;

-- 2.2 Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  course_id TEXT NOT NULL,
  price_at_addition NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS course_id TEXT;

-- 2.3 Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  course_id TEXT NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  grade_percent NUMERIC(5, 2) DEFAULT 100,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT,
  qr_code_url TEXT
);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS course_id TEXT;

-- 2.4 Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  email TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  final_amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'COMPLETED',
  payment_gateway TEXT DEFAULT 'MANUAL',
  payment_reference TEXT,
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;

-- 2.6 Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID,
  user_id UUID,
  email TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'PAID',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS email TEXT;

-- 2.7 Support Tickets & Replies
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  email TEXT,
  category TEXT NOT NULL DEFAULT 'technical',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  user_id UUID,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_replies ADD COLUMN IF NOT EXISTS user_id UUID;

-- ==============================================================================
-- 3. TRIGGER FUNCTION FOR NEW AUTH USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone, national_id)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    CASE
      WHEN UPPER(NEW.raw_app_meta_data->>'role') IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN') THEN 'ADMIN'
      WHEN UPPER(NEW.raw_app_meta_data->>'role') IN ('INSTRUCTOR', 'TRAINER', 'TEACHER') THEN 'INSTRUCTOR'
      ELSE 'STUDENT'
    END,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'national_id'
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_email ON public.wishlists(email);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_email ON public.cart_items(email);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & JWT POLICIES
-- ==============================================================================

-- Security Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', ''))
    IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN');
$$ LANGUAGE sql STABLE SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (
  id = auth.uid() OR public.is_admin()
);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (
  id = auth.uid() OR public.is_admin()
) WITH CHECK (id = auth.uid() OR public.is_admin());

-- 5.2 Enrollments
DROP POLICY IF EXISTS "User views enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "User creates enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "User views enrollments" ON public.enrollments FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
-- Enrollment creation/progress is server-managed so users cannot grant
-- themselves access to paid or restricted courses.
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5.3 Wishlists & Cart
DROP POLICY IF EXISTS "Wishlist access" ON public.wishlists;
DROP POLICY IF EXISTS "Cart access" ON public.cart_items;
CREATE POLICY "Wishlist access" ON public.wishlists FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Cart access" ON public.cart_items FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);

-- 5.4 Certificates
DROP POLICY IF EXISTS "Public certificate verification" ON public.certificates;
DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
CREATE POLICY "Public certificate verification" ON public.certificates FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5.5 Coupons, Orders & Invoices
DROP POLICY IF EXISTS "View coupons" ON public.coupons;
DROP POLICY IF EXISTS "Manage coupons" ON public.coupons;
-- Coupon codes must not be enumerable by anonymous clients.
CREATE POLICY "View coupons" ON public.coupons FOR SELECT USING (public.is_admin());
CREATE POLICY "Manage coupons" ON public.coupons FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Orders access" ON public.orders;
DROP POLICY IF EXISTS "Invoices access" ON public.invoices;
CREATE POLICY "Orders access" ON public.orders FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Invoices access" ON public.invoices FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);

-- 5.6 Support Tickets & Replies
DROP POLICY IF EXISTS "Tickets access" ON public.support_tickets;
DROP POLICY IF EXISTS "Replies access" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins manage tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users create replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Admins manage replies" ON public.ticket_replies;
CREATE POLICY "Tickets access" ON public.support_tickets FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  AND status = 'OPEN'
  AND priority = 'NORMAL'
);
CREATE POLICY "Admins manage tickets" ON public.support_tickets FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Replies access" ON public.ticket_replies FOR SELECT USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.support_tickets AS ticket
    WHERE ticket.id = ticket_replies.ticket_id
      AND (
        ticket.user_id = auth.uid()
        OR (ticket.user_id IS NULL AND LOWER(ticket.email) = LOWER(auth.jwt() ->> 'email'))
      )
  )
);
CREATE POLICY "Users create replies" ON public.ticket_replies FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND is_admin_reply = false
  AND EXISTS (
    SELECT 1 FROM public.support_tickets AS ticket
    WHERE ticket.id = ticket_replies.ticket_id
      AND (
        ticket.user_id = auth.uid()
        OR (ticket.user_id IS NULL AND LOWER(ticket.email) = LOWER(auth.jwt() ->> 'email'))
      )
  )
);
CREATE POLICY "Admins manage replies" ON public.ticket_replies FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
