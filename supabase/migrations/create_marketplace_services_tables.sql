-- ============================================================
-- النبض المستدام — هيكل بيانات متجر الخدمات (Marketplace)
-- مبني على بيانات حقيقية وإحصائيات ديناميكية 100%
-- ============================================================

-- 1. إنشاء جدول فئات الخدمات (service_categories)
CREATE TABLE IF NOT EXISTS public.service_categories (
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

-- 2. إنشاء جدول الخدمات (services)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  delivery_days INTEGER DEFAULT 3,
  revision_count INTEGER DEFAULT 1,
  thumbnail_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  requirements TEXT,
  provider_name TEXT DEFAULT 'إدارة المنصة المعتمدة',
  provider_role TEXT DEFAULT 'خبير معتمد في المنصة',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'paused', 'rejected', 'archived')),
  rating_avg NUMERIC(3,2) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. إنشاء جدول طلبات الخدمات الحقيقية (service_orders)
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || to_char(NOW(), 'YYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
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

-- 4. إنشاء جدول تقييمات الخدمات الحقيقية (service_reviews)
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس الأداء
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_reviews_service ON public.service_reviews(service_id);

-- سياسات الحماية (RLS)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_categories_read" ON public.service_categories;
CREATE POLICY "service_categories_read" ON public.service_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "services_read" ON public.services;
CREATE POLICY "services_read" ON public.services FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "services_admin_all" ON public.services;
CREATE POLICY "services_admin_all" ON public.services FOR ALL USING (
  auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role::text) IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN')
  )
);

DROP POLICY IF EXISTS "orders_read" ON public.service_orders;
CREATE POLICY "orders_read" ON public.service_orders FOR SELECT USING (
  buyer_id = auth.uid() OR provider_id = auth.uid() OR auth.role() = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND UPPER(role::text) IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN')
  )
);

DROP POLICY IF EXISTS "reviews_read" ON public.service_reviews;
CREATE POLICY "reviews_read" ON public.service_reviews FOR SELECT USING (TRUE);

-- ============================================================
-- 5. تريجرات الأتمتة للإحصائيات الحقيقية التلقائية
-- ============================================================

-- أتمتة حساب عدد الطلبات الحقيقية عند اكتمال أي طلب
CREATE OR REPLACE FUNCTION update_service_orders_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.services
    SET orders_count = (
      SELECT COUNT(*) FROM public.service_orders
      WHERE service_id = NEW.service_id AND status = 'completed'
    )
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_service_orders_stats ON public.service_orders;
CREATE TRIGGER trg_update_service_orders_stats
  AFTER INSERT OR UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION update_service_orders_stats();

-- أتمتة حساب التقييم الفعلي من جدول التقييمات
CREATE OR REPLACE FUNCTION update_service_reviews_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_service UUID;
BEGIN
  target_service := COALESCE(NEW.service_id, OLD.service_id);
  UPDATE public.services
  SET
    rating_avg = COALESCE((SELECT ROUND(AVG(rating), 2) FROM public.service_reviews WHERE service_id = target_service), 5.0),
    rating_count = (SELECT COUNT(*) FROM public.service_reviews WHERE service_id = target_service)
  WHERE id = target_service;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_service_reviews_stats ON public.service_reviews;
CREATE TRIGGER trg_update_service_reviews_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.service_reviews
  FOR EACH ROW EXECUTE FUNCTION update_service_reviews_stats();

-- ============================================================
-- 6. إدخال فئات الخدمات الأساسية (Categories Seed)
-- ============================================================
INSERT INTO public.service_categories (name, name_en, slug, description, icon, sort_order) VALUES
  ('تصميم وهويات بصرية', 'Design & Branding', 'design', 'تصميم الهويات البصرية والشعارات والبراندينج', 'Palette', 1),
  ('برمجة وتطوير ويب', 'Web Development', 'development', 'تطوير المواقع والمنصات والتطبيقات السحابية', 'Code2', 2),
  ('تصميم واجهات UI/UX', 'UI/UX Design', 'uiux', 'تصميم واجهات وتجربة المستخدم للتطبيقات والمواقع', 'LayoutGrid', 3),
  ('كتابة محتوى وسيو', 'Content & SEO', 'writing', 'كتابة المقالات وصياغة المحتوى المتوافق مع محركات البحث', 'PenTool', 4),
  ('تسويق وإعلانات ممولة', 'Digital Marketing', 'marketing', 'إدارة الحملات الإعلانية الممولة وخطط النمو والتسويق', 'TrendingUp', 5),
  ('استشارات واعتماد NELC', 'Consulting & Accreditation', 'consulting', 'استشارات التأهيل المؤسسي وتراخيص التعليم والتدريب', 'GraduationCap', 6),
  ('مونتاج وفيديو موشن', 'Video & Motion', 'media', 'إنتاج المقاطع المرئية والموشن جرافيك والمونتاج الاحترافي', 'Film', 7),
  ('تحليل بيانات وإكسل', 'Data & Analytics', 'data-entry', 'بناء لوحات المؤشرات المالية ونماذج اتخاذ القرار', 'Database', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. إدخال الـ 16 خدمة ببيانات نظيفة وحقيقية (بدءاً من 0 طلبات وتقييمات فعلية)
-- ============================================================

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تصميم هوية بصرية متكاملة واحترافية لمنشأتك متوافقة مع رؤية 2030',
  'شعار أصلي، ألوان معتمدة، بطاقات أعمال، ورق مراسلات، ودليل استخدام شامل للهوية بجودة فيكتور.',
  'تصميم الهوية البصرية ليس مجرد رسم شعار، بل هو بناء الصورة الذهنية والانطباع الأول لعملائك ومستثمريك.

أعمل معك خطوة بخطوة لدراسة نشاطك التجاري والمنافسين في السوق السعودي، ثم نبتكر هوية فريدة تعكس قيمك وتجذب فئتك المستهدفة بدقة عالية.

ما الذي يميز هذه الخدمة؟
• الابتكار والأصالة: أفكار مبتكرة وغير مقلدة من قوالب جاهزة.
• التوافق التام: ملائمة للتطبيقات الرقمية والطباعية بجميع المقاسات.
• سرعة الاستجابة والمرونة: مراجعات دورية لضمان رضاك التام بنسبة 100%.',
  750,
  'SAR',
  5,
  3,
  '/services/branding.jpg',
  '["تصميم","هوية بصرية","شعار","براندينج"]'::jsonb,
  '[{"title":"تصميم الشعار الأساسي والفرعي","desc":"شعار أصلي 100% بنماذج متعددة وصيغ فيكتور قابلة للتكبير (AI, EPS, SVG, PNG)"},{"title":"دليل الهوية البصرية الشامل (Brand Guidelines)","desc":"كتيب PDF يحتوي على الألوان المعتمدة (HEX, RGB, CMYK, Pantone) والخطوط الرسمية وقواعد الاستخدام"},{"title":"حزمة المطبوعات الرسمية (Stationery)","desc":"تصميم بطاقات الأعمال (Business Cards)، ورق المراسلات الرسمي (Letterhead)، والأظرف"},{"title":"قوالب وسائل التواصل الاجتماعي","desc":"تصاميم لمنشورات انستغرام وتويتر/X وملفات الغلاف الاحترافية"},{"title":"تسليم الملفات المصدرية المفتوحة","desc":"كامل الملفات المفتوحة القابلة للتعديل والطباعة الفورية بجودة فائقة"}]'::jsonb,
  'يرجى تزويدنا بـ: 1. اسم المنشأة باللغتين العربية والإنجليزية. 2. نبذة مختصرة عن نشاطك والجمهور المستهدف. 3. الألوان المفضلة أو أي أمثلة ملهمة ترغب بالاسترشاد بها.',
  'سارة الغامدي',
  'استشارية براندينج وهوية',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'design'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'برمجة وتطوير موقع إلكتروني فائق السرعة بـ Next.js وTailwind CSS',
  'تطوير موقع متجاوب بالكامل مع لوحة تحكم سهلة وسرعة 100% على مؤشرات Google PageSpeed.',
  'احصل على موقع ويب احترافي ينافس كبرى الشركات في المظهر والأداء وسرعة التحميل.

نستخدم أحدث المعايير البرمجية لضمان موقع خالي من الأخطاء، آمن، ومبني ليتوسع مع نمو أعمالك ومبيعاتك.',
  2500,
  'SAR',
  14,
  2,
  '/services/development.jpg',
  '["برمجة","Next.js","React","موقع"]'::jsonb,
  '[{"title":"واجهة أمامية فائقة السرعة والتجاوب","desc":"موقع إلكتروني مبني بأحدث تقنيات React & Next.js 15 بتصميم عصري وأداء 100% على Google PageSpeed"},{"title":"لوحة تحكم ديناميكية وسهلة الاستخدام","desc":"إمكانية تعديل المحتوى والنصوص والصور بسهولة تامة وبدون كتابة كود"},{"title":"تهيأة محركات البحث المتقدمة (SEO)","desc":"بنية معمارية محسنة لمحركات البحث مع OpenGraph وSchema Markup"},{"title":"ربط النماذج وقواعد البيانات","desc":"ربط نماذج الاتصال والدفع وبوابات مثل Supabase أو Stripe/Mada"},{"title":"نشر الموقع واستضافة مجانية","desc":"رفع الموقع على خوادم سحابية عالمية (Vercel) وربط النطاق الخاص بك"}]'::jsonb,
  'يرجى توفير: 1. تفاصيل الصفحات المطلوبة ومحتواها. 2. الشعار والألوان المعتمدة. 3. أي روابط لمواقع تود محاكاة أسلوبها.',
  'م. أحمد العمري',
  'مطور Full-Stack أول',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تصميم واجهات وتجربة المستخدم UI/UX لتطبيقات الجوال ببرنامج Figma',
  'تصميم عصري متكامل لتطبيقات iOS وAndroid مع تدفق المستخدم ونماذج تفاعلية ونظام تصميم متكامل.',
  'تصميم التطبيق الناجح يبدأ من فهم المستخدم وتبسيط رحلته داخل التطبيق.

أصمم لك واجهات تجمع بين الجمالية البصرية الفائقة وسهولة الاستخدام التي ترفع معدل الاحتفاظ بالمستخدمين.',
  1800,
  'SAR',
  10,
  3,
  '/services/uiux.jpg',
  '["UI/UX","Figma","تصميم تطبيقات","تجربة مستخدم"]'::jsonb,
  '[{"title":"تصميم شاشات التطبيق الكاملة في Figma","desc":"شاشات عصرية ومتناسقة مع أحدث إرشادات Apple iOS وGoogle Material 3"},{"title":"نظام تصميم متكامل (Design System)","desc":"توحيد الألوان، الخطوط، الأزرار، وحقول الإدخال لتسهيل عمل المطورين"},{"title":"نموذج أولي تفاعلي (Interactive Prototype)","desc":"ربط الشاشات لاختبار تجربة المستخدم الحقيقية قبل كتابة سطر كود واحد"},{"title":"تسليم ملفات Figma المنظمة والجاهزة للمطورين","desc":"ملف منظم بطبقات واضحة وتصدير لكافة الأيقونات والصور"}]'::jsonb,
  'يرجى تزويدنا بـ: 1. فكرة التطبيق والوظائف الرئيسية. 2. الجمهور المستهدف. 3. أي تطبيقات منافسة تعجبك.',
  'هديل القحطاني',
  'مصممة منتجات رقمية أولى',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'uiux'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'كتابة مقالات ومحتوى SEO احترافي باللغة العربية لتصدر نتائج جوجل',
  'محتوى حصري 100% خالي من الذكاء الاصطناعي مع بحث معمق للكلمات المفتاحية التنافسية.',
  'المحتوى هو الملك، والمحتوى الجيد هو الذي يحول الزوار إلى عملاء فعليين.

أكتب لك مقالات شيقة، دقيقة لغوياً وعلمياً، ومصممة خصيصاً لتتصدر الصفحات الأولى في محركات البحث.',
  150,
  'SAR',
  3,
  2,
  '/services/writing.jpg',
  '["كتابة","سيو","SEO","تسويق"]'::jsonb,
  '[{"title":"مقالات حصرية 100% غير منسوخة","desc":"محتوى بشري إبداعي خالي من الترجمة الآلية أو الذكاء الاصطناعي الركيك"},{"title":"بحث الكلمات المفتاحية التنافسية (Keywords)","desc":"تضمين الكلمات المفتاحية بذكاء وكثافة مناسبة دون إخلال بجمال النص"},{"title":"هيكلة وتنسيق متوافق مع SEO (H1, H2, H3)","desc":"عناوين جذابة وتنسيق منظم يسهل قراءته وفهرسته في محركات البحث"},{"title":"ميتا تاج وصفحات الروابط الداخلية","desc":"كتابة Meta Title & Meta Description واقتراح الروابط الداخلية"}]'::jsonb,
  'يرجى إرسال: 1. الموضوع المطلوب أو الكلمات المفتاحية. 2. الجمهور المستهدف ونبرة الخطاب المطلوبة. 3. عدد الكلمات المستهدف.',
  'نورة السبيعي',
  'كاتبة محتوى وسيو معتمدة',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'writing'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'إدارة وتوجيه حملات إعلانية ممولة على Google Ads وMeta Ads باحتراف',
  'بناء خطة استهداف دقيقة وتحسين مستمر للحملات مع تقارير أداء دورية لتعظيم العائد المالي ROI.',
  'الإعلانات الممولة ليست مجرد إنفاق، بل هي استثمار مدروس.

نساعدك على الوصول للعملاء الحقيقيين وزيادة المبيعات بأقل تكلفة ممكنة من خلال إدارة احترافية واختبارات A/B مستمرة.',
  1200,
  'SAR',
  30,
  5,
  '/services/marketing.jpg',
  '["تسويق","إعلانات","Google Ads","سوشال ميديا"]'::jsonb,
  '[{"title":"إعداد حسابات الإعلانات وربط بيكسل التتبع","desc":"تركيب Meta Pixel وGoogle Tag Manager لتتبع المبيعات والتحويلات بدقة"},{"title":"إنشاء الإعلانات وصياغة النصوص الجذابة (Ad Copy)","desc":"كتابة نصوص إعلانية محفزة للنقر واختيار الصور والفيديوهات الأنسب"},{"title":"استهداف جماهير مخصصة ومماثلة (Lookalike)","desc":"تحديد الفئات الأكثر اهتماماً وشرائية لخفض تكلفة الاكتساب CPA"},{"title":"تقارير أداء أسبوعية مع توصيات التحسين","desc":"لوحة قياس واضحة توضح أداء كل ريال تم إنفاقه"}]'::jsonb,
  'يرجى تزويدنا بـ: 1. رابط الموقع أو المتجر. 2. الميزانية الإعلانية المقترحة. 3. المناطق والمدن المستهدفة.',
  'خالد الدوسري',
  'خبير نمو وتسويق رقمي',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'marketing'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'استشارة تدريبية متخصصة لتأهيل المنشآت لمعايير واعتماد NELC',
  'إعداد ملف الاعتماد الكامل للمركز الوطني للتعليم الإلكتروني مع خارطة طريق وقوالب امتثال جاهزة.',
  'الحصول على ترخيص المركز الوطني للتعليم الإلكتروني هو الخطوة الأساسية لضمان قانونية ومصداقية برامجك التدريبية.

أقدم لك خلاصة خبرتي الطويلة في تأهيل عشرات الجهات الحكومية والخاصة للحصول على التراخيص والاعتمادات الرسمية بسلاسة وسرعة.',
  950,
  'SAR',
  7,
  2,
  '/services/consulting.jpg',
  '["استشارات","NELC","اعتماد","تدريب"]'::jsonb,
  '[{"title":"مراجعة وتقييم الوضع الراهن للمنشأة","desc":"فحص جاهزية المنصة والبرامج التدريبية وفق معايير المركز الوطني NELC"},{"title":"إعداد الأدلة واللوائح والسياسات المطلوبة","desc":"تجهيز دليل الحوكمة، سياسة الخصوصية، والنزاهة الأكاديمية بنماذج مطابقة"},{"title":"خارطة طريق الامتثال حتى صدور الترخيص","desc":"متابعة الخطوات الفنية والإدارية خطوة بخطوة لتفادي أي ملاحظات"},{"title":"جلسة تدريبية وتأهيلية لفريق العمل","desc":"تدريب فريقك على إدارة المحتوى ومتطلبات الفحص والتحقق"}]'::jsonb,
  'يرجى تقديم: 1. نوع المنشأة والبرامج المراد ترخيصها. 2. النظام التعليمي LMS المستخدم حالياً إن وجد.',
  'د. عبدالله الشمري',
  'مستشار جودة وتعليم إلكتروني',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'consulting'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'مونتاج فيديو إعلاني وترويجي احترافي لمنصات التواصل الاجتماعي',
  'مونتاج سينمائي بدقة 4K مع تصحيح ألوان ومؤثرات بصرية وموسيقى مرخصة ومؤثرات صوتية جذابة.',
  'الفيديو هو أكثر وسيلة محتوى انتشاراً وتأثيراً في المبيعات اليوم.

أصنع لك فيديوهات إعلانية مبهرة ومناسبة لتيك توك، ريلز، وسناب شات مع مراعاة المقاسات والأبعاد المختلفة.',
  450,
  'SAR',
  4,
  3,
  '/services/video.jpg',
  '["مونتاج","فيديو","ريلز","موشن"]'::jsonb,
  '[{"title":"مونتاج فيديو احترافي بجودة 4K UHD","desc":"قص ومزامنة اللقطات بإيقاع مشوق يجذب المشاهد من أول 3 ثوانٍ"},{"title":"تصحيح وتلوين سينمائي (Color Grading)","desc":"إبراز جماليات المشاهد وإضفاء طابع بصري فخم على الفيديو"},{"title":"تصميم الصوت والمؤثرات الصوتية (SFX)","desc":"إضافة مؤثرات صوتية وموسيقى خلفية مرخصة تجارياً"},{"title":"نصوص متحركة وجذابة (Dynamic Captions)","desc":"إضافة نصوص عربية متحركة وأنيقة تزيد من التفاعل"}]'::jsonb,
  'يرجى تزويدنا بـ: 1. اللقطات المصورة أو المواد الخام. 2. النصوص أو السكريبت المطلوب. 3. المقاس المفضل (طولي 9:16 أو عرضي 16:9).',
  'عمر الخالدي',
  'مخرج ومونتير فيديو أول',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'media'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'بناء لوحات تحكم مالية وإحصائية متقدمة ببرنامج Excel & Power BI',
  'أتمتة الجداول الحسابية، تقارير تفاعلية، ولوحات مؤشرات أداء KPI دقيقة تدعم اتخاذ القرار.',
  'البيانات المنظمة هي بوصلة أي منشأة ناجحة.

أحول بياناتك وجداولك المتناثرة إلى لوحات قياس بصرية تفاعلية تمكنك من متابعة المبيعات، المصاريف، والأرباح في لمحة سريعة.',
  350,
  'SAR',
  3,
  2,
  '/services/data.jpg',
  '["بيانات","Excel","Power BI","تحليل مالي"]'::jsonb,
  '[{"title":"لوحة تحكم تفاعلية (Interactive Dashboard)","desc":"رسوم بيانية ومؤشرات أداء تتحدث تلقائياً بمجرد إدخال البيانات الجديدة"},{"title":"معادلات متقدمة وأتمتة (VBA / Power Query)","desc":"توفير ساعات العمل اليدوية عبر معادلات آلية تنظف وتلخص البيانات"},{"title":"نماذج وتوقعات مالية (Financial Models)","desc":"قوائم الدخل، التدفقات النقدية، وتحليل نقطة التعادل بدقة"},{"title":"دليل استخدام وتدريب بالفيديو","desc":"شرح مبسط لكيفية إدخال البيانات واستخراج التقارير"}]'::jsonb,
  'يرجى إرسال: 1. ملف الإكسل أو عينة البيانات الحالية. 2. المؤشرات والنتائج الأهم التي ترغب بمتابعتها.',
  'ريم الجهني',
  'محللة بيانات ونظم مالية',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'data-entry'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تصميم عروض تقديمية تفاعلية واحترافية للشركات والاجتماعات (Pitch Deck)',
  'عروض بوربوينت وKeynote مذهلة تجذب المستثمرين والعملاء مع انفوجرافيك وتنسيق متقن.',
  'العرض التقديمي هو بطاقة تعارف مشروعك مع المستثمرين والعملاء. أصمم لك عرضاً جذاباً يوصل رسالتك بأعلى درجات الوضوح والاحترافية.',
  300,
  'SAR',
  3,
  3,
  '/services/branding.jpg',
  '["عروض","PowerPoint","Pitch Deck","تصميم"]'::jsonb,
  '[{"title":"تصميم الشرائح الأساسية بتنسيق عصري","desc":"تصميم شرائح تفاعلية تعكس قوة الفكرة وتجذب انتباه المستثمرين"},{"title":"رسوم بيانية وإنفوجرافيك مخصص","desc":"تحويل الأرقام والإحصائيات إلى مخططات بصرية واضحة ومقنعة"},{"title":"ملفات PowerPoint وPDF مفتوحة وقابلة للتعديل","desc":"إمكانية تعديل النصوص والصور في أي وقت وبكل سهولة"}]'::jsonb,
  'يرجى تقديم محتوى العرض التقديمي أو النقاط الأساسية والشعار إن وجد.',
  'سارة الغامدي',
  'استشارية براندينج وهوية',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'design'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تأسيس وتهيئة متجر إلكتروني متكامل على منصة سلة أو زد (Salla / Zid)',
  'ضبط الهوية، بوابات الدفع، خيارات الشحن، إضافة المنتجات، والربط مع أدوات التحليل والتتبع.',
  'ضبط الهوية، بوابات الدفع، خيارات الشحن، إضافة المنتجات، والربط مع أدوات التحليل والتتبع.',
  850,
  'SAR',
  6,
  2,
  '/services/development.jpg',
  '["سلة","زد","متجر إلكتروني","تجارة"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'م. أحمد العمري',
  'مطور Full-Stack أول',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'إعادة تصميم وتحسين تجربة المستخدم لموقعك أو تطبيقك القائم UI Audit',
  'تحليل نقاط التعثر، تحسين مسارات التحويل، وتقديم مقترحات واجهات جديدة عالية الفاعلية.',
  'تحليل نقاط التعثر، تحسين مسارات التحويل، وتقديم مقترحات واجهات جديدة عالية الفاعلية.',
  900,
  'SAR',
  5,
  2,
  '/services/uiux.jpg',
  '["UI/UX","Audit","تحسين","Figma"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'هديل القحطاني',
  'مصممة منتجات رقمية أولى',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'uiux'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'كتابة الملف التعريفي للشركة (Company Profile) بصياغة تسويقية راقية',
  'صياغة الرؤية، الرسالة، الأهداف، والخدمات بلغة احترافية تعزز ثقة الشركاء والعملاء.',
  'صياغة الرؤية، الرسالة، الأهداف، والخدمات بلغة احترافية تعزز ثقة الشركاء والعملاء.',
  400,
  'SAR',
  4,
  2,
  '/services/writing.jpg',
  '["بروفايل شركة","كتابة","تسويق","محتوى"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'نورة السبيعي',
  'كاتبة محتوى وسيو معتمدة',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'writing'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تصميم إعلانات وبوسترات السوشيال ميديا التسويقية باحترافية عالية',
  'باقة تصاميم مبتكرة لحسابات تويتر، انستغرام، ولينكد إن ترفع التفاعل وتبرز علامتك التجارية.',
  'باقة تصاميم مبتكرة لحسابات تويتر، انستغرام، ولينكد إن ترفع التفاعل وتبرز علامتك التجارية.',
  350,
  'SAR',
  3,
  3,
  '/services/branding.jpg',
  '["تصميم","سوشال ميديا","إعلانات","انستغرام"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'سارة الغامدي',
  'استشارية براندينج وهوية',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'design'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'فيديو موشن جرافيك توضيحي للمشاريع والخدمات مع تعليق صوتي فصيح',
  'سيناريو مبتكر، رسومات خاصة، وتحريك احترافي مع تعليق صوتي باللغة العربية الفصحى بجودة استوديو.',
  'سيناريو مبتكر، رسومات خاصة، وتحريك احترافي مع تعليق صوتي باللغة العربية الفصحى بجودة استوديو.',
  1100,
  'SAR',
  7,
  3,
  '/services/video.jpg',
  '["موشن جرافيك","فيديو","تعليق صوتي","تسويق"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'عمر الخالدي',
  'مخرج ومونتير فيديو أول',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'media'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'إعداد دراسة جدوى مبسطة وخطة عمل تنفيذية للمشاريع الناشئة',
  'تحليل السوق، التكاليف التشغيلية، التوقعات المالية، وخطة الانطلاق للسوق السعودي.',
  'تحليل السوق، التكاليف التشغيلية، التوقعات المالية، وخطة الانطلاق للسوق السعودي.',
  1500,
  'SAR',
  8,
  2,
  '/services/consulting.jpg',
  '["دراسة جدوى","خطة عمل","استشارات","مشاريع"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'د. عبدالله الشمري',
  'مستشار جودة وتعليم إلكتروني',
  'active',
  5.0,
  0,
  0,
  TRUE,
  id
FROM public.service_categories
WHERE slug = 'consulting'
ON CONFLICT DO NOTHING;

INSERT INTO public.services (
  title, description, long_description, price, currency, delivery_days, revision_count,
  thumbnail_url, tags, deliverables, requirements, provider_name, provider_role,
  status, rating_avg, rating_count, orders_count, is_featured, category_id
)
SELECT
  'تنظيف وتنسيق قواعد البيانات واستخراج التقارير الإحصائية المتقدمة',
  'معالجة البيانات الضخمة، إزالة التكرار، وربط الجداول لتوليد تقارير إحصائية دقيقة وموجزة.',
  'معالجة البيانات الضخمة، إزالة التكرار، وربط الجداول لتوليد تقارير إحصائية دقيقة وموجزة.',
  250,
  'SAR',
  2,
  2,
  '/services/data.jpg',
  '["قواعد بيانات","إكسل","تنظيم","تقارير"]'::jsonb,
  '[{"title":"تسليم العمل كاملاً وفق المواصفات","desc":"تنفيذ احترافي ومطابق للمعايير"},{"title":"دعم وتعديلات مجانية","desc":"مراجعات لضمان الرضا الكامل"}]'::jsonb,
  'تزويدنا بتفاصيل العمل المطلوب',
  'ريم الجهني',
  'محللة بيانات ونظم مالية',
  'active',
  5.0,
  0,
  0,
  FALSE,
  id
FROM public.service_categories
WHERE slug = 'data-entry'
ON CONFLICT DO NOTHING;
