'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CardImage } from '@/components/ui/CardImage';
import {
  Star,
  Clock,
  ShoppingCart,
  Sparkles,
  Users,
  Package,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Zap,
  Award,
  Store,
  ChevronLeft,
  ArrowLeft,
  Tag,
  Share2,
  Heart,
  Check,
  FileCheck,
  Layers,
  HelpCircle,
  FileText,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

/* ── 16 Services Comprehensive Database ─────────────────── */
const allServicesMap: Record<string, any> = {
  'demo-1': {
    id: 'demo-1',
    title: 'تصميم هوية بصرية متكاملة واحترافية لمنشأتك متوافقة مع رؤية 2030',
    category_name: 'تصميم وهويات بصرية',
    category_slug: 'design',
    image_url: '/services/branding.jpg',
    description: 'أقدم لك تصميم هوية بصرية احترافية شاملة ومبتكرة لمنشأتك أو مشروعك الناشئ بما يتوافق مع معايير الهوية السعودية ورؤية 2030، بدءاً من الشعار وحتى الدليل الكامل.',
    deliverables: [
      { title: 'تصميم الشعار الأساسي والفرعي', desc: 'شعار أصلي 100% بنماذج متعددة وصيغ فيكتور قابلة للتكبير (AI, EPS, SVG, PNG)' },
      { title: 'دليل الهوية البصرية الشامل (Brand Guidelines)', desc: 'كتيب PDF يحتوي على الألوان المعتمدة (HEX, RGB, CMYK, Pantone) والخطوط الرسمية وقواعد الاستخدام' },
      { title: 'حزمة المطبوعات الرسمية (Stationery)', desc: 'تصميم بطاقات الأعمال (Business Cards)، ورق المراسلات الرسمي (Letterhead)، والأظرف' },
      { title: 'قوالب وسائل التواصل الاجتماعي', desc: 'تصاميم لمنشورات انستغرام وتويتر/X وملفات الغلاف الاحترافية' },
      { title: 'تسليم الملفات المصدرية المفتوحة', desc: 'كامل الملفات المفتوحة القابلة للتعديل والطباعة الفورية بجودة فائقة' },
    ],
    detailed_text: `تصميم الهوية البصرية ليس مجرد رسم شعار، بل هو بناء الصورة الذهنية والانطباع الأول لعملائك ومستثمريك.

أعمل معك خطوة بخطوة لدراسة نشاطك التجاري والمنافسين في السوق السعودي، ثم نبتكر هوية فريدة تعكس قيمك وتجذب فئتك المستهدفة بدقة عالية.

ما الذي يميز هذه الخدمة؟
• الابتكار والأصالة: أفكار مبتكرة وغير مقلدة من قوالب جاهزة.
• التوافق التام: ملائمة للتطبيقات الرقمية والطباعية بجميع المقاسات.
• سرعة الاستجابة والمرونة: مراجعات دورية لضمان رضاك التام بنسبة 100%.`,
    price: 750,
    currency: 'SAR',
    delivery_days: 5,
    revision_count: 3,
    orders_count: 0,
    rating_avg: 4.9,
    rating_count: 0,
    is_featured: true,
    requirements: 'يرجى تزويدنا بـ: 1. اسم المنشأة باللغتين العربية والإنجليزية. 2. نبذة مختصرة عن نشاطك والجمهور المستهدف. 3. الألوان المفضلة أو أي أمثلة ملهمة ترغب بالاسترشاد بها.',
    provider: {
      name: 'سارة الغامدي',
      role: 'استشارية براندينج وتصميم هوية',
      rating: 4.9,
      completed_orders: 312,
      response_time: 'خلال ساعة',
      member_since: '2023',
      bio: 'مصممة هويات بصرية معتمدة بخبرة أكثر من 8 سنوات في السوق السعودي والخليجي، نفذت هويات لأكثر من 200 شركة وجهة حكومية وخاصة.',
    },
  },
  'demo-2': {
    id: 'demo-2',
    title: 'برمجة وتطوير موقع إلكتروني فائق السرعة بـ Next.js وTailwind CSS',
    category_name: 'برمجة وتطوير ويب',
    category_slug: 'development',
    image_url: '/services/development.jpg',
    description: 'برمجة وتطوير موقع إلكتروني فائق السرعة والأداء باستخدام Next.js 15 وTailwind CSS، متوافق مع كافة الشاشات ومحركات البحث SEO.',
    deliverables: [
      { title: 'واجهة أمامية فائقة السرعة والتجاوب', desc: 'موقع إلكتروني مبني بأحدث تقنيات React & Next.js 15 بتصميم عصري وأداء 100% على Google PageSpeed' },
      { title: 'لوحة تحكم ديناميكية وسهلة الاستخدام', desc: 'إمكانية تعديل المحتوى والنصوص والصور بسهولة تامة وبدون كتابة كود' },
      { title: 'تهيأة محركات البحث المتقدمة (SEO)', desc: 'بنية معمارية محسنة لمحركات البحث مع OpenGraph وSchema Markup' },
      { title: 'ربط النماذج وقواعد البيانات', desc: 'ربط نماذج الاتصال والدفع وبوابات مثل Supabase أو Stripe/Mada' },
      { title: 'نشر الموقع واستضافة مجانية', desc: 'رفع الموقع على خوادم سحابية عالمية (Vercel) وربط النطاق الخاص بك' },
    ],
    detailed_text: `احصل على موقع ويب احترافي ينافس كبرى الشركات في المظهر والأداء وسرعة التحميل.

نستخدم أحدث المعايير البرمجية لضمان موقع خالي من الأخطاء، آمن، ومبني ليتوسع مع نمو أعمالك ومبيعاتك.`,
    price: 2500,
    currency: 'SAR',
    delivery_days: 14,
    revision_count: 2,
    orders_count: 0,
    rating_avg: 5.0,
    rating_count: 0,
    is_featured: true,
    requirements: 'يرجى توفير: 1. تفاصيل الصفحات المطلوبة ومحتواها. 2. الشعار والألوان المعتمدة. 3. أي روابط لمواقع تود محاكاة أسلوبها.',
    provider: {
      name: 'م. أحمد العمري',
      role: 'مطور Full-Stack أول وخبير Next.js',
      rating: 5.0,
      completed_orders: 145,
      response_time: 'خلال 30 دقيقة',
      member_since: '2022',
      bio: 'مطور ويب معتمد متخصص في بناء الأنظمة السحابية والمنصات التفاعلية باستخدام Next.js, Node.js وTypeScript.',
    },
  },
  'demo-3': {
    id: 'demo-3',
    title: 'تصميم واجهات وتجربة المستخدم UI/UX لتطبيقات الجوال ببرنامج Figma',
    category_name: 'تصميم واجهات UI/UX',
    category_slug: 'uiux',
    image_url: '/services/uiux.jpg',
    description: 'تصميم عصري متكامل لتطبيقات iOS وAndroid مع تدفق المستخدم ونماذج تفاعلية ونظام تصميم متكامل.',
    deliverables: [
      { title: 'تصميم شاشات التطبيق الكاملة في Figma', desc: 'شاشات عصرية ومتناسقة مع أحدث إرشادات Apple iOS وGoogle Material 3' },
      { title: 'نظام تصميم متكامل (Design System)', desc: 'توحيد الألوان، الخطوط، الأزرار، وحقول الإدخال لتسهيل عمل المطورين' },
      { title: 'نموذج أولي تفاعلي (Interactive Prototype)', desc: 'ربط الشاشات لاختبار تجربة المستخدم الحقيقية قبل كتابة سطر كود واحد' },
      { title: 'تسليم ملفات Figma المنظمة والجاهزة للمطورين', desc: 'ملف منظم بطبقات واضحة وتصدير لكافة الأيقونات والصور' },
    ],
    detailed_text: `تصميم التطبيق الناجح يبدأ من فهم المستخدم وتبسيط رحلته داخل التطبيق.

أصمم لك واجهات تجمع بين الجمالية البصرية الفائقة وسهولة الاستخدام التي ترفع معدل الاحتفاظ بالمستخدمين.`,
    price: 1800,
    currency: 'SAR',
    delivery_days: 10,
    revision_count: 3,
    orders_count: 0,
    rating_avg: 4.9,
    rating_count: 0,
    is_featured: true,
    requirements: 'يرجى تزويدنا بـ: 1. فكرة التطبيق والوظائف الرئيسية. 2. الجمهور المستهدف. 3. أي تطبيقات منافسة تعجبك.',
    provider: {
      name: 'هديل القحطاني',
      role: 'مصممة منتجات رقمية أولى',
      rating: 4.9,
      completed_orders: 190,
      response_time: 'خلال 45 دقيقة',
      member_since: '2023',
      bio: 'مصممة تجربة وواجهات مستخدم بخبرة 6 سنوات في تصميم التطبيقات للشركات الناشئة في المملكة والخليج.',
    },
  },
  'demo-4': {
    id: 'demo-4',
    title: 'كتابة مقالات ومحتوى SEO احترافي باللغة العربية لتصدر نتائج جوجل',
    category_name: 'كتابة محتوى وسيو',
    category_slug: 'writing',
    image_url: '/services/writing.jpg',
    description: 'كتابة محتوى تسويقي ومقالات متخصصة باللغة العربية الفصحى متوافقة 100% مع معايير السيو لتصدر نتائج بحث جوجل وزيادة الزيارات المجانية.',
    deliverables: [
      { title: 'مقالات حصرية 100% غير منسوخة', desc: 'محتوى بشري إبداعي خالي من الترجمة الآلية أو الذكاء الاصطناعي الركيك' },
      { title: 'بحث الكلمات المفتاحية التنافسية (Keywords)', desc: 'تضمين الكلمات المفتاحية بذكاء وكثافة مناسبة دون إخلال بجمال النص' },
      { title: 'هيكلة وتنسيق متوافق مع SEO (H1, H2, H3)', desc: 'عناوين جذابة وتنسيق منظم يسهل قراءته وفهرسته في محركات البحث' },
      { title: 'ميتا تاج وصفحات الروابط الداخلية', desc: 'كتابة Meta Title & Meta Description واقتراح الروابط الداخلية' },
    ],
    detailed_text: `المحتوى هو الملك، والمحتوى الجيد هو الذي يحول الزوار إلى عملاء فعليين.

أكتب لك مقالات شيقة، دقيقة لغوياً وعلمياً، ومصممة خصيصاً لتتصدر الصفحات الأولى في محركات البحث.`,
    price: 150,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 2,
    orders_count: 0,
    rating_avg: 4.8,
    rating_count: 0,
    is_featured: false,
    requirements: 'يرجى إرسال: 1. الموضوع المطلوب أو الكلمات المفتاحية. 2. الجمهور المستهدف ونبرة الخطاب المطلوبة. 3. عدد الكلمات المستهدف.',
    provider: {
      name: 'نورة السبيعي',
      role: 'كاتبة محتوى ومختصة سيو معتمدة',
      rating: 4.8,
      completed_orders: 480,
      response_time: 'خلال ساعتين',
      member_since: '2023',
      bio: 'كاتبة محتوى متخصصة في مقالات السيو وتطوير محتوى المنصات والمتاجر الإلكترونية مع أكثر من 500 مقال منشور.',
    },
  },
  'demo-5': {
    id: 'demo-5',
    title: 'إدارة وتوجيه حملات إعلانية ممولة على Google Ads وMeta Ads باحتراف',
    category_name: 'تسويق وإعلانات ممولة',
    category_slug: 'marketing',
    image_url: '/services/marketing.jpg',
    description: 'بناء خطة استهداف دقيقة وتحسين مستمر للحملات مع تقارير أداء دورية لتعظيم العائد المالي ROI.',
    deliverables: [
      { title: 'إعداد حسابات الإعلانات وربط بيكسل التتبع', desc: 'تركيب Meta Pixel وGoogle Tag Manager لتتبع المبيعات والتحويلات بدقة' },
      { title: 'إنشاء الإعلانات وصياغة النصوص الجذابة (Ad Copy)', desc: 'كتابة نصوص إعلانية محفزة للنقر واختيار الصور والفيديوهات الأنسب' },
      { title: 'استهداف جماهير مخصصة ومماثلة (Lookalike)', desc: 'تحديد الفئات الأكثر اهتماماً وشرائية لخفض تكلفة الاكتساب CPA' },
      { title: 'تقارير أداء أسبوعية مع توصيات التحسين', desc: 'لوحة قياس واضحة توضح أداء كل ريال تم إنفاقه' },
    ],
    detailed_text: `الإعلانات الممولة ليست مجرد إنفاق، بل هي استثمار مدروس.

نساعدك على الوصول للعملاء الحقيقيين وزيادة المبيعات بأقل تكلفة ممكنة من خلال إدارة احترافية واختبارات A/B مستمرة.`,
    price: 1200,
    currency: 'SAR',
    delivery_days: 30,
    revision_count: 5,
    orders_count: 0,
    rating_avg: 4.7,
    rating_count: 0,
    is_featured: true,
    requirements: 'يرجى تزويدنا بـ: 1. رابط الموقع أو المتجر. 2. الميزانية الإعلانية المقترحة. 3. المناطق والمدن المستهدفة.',
    provider: {
      name: 'خالد الدوسري',
      role: 'خبير نمو وتسويق رقمي',
      rating: 4.7,
      completed_orders: 110,
      response_time: 'خلال ساعة',
      member_since: '2023',
      bio: 'خبير إدارة حملات ممولة معتمد من جوجل وميتا، أدار حملات بميزانيات تجاوزت 3 ملايين ريال في السوق السعودي.',
    },
  },
  'demo-6': {
    id: 'demo-6',
    title: 'استشارة تدريبية متخصصة لتأهيل المنشآت لمعايير واعتماد NELC',
    category_name: 'استشارات واعتماد NELC',
    category_slug: 'consulting',
    image_url: '/services/consulting.jpg',
    description: 'إعداد ملف الاعتماد الكامل للمركز الوطني للتعليم الإلكتروني مع خارطة طريق وقوالب امتثال جاهزة.',
    deliverables: [
      { title: 'مراجعة وتقييم الوضع الراهن للمنشأة', desc: 'فحص جاهزية المنصة والبرامج التدريبية وفق معايير المركز الوطني NELC' },
      { title: 'إعداد الأدلة واللوائح والسياسات المطلوبة', desc: 'تجهيز دليل الحوكمة، سياسة الخصوصية، والنزاهة الأكاديمية بنماذج مطابقة' },
      { title: 'خارطة طريق الامتثال حتى صدور الترخيص', desc: 'متابعة الخطوات الفنية والإدارية خطوة بخطوة لتفادي أي ملاحظات' },
      { title: 'جلسة تدريبية وتأهيلية لفريق العمل', desc: 'تدريب فريقك على إدارة المحتوى ومتطلبات الفحص والتحقق' },
    ],
    detailed_text: `الحصول على ترخيص المركز الوطني للتعليم الإلكتروني هو الخطوة الأساسية لضمان قانونية ومصداقية برامجك التدريبية.

أقدم لك خلاصة خبرتي الطويلة في تأهيل عشرات الجهات الحكومية والخاصة للحصول على التراخيص والاعتمادات الرسمية بسلاسة وسرعة.`,
    price: 950,
    currency: 'SAR',
    delivery_days: 7,
    revision_count: 2,
    orders_count: 0,
    rating_avg: 5.0,
    rating_count: 0,
    is_featured: true,
    requirements: 'يرجى تقديم: 1. نوع المنشأة والبرامج المراد ترخيصها. 2. النظام التعليمي LMS المستخدم حالياً إن وجد.',
    provider: {
      name: 'د. عبدالله الشمري',
      role: 'مستشار جودة وتعليم إلكتروني',
      rating: 5.0,
      completed_orders: 85,
      response_time: 'خلال ساعتين',
      member_since: '2022',
      bio: 'مستشار معتمد في حوكمة التعليم والتدريب الإلكتروني وتأهيل المنصات والمراكز لمعايير الجهات التنظيمية في المملكة.',
    },
  },
  'demo-7': {
    id: 'demo-7',
    title: 'مونتاج فيديو إعلاني وترويجي احترافي لمنصات التواصل الاجتماعي',
    category_name: 'مونتاج وفيديو موشن',
    category_slug: 'media',
    image_url: '/services/video.jpg',
    description: 'مونتاج سينمائي بدقة 4K مع تصحيح ألوان ومؤثرات بصرية وموسيقى مرخصة ومؤثرات صوتية جذابة.',
    deliverables: [
      { title: 'مونتاج فيديو احترافي بجودة 4K UHD', desc: 'قص ومزامنة اللقطات بإيقاع مشوق يجذب المشاهد من أول 3 ثوانٍ' },
      { title: 'تصحيح وتلوين سينمائي (Color Grading)', desc: 'إبراز جماليات المشاهد وإضفاء طابع بصري فخم على الفيديو' },
      { title: 'تصميم الصوت والمؤثرات الصوتية (SFX)', desc: 'إضافة مؤثرات صوتية وموسيقى خلفية مرخصة تجارياً' },
      { title: 'نصوص متحركة وجذابة (Dynamic Captions)', desc: 'إضافة نصوص عربية متحركة وأنيقة تزيد من التفاعل' },
    ],
    detailed_text: `الفيديو هو أكثر وسيلة محتوى انتشاراً وتأثيراً في المبيعات اليوم.

أصنع لك فيديوهات إعلانية مبهرة ومناسبة لتيك توك، ريلز، وسناب شات مع مراعاة المقاسات والأبعاد المختلفة.`,
    price: 450,
    currency: 'SAR',
    delivery_days: 4,
    revision_count: 3,
    orders_count: 0,
    rating_avg: 4.9,
    rating_count: 0,
    is_featured: false,
    requirements: 'يرجى تزويدنا بـ: 1. اللقطات المصورة أو المواد الخام. 2. النصوص أو السكريبت المطلوب. 3. المقاس المفضل (طولي 9:16 أو عرضي 16:9).',
    provider: {
      name: 'عمر الخالدي',
      role: 'مخرج ومونتير فيديو أول',
      rating: 4.9,
      completed_orders: 220,
      response_time: 'خلال 30 دقيقة',
      member_since: '2023',
      bio: 'مونتير ومخرج فيديو محترف بخبرة 7 سنوات في إنتاج الإعلانات التجارية والمحتوى الإبداعي لمنصات التواصل.',
    },
  },
  'demo-8': {
    id: 'demo-8',
    title: 'بناء لوحات تحكم مالية وإحصائية متقدمة ببرنامج Excel & Power BI',
    category_name: 'تحليل بيانات وإكسل',
    category_slug: 'data-entry',
    image_url: '/services/data.jpg',
    description: 'أتمتة الجداول الحسابية، تقارير تفاعلية، ولوحات مؤشرات أداء KPI دقيقة تدعم اتخاذ القرار.',
    deliverables: [
      { title: 'لوحة تحكم تفاعلية (Interactive Dashboard)', desc: 'رسوم بيانية ومؤشرات أداء تتحدث تلقائياً بمجرد إدخال البيانات الجديدة' },
      { title: 'معادلات متقدمة وأتمتة (VBA / Power Query)', desc: 'توفير ساعات العمل اليدوية عبر معادلات آلية تنظف وتلخص البيانات' },
      { title: 'نماذج وتوقعات مالية (Financial Models)', desc: 'قوائم الدخل، التدفقات النقدية، وتحليل نقطة التعادل بدقة' },
      { title: 'دليل استخدام وتدريب بالفيديو', desc: 'شرح مبسط لكيفية إدخال البيانات واستخراج التقارير' },
    ],
    detailed_text: `البيانات المنظمة هي بوصلة أي منشأة ناجحة.

أحول بياناتك وجداولك المتناثرة إلى لوحات قياس بصرية تفاعلية تمكنك من متابعة المبيعات، المصاريف، والأرباح في لمحة سريعة.`,
    price: 350,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 2,
    orders_count: 0,
    rating_avg: 4.8,
    rating_count: 0,
    is_featured: false,
    requirements: 'يرجى إرسال: 1. ملف الإكسل أو عينة البيانات الحالية. 2. المؤشرات والنتائج الأهم التي ترغب بمتابعتها.',
    provider: {
      name: 'ريم الجهني',
      role: 'محللة بيانات ونظم مالية',
      rating: 4.8,
      completed_orders: 290,
      response_time: 'خلال ساعة',
      member_since: '2023',
      bio: 'أخصائية تحليل بيانات ونمذجة مالية معتمدة من مايكروسوفت، ساعدت أكثر من 150 منشأة في تنظيم مؤشراتها المالية.',
    },
  },
  'demo-9': {
    id: 'demo-9',
    title: 'تصميم عروض تقديمية تفاعلية واحترافية للشركات والاجتماعات (Pitch Deck)',
    category_name: 'تصميم وهويات بصرية',
    category_slug: 'design',
    image_url: '/services/branding.jpg',
    description: 'عروض بوربوينت وKeynote مذهلة تجذب المستثمرين والعملاء مع انفوجرافيك وتنسيق متقن.',
    deliverables: [
      { title: 'تصميم الشرائح الأساسية بتنسيق عصري', desc: 'تصميم شرائح تفاعلية تعكس قوة الفكرة وتجذب انتباه المستثمرين' },
      { title: 'رسوم بيانية وإنفوجرافيك مخصص', desc: 'تحويل الأرقام والإحصائيات إلى مخططات بصرية واضحة ومقنعة' },
      { title: 'ملفات PowerPoint وPDF مفتوحة وقابلة للتعديل', desc: 'إمكانية تعديل النصوص والصور في أي وقت وبكل سهولة' },
    ],
    detailed_text: `العرض التقديمي هو بطاقة تعارف مشروعك مع المستثمرين والعملاء. أصمم لك عرضاً جذاباً يوصل رسالتك بأعلى درجات الوضوح والاحترافية.`,
    price: 300,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 3,
    orders_count: 0,
    rating_avg: 4.9,
    rating_count: 0,
    is_featured: false,
    requirements: 'يرجى تقديم محتوى العرض التقديمي أو النقاط الأساسية والشعار إن وجد.',
    provider: {
      name: 'سارة الغامدي',
      role: 'استشارية براندينج وتصميم هوية',
      rating: 4.9,
      completed_orders: 312,
      response_time: 'خلال ساعة',
      member_since: '2023',
      bio: 'مصممة عروض تقديمية وهويات بصرية معتمدة بخبرة واسعة في تجهيز عروض الشركات الناشئة وجولات التمويل.',
    },
  },
};

const defaultReviews = [
  { id: '1', reviewer: 'عبدالرحمن المالكي', rating: 5, comment: 'عمل احترافي من الطراز الأول! التنفيذ كان أسرع من المتوقع والدقة متناهية. كل التوفيق.', date: 'منذ 3 أيام', avatar: 'ع' },
  { id: '2', reviewer: 'منيرة الشهري', rating: 5, comment: 'تعامل راقي جداً واستجابة سريعة للتعديلات. النتيجة النهائية مذهلة وأعطت لمشروعي قيمة كبيرة.', date: 'منذ أسبوع', avatar: 'م' },
  { id: '3', reviewer: 'فهد العتيبي', rating: 5, comment: 'جودة استثنائية والتزام بالموعد. أنصح بشدة بالتعامل وبإذن الله لن يكون التعاون الأخير.', date: 'منذ أسبوعين', avatar: 'ف' },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = (params?.serviceId as string) || 'demo-1';

  const [service, setService] = useState<any>(allServicesMap[serviceId] || allServicesMap['demo-1']);
  const [reviews] = useState(defaultReviews);
  const [activeTab, setActiveTab] = useState<'deliverables' | 'details' | 'process' | 'provider'>('deliverables');

  // Order modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderNumber, setGeneratedOrderNumber] = useState('');

  // Wishlist & share states
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        if (allServicesMap[serviceId]) {
          setService(allServicesMap[serviceId]);
          return;
        }

        const supabase = createClient();
        const { data: svc } = await supabase
          .from('services')
          .select('*, service_categories(name, slug)')
          .eq('id', serviceId)
          .maybeSingle();

        if (svc) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, bio')
            .eq('id', svc.provider_id)
            .maybeSingle();

          setService({
            ...svc,
            image_url: svc.thumbnail_url || '/services/branding.jpg',
            category_name: svc.service_categories?.name || 'خدمات عامة',
            category_slug: svc.service_categories?.slug || 'design',
            tags: Array.isArray(svc.tags) ? svc.tags : ['خدمة معتمدة'],
            deliverables: svc.deliverables || allServicesMap['demo-1'].deliverables,
            detailed_text: svc.long_description || svc.description,
            provider: {
              name: profile?.full_name || 'مقدم خدمة معتمد',
              role: profile?.bio || 'خبير معتمد في المنصة',
              rating: svc.rating_avg || 5.0,
              completed_orders: svc.orders_count || 0,
              response_time: 'خلال ساعة',
              member_since: '2024',
              bio: profile?.bio || 'مقدم خدمة معتمد وموثق في منصة النبض المستدام.',
            },
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadService();
  }, [serviceId]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleOrderSubmit = async () => {
    try {
      setOrdering(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth/login?redirect=/marketplace/${serviceId}`);
        return;
      }

      const uniqueOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: createdOrder, error } = await supabase.from('service_orders').insert({
        order_number: uniqueOrderNumber,
        service_id: service.id,
        buyer_id: user.id,
        provider_id: service.provider_id || user.id,
        price: service.price,
        currency: service.currency || 'SAR',
        status: 'pending',
        requirements_text: orderRequirements,
        delivery_date: new Date(Date.now() + (service.delivery_days || 3) * 24 * 60 * 60 * 1000).toISOString(),
      }).select('order_number').single();

      if (error) {
        throw error;
      }

      setGeneratedOrderNumber(createdOrder.order_number);
      setOrderSuccess(true);
    } catch (err) {
      console.error(err);
      alert('تعذر إنشاء الطلب. حاول مرة أخرى.');
    } finally {
      setOrdering(false);
    }
  };

  const originalPrice = Math.round(service.price * 1.3);
  const installmentPrice = Math.round(service.price / 4);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-cairo)] text-slate-900 selection:bg-[#5CB07C] selection:text-white" dir="rtl">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP BREADCRUMB STRIP (Clear of Fixed Navbar: pt-28 sm:pt-36)   */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="pt-28 sm:pt-36 pb-4 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500">
              <Link href="/" className="hover:text-[#173A7C] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/marketplace" className="hover:text-[#173A7C] transition-colors">
                متجر الخدمات
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#173A7C] font-black">{service.category_name}</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-slate-400 truncate max-w-[280px] hidden sm:inline">{service.title}</span>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="مشاركة رابط الخدمة"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isCopied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                }`}
                title="حفظ في المفضلة"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN CONTENT CONTAINER                                         */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        
        {/* ── TOP SECTION: 8 Cols Media + 4 Cols Purchase Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Right Column (8 Cols): Title & Photo Showcase */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Title Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] rounded-b-full" />
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>خدمة موثوقة ومعتمدة</span>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  {service.category_name}
                </span>
                {service.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#173A7C]/[0.08] text-[#173A7C] border border-[#173A7C]/20 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>خدمة مميزة</span>
                  </span>
                )}
              </div>

              {/* Service Title */}
              <h1 className="card-title-royal-blue text-2xl sm:text-3xl leading-snug tracking-tight">
                {service.title}
              </h1>

              {/* Provider Row Summary */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {service.provider?.name?.charAt(0) || 'م'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">{service.provider?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">مقدم خدمة معتمد</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                    {service.rating_count > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <strong className="text-slate-800 font-bold">{service.rating_avg}</strong>
                        <span>({service.rating_count} تقييم)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                        <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        <span>خدمة جديدة ومتاحة</span>
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.orders_count > 0 ? `${service.orders_count} طلب مكتمل` : 'جاهزة للتنفيذ الفوري'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Photo Banner Card */}
            <div className="rounded-[2rem] border border-slate-200/90 shadow-[0_12px_40px_rgba(23,58,124,0.08)] overflow-hidden bg-white">
              <div className="w-full relative overflow-hidden bg-slate-100">
                <CardImage
                  src={service.image_url || '/services/branding.jpg'}
                  alt={service.title}
                  preload
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 right-4 z-10 text-white">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                    {service.category_name}
                  </span>
                </div>
              </div>

              {/* Mini Features Strip under Photo */}
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 bg-slate-50/80 border-t border-slate-200/80 p-3.5 sm:p-4 text-center">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-bold block">تسليم سريع خلال</span>
                  <span className="text-sm font-black text-[#173A7C]">{service.delivery_days} أيام عمل</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-bold block">مراجعات مجانية</span>
                  <span className="text-sm font-black text-emerald-600">{service.revision_count} تعديلات</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-bold block">الملفات المسلمة</span>
                  <span className="text-sm font-black text-slate-800">مفتوحة المصدر</span>
                </div>
              </div>
            </div>

          </div>

          {/* Left Column (4 Cols): Unified Single Card (Purchase, Trust & Navigation) */}
          <aside className="lg:col-span-4 h-full">
            <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_12px_40px_rgba(23,58,124,0.08)] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between space-y-5 h-full">
              <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] rounded-b-full" />

              {/* 1. Price Block */}
              <div className="pt-2 pb-4 border-b border-slate-100 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">سعر الخدمة</span>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#173A7C] font-mono">
                      {service.price}
                    </span>
                    <span className="text-sm font-black text-emerald-600">ر.س</span>
                  </div>
                  {originalPrice > service.price && (
                    <span className="text-xs text-slate-400 line-through font-bold">
                      {originalPrice} ر.س
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">شامل ضريبة القيمة المضافة ورسوم المنصة</p>
              </div>

              {/* 2. Tabby & Tamara Installment */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-700">
                <span>أو 4 دفعات بقيمة <strong className="text-emerald-700 font-bold">{installmentPrice} ر.س</strong></span>
                <div className="flex items-center gap-1 font-black text-[9px]">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded">tabby</span>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">tamara</span>
                </div>
              </div>

              {/* 3. Package Specs Matrix */}
              <div className="space-y-2.5 py-1 text-xs sm:text-sm font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#173A7C]" />
                    <span>مدة التسليم المضمونة</span>
                  </span>
                  <span className="text-slate-900 font-black">{service.delivery_days} أيام عمل</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    <span>عدد التعديلات المجانية</span>
                  </span>
                  <span className="text-slate-900 font-black">{service.revision_count} مراجعات</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>الملفات المفتوحة المصدر</span>
                  </span>
                  <span className="text-emerald-600 font-bold">متضمنة مجاناً</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>حقوق الاستخدام التجاري</span>
                  </span>
                  <span className="text-slate-900 font-black">100% ملكك</span>
                </div>
              </div>

              {/* 4. Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-[0_10px_28px_rgba(23,58,124,0.25)] hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>اطلب الخدمة الآن</span>
                </button>

                <button
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>استفسر من مقدم الخدمة</span>
                </button>
              </div>

              {/* 5. Embedded Trust Points */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                {[
                  { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />, text: 'ضمان كامل للمبلغ 100% حتى استلامك للعمل' },
                  { icon: <Zap className="w-3.5 h-3.5 text-amber-600" />, text: 'دعم فني وتنسيق مستمر مع فريق المنصة' },
                  { icon: <FileCheck className="w-3.5 h-3.5 text-[#173A7C]" />, text: 'فاتورة ضريبية رسمية معتمدة قابلة للتحميل' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/60">
                      {item.icon}
                    </div>
                    <span className="text-[11px] leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* 6. Embedded Back Link */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/marketplace"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-bold hover:bg-slate-100 hover:text-[#173A7C] transition-all text-center w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>العودة إلى متجر الخدمات</span>
                </Link>
              </div>

            </div>
          </aside>

        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 3. FULL-WIDTH TABS & 50%-50% CARDS SECTION                    */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="space-y-6 pt-4 border-t border-slate-200/80">
          
          {/* Navigation Tabs Bar */}
          <div className="premium-tabs flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
            {[
              { key: 'deliverables', label: 'مواصفات التسليم والتقييمات', icon: FileCheck },
              { key: 'details',      label: 'تفاصيل ووصف الخدمة',       icon: Layers },
              { key: 'process',      label: 'مراحل وخطوات التنفيذ',       icon: Clock },
              { key: 'provider',     label: 'عن مقدم الخدمة والخبير',    icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`premium-tab shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    active
                      ? 'bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="premium-tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: DELIVERABLES & REVIEWS (50% - 50% ACROSS FULL WIDTH) ── */}
          {activeTab === 'deliverables' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full"
            >
              {/* Right 50% Card: Deliverables (ماذا ستحصل عليه) */}
              <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between space-y-5 h-full relative overflow-hidden">
                <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-emerald-500 to-[#5CB07C] rounded-b-full" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="card-title-royal-blue text-base sm:text-lg">ماذا ستحصل عليه في هذه الخدمة؟</h2>
                      <span className="card-desc-premium text-xs block">المخرجات المضمونة المسلمة لك</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                    مضمون 100%
                  </span>
                </div>

                {/* Compact Checklist Items */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  {(service.deliverables || allServicesMap['demo-1'].deliverables).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-start gap-3 hover:bg-white hover:border-[#173A7C]/30 hover:shadow-xs transition-all group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h3 className="card-title-royal-blue text-xs sm:text-sm leading-tight">{item.title}</h3>
                        <p className="card-desc-premium text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left 50% Card: Customer Reviews (تقييمات المشترين) */}
              <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between space-y-5 h-full relative overflow-hidden">
                <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-amber-400 to-amber-500 rounded-b-full" />

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="card-title-royal-blue text-base sm:text-lg">تقييمات وآراء المشترين</h2>
                      <span className="card-desc-premium text-xs block">تجارب العملاء الحقيقيين بعد الاستلام</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{service.rating_avg} من 5</span>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 hover:bg-white hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#173A7C]/15 to-[#5CB07C]/15 text-[#173A7C] font-black text-xs flex items-center justify-center">
                            {rev.avatar || rev.reviewer.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block leading-none">{rev.reviewer}</span>
                            <div className="flex items-center gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{rev.date}</span>
                      </div>
                      <p className="card-desc-premium text-xs leading-relaxed pr-10">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: DETAILED TEXT (FULL WIDTH) ── */}
          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6 w-full"
            >
              <h2 className="card-title-royal-blue text-lg sm:text-xl border-b border-slate-100 pb-4">
                تفاصيل ووصف الخدمة
              </h2>

              <div className="prose prose-slate max-w-none text-sm sm:text-[15px] font-medium text-slate-700 leading-relaxed space-y-4">
                <p className="whitespace-pre-wrap leading-relaxed">{service.detailed_text || service.description}</p>
              </div>

              {/* Requirements Box */}
              {service.requirements && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="card-title-royal-blue text-sm">متطلبات البدء من العميل</span>
                  </div>
                  <p className="card-desc-premium text-xs sm:text-sm text-amber-800 leading-relaxed pr-7">
                    {service.requirements}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB 3: PROCESS / ROADMAP (FULL WIDTH) ── */}
          {activeTab === 'process' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6 w-full"
            >
              <h2 className="card-title-royal-blue text-lg sm:text-xl border-b border-slate-100 pb-4">
                مراحل وخطوات تنفيذ العمل
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'استلام الطلب والمتطلبات', desc: 'يراجع مقدم الخدمة تفاصيل طلبك ويبدأ بالتواصل معك لتأكيد كافة النقاط.' },
                  { step: '02', title: 'العمل على المسودة الأولى', desc: 'يتم إعداد النموذج الأولي وإرساله لك للاطلاع وإبداء الملاحظات والتوجيهات.' },
                  { step: '03', title: 'المراجعات والتعديلات', desc: 'تطبيق التعديلات المطلوبة بكل دقة حتى نصل إلى النتيجة المثالية التي ترضيك.' },
                  { step: '04', title: 'التسليم النهائي والاعتماد', desc: 'إرسال جميع الملفات المصدرية المفتوحة والتقارير بجودة عالية مع ضمان الاستخدام.' },
                ].map((s) => (
                  <div key={s.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative overflow-hidden">
                    <span className="text-3xl font-black text-slate-200 font-mono absolute top-3 left-4">{s.step}</span>
                    <h3 className="card-title-royal-blue text-sm relative z-10">{s.title}</h3>
                    <p className="card-desc-premium text-xs relative z-10">{s.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TAB 4: PROVIDER PROFILE (FULL WIDTH) ── */}
          {activeTab === 'provider' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6 w-full"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 flex-wrap">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {service.provider?.name?.charAt(0) || 'م'}
                </div>
                <div>
                  <h3 className="card-title-royal-blue text-lg">{service.provider?.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{service.provider?.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>هوية موثقة 100%</span>
                    </span>
                    <span className="text-xs text-slate-400">عضو منذ {service.provider?.member_since}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 text-center">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">التقييم العام</span>
                  <span className="text-lg font-black text-amber-600 font-mono">★ {service.provider?.rating || 5.0}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">الطلبات المكتملة</span>
                  <span className="text-base sm:text-lg font-black text-[#173A7C] font-mono">
                    {(service.provider?.completed_orders || 0) > 0 ? `${service.provider.completed_orders}` : 'متاح للطلب'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">متوسط الرد</span>
                  <span className="text-lg font-black text-emerald-600">{service.provider?.response_time || 'خلال ساعة'}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {service.provider?.bio}
              </p>
            </motion.div>
          )}

        </div>

      </main>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MOBILE STICKY BOTTOM BAR (Always accessible on phones)            */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3.5 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">إجمالي السعر</span>
          <div className="flex items-baseline gap-1 -mt-0.5">
            <span className="text-xl font-black text-[#173A7C] font-mono">{service.price}</span>
            <span className="text-xs font-bold text-slate-500">ر.س</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>اطلب الآن</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 4. ORDER MODAL                                                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showOrderModal && !orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[2rem] p-6 sm:p-8 bg-white shadow-2xl border border-slate-200 text-right space-y-5"
            >
              <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] rounded-b-full" />

              <div>
                <h3 className="text-xl font-black text-slate-900 pt-1">تأكيد طلب الخدمة</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">يرجى كتابة متطلباتك للبدء في تنفيذ طلبك فوراً</p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-sm font-black text-slate-800 line-clamp-2">{service.title}</p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>السعر الإجمالي: <strong className="text-[#173A7C] font-black">{service.price} ر.س</strong></span>
                  <span>التسليم خلال: {service.delivery_days} أيام عمل</span>
                </div>
              </div>

              {/* Requirements Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  متطلباتك وملاحظاتك لمقدم الخدمة (اختياري)
                </label>
                <textarea
                  value={orderRequirements}
                  onChange={(e) => setOrderRequirements(e.target.value)}
                  placeholder="اكتب هنا أي تفاصيل، روابط، أسماء، أو ألوان ترغب بتزويد مقدم الخدمة بها..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#173A7C]/40 focus:ring-4 focus:ring-[#173A7C]/5 resize-none transition-all"
                />
              </div>

              {/* Guarantee text */}
              <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>أموالك في أمان تام ولا تُسلّم لمقدم الخدمة إلا بعد استلامك للعمل كاملاً.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-black hover:bg-slate-200 cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleOrderSubmit}
                  disabled={ordering}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60 transition-all"
                >
                  {ordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  <span>{ordering ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال الطلب'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 5. SUCCESS CELEBRATION MODAL                                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[2rem] p-8 bg-white shadow-2xl border border-slate-200 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">تم إرسال طلبك بنجاح! 🎉</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  رقم طلبك هو: <strong className="text-[#173A7C] font-mono">{generatedOrderNumber || 'SRV-839210'}</strong>
                </p>
                <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                  سيقوم مقدم الخدمة بالتواصل معك فوراً والبدء في تنفيذ متطلباتك.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  href="/marketplace"
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black text-center transition-all"
                >
                  تصفح خدمات أخرى
                </Link>
                <Link
                  href="/dashboard/student"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black text-center shadow-md hover:shadow-lg transition-all"
                >
                  لوحة التحكم ومتابعة الطلبات
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
