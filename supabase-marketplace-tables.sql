-- ============================================================
-- النبض المستدام — متجر الخدمات المصغرة (Marketplace)
-- ============================================================

-- 1. فئات الخدمات
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. الخدمات المصغرة
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  delivery_days INTEGER DEFAULT 3,
  revision_count INTEGER DEFAULT 1,
  thumbnail_url TEXT,
  gallery_urls JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  requirements TEXT,
  status TEXT DEFAULT 'pending_review' CHECK (status IN ('active', 'pending_review', 'paused', 'rejected', 'archived')),
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. طلبات الخدمات
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'disputed')),
  requirements_text TEXT,
  delivery_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. رسائل الطلبات (محادثة بين المشتري ومقدم الخدمة)
CREATE TABLE IF NOT EXISTS service_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. تقييمات الخدمات
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الفهارس (Indexes)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_orders_buyer ON service_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_provider ON service_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_order_messages_order ON service_order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_service_reviews_service ON service_reviews(service_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_reviews_order_unique ON service_reviews(order_id) WHERE order_id IS NOT NULL;

-- ============================================================
-- قيود أمان على الحقول الحساسة
-- ============================================================
CREATE OR REPLACE FUNCTION protect_marketplace_service_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')) IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.provider_id := auth.uid();
    NEW.status := 'pending_review';
    NEW.rating_avg := 0;
    NEW.rating_count := 0;
    NEW.orders_count := 0;
    NEW.is_featured := FALSE;
  ELSE
    IF NEW.provider_id IS DISTINCT FROM OLD.provider_id
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.rating_avg IS DISTINCT FROM OLD.rating_avg
      OR NEW.rating_count IS DISTINCT FROM OLD.rating_count
      OR NEW.orders_count IS DISTINCT FROM OLD.orders_count
      OR NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
      RAISE EXCEPTION 'Protected service fields cannot be changed by providers'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_marketplace_service_write_trigger ON services;
CREATE TRIGGER protect_marketplace_service_write_trigger
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION protect_marketplace_service_write();

CREATE OR REPLACE FUNCTION protect_marketplace_order_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_service services%ROWTYPE;
  caller UUID := auth.uid();
BEGIN
  IF auth.role() = 'service_role' OR UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')) IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT * INTO selected_service FROM services WHERE id = NEW.service_id AND status = 'active';
    IF NOT FOUND OR selected_service.provider_id IS NULL THEN
      RAISE EXCEPTION 'Service is not available for ordering' USING ERRCODE = '42501';
    END IF;

    NEW.buyer_id := caller;
    NEW.provider_id := selected_service.provider_id;
    NEW.price := selected_service.price;
    NEW.currency := selected_service.currency;
    NEW.status := 'pending';
    NEW.order_number := 'SRV-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12));
    NEW.delivery_date := NOW() + make_interval(days => GREATEST(1, selected_service.delivery_days));
    RETURN NEW;
  END IF;

  IF NEW.service_id IS DISTINCT FROM OLD.service_id
    OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
    OR NEW.provider_id IS DISTINCT FROM OLD.provider_id
    OR NEW.price IS DISTINCT FROM OLD.price
    OR NEW.currency IS DISTINCT FROM OLD.currency
    OR NEW.order_number IS DISTINCT FROM OLD.order_number
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Immutable order fields cannot be changed' USING ERRCODE = '42501';
  END IF;

  IF caller = OLD.buyer_id THEN
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      (OLD.status = 'pending' AND NEW.status = 'cancelled') OR
      (OLD.status = 'delivered' AND NEW.status IN ('revision_requested', 'completed', 'disputed'))
    ) THEN
      RAISE EXCEPTION 'Buyer cannot perform this status transition' USING ERRCODE = '42501';
    END IF;
  ELSIF caller = OLD.provider_id THEN
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      (OLD.status = 'pending' AND NEW.status IN ('in_progress', 'cancelled')) OR
      (OLD.status IN ('in_progress', 'revision_requested') AND NEW.status = 'delivered')
    ) THEN
      RAISE EXCEPTION 'Provider cannot perform this status transition' USING ERRCODE = '42501';
    END IF;
  ELSE
    RAISE EXCEPTION 'Not a party to this order' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_marketplace_order_write_trigger ON service_orders;
CREATE TRIGGER protect_marketplace_order_write_trigger
  BEFORE INSERT OR UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION protect_marketplace_order_write();

-- ============================================================
-- سياسات RLS
-- ============================================================
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- service_categories: قابل للقراءة للجميع
DROP POLICY IF EXISTS "service_categories_read" ON service_categories;
CREATE POLICY "service_categories_read" ON service_categories FOR SELECT USING (TRUE);

-- services: قابل للقراءة للجميع (النشطة فقط)، الكتابة لمالك الخدمة
DROP POLICY IF EXISTS "services_read_active" ON services;
DROP POLICY IF EXISTS "services_insert" ON services;
DROP POLICY IF EXISTS "services_update" ON services;
DROP POLICY IF EXISTS "services_delete" ON services;
CREATE POLICY "services_read_active" ON services FOR SELECT USING (status = 'active' OR provider_id = auth.uid());
CREATE POLICY "services_insert" ON services FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "services_update" ON services FOR UPDATE USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());
CREATE POLICY "services_delete" ON services FOR DELETE USING (provider_id = auth.uid());

-- service_orders: القراءة للمشتري أو مقدم الخدمة
DROP POLICY IF EXISTS "orders_read" ON service_orders;
DROP POLICY IF EXISTS "orders_insert" ON service_orders;
DROP POLICY IF EXISTS "orders_update" ON service_orders;
CREATE POLICY "orders_read" ON service_orders FOR SELECT USING (buyer_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "orders_insert" ON service_orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "orders_update" ON service_orders FOR UPDATE
  USING (buyer_id = auth.uid() OR provider_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR provider_id = auth.uid());

-- service_order_messages: القراءة لأطراف الطلب
DROP POLICY IF EXISTS "messages_read" ON service_order_messages;
DROP POLICY IF EXISTS "messages_insert" ON service_order_messages;
CREATE POLICY "messages_read" ON service_order_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM service_orders WHERE id = order_id AND (buyer_id = auth.uid() OR provider_id = auth.uid())));
CREATE POLICY "messages_insert" ON service_order_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND LENGTH(message) BETWEEN 1 AND 5000
    AND EXISTS (SELECT 1 FROM service_orders WHERE id = order_id AND (buyer_id = auth.uid() OR provider_id = auth.uid()))
  );

-- service_reviews: قابل للقراءة للجميع
DROP POLICY IF EXISTS "reviews_read" ON service_reviews;
DROP POLICY IF EXISTS "reviews_insert" ON service_reviews;
CREATE POLICY "reviews_read" ON service_reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert" ON service_reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_id
      AND buyer_id = auth.uid()
      AND status = 'completed'
      AND service_id = service_reviews.service_id
  )
);

-- ============================================================
-- بيانات تجريبية — فئات الخدمات
-- ============================================================
INSERT INTO service_categories (name, name_en, slug, description, icon, sort_order) VALUES
  ('تصميم وإبداع', 'Design & Creative', 'design', 'خدمات التصميم الجرافيكي والهوية البصرية والعروض التقديمية', 'Palette', 1),
  ('برمجة وتطوير', 'Development', 'development', 'تطوير المواقع والتطبيقات والأنظمة البرمجية', 'Code2', 2),
  ('كتابة وترجمة', 'Writing & Translation', 'writing', 'كتابة المحتوى والترجمة والتدقيق اللغوي', 'PenTool', 3),
  ('تسويق رقمي', 'Digital Marketing', 'marketing', 'إدارة الحملات الإعلانية وتحسين محركات البحث والتسويق', 'TrendingUp', 4),
  ('استشارات وتدريب', 'Consulting & Training', 'consulting', 'استشارات مهنية وتدريب متخصص وإرشاد أكاديمي', 'GraduationCap', 5),
  ('إدخال بيانات', 'Data Entry', 'data-entry', 'إدخال ومعالجة البيانات والجداول والتقارير', 'Database', 6),
  ('فيديو وصوت', 'Video & Audio', 'media', 'مونتاج الفيديو والتعليق الصوتي والبودكاست', 'Film', 7),
  ('أعمال إدارية', 'Business & Admin', 'business', 'خدمات السكرتارية والمراسلات وإدارة الأعمال', 'Briefcase', 8)
ON CONFLICT (slug) DO NOTHING;
