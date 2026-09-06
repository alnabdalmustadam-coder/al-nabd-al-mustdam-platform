'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CardImage } from '@/components/ui/CardImage';
import { ServiceCardSkeleton } from '@/components/ui/CardSkeleton';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  Clock,
  ShoppingCart,
  Sparkles,
  Users,
  Package,
  Heart,
  RefreshCw,
  Palette,
  Code2,
  PenTool,
  TrendingUp,
  GraduationCap,
  Database,
  Film,
  Briefcase,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  Store,
  SlidersHorizontal,
  Grid3X3,
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  FileText,
  BadgeCheck,
  LayoutGrid,
  Check,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

/* ── Types ────────────────────────────────────────────── */
interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  count: number;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  delivery_days: number;
  revision_count: number;
  image_url: string;
  tags: string[];
  status: string;
  rating_avg: number;
  rating_count: number;
  orders_count: number;
  is_featured: boolean;
  category_id: string;
  category_name: string;
  category_slug: string;
  provider_id: string;
  provider_name: string;
  provider_role: string;
  provider_avatar?: string;
  created_at: string;
}

/* ── Category Icons ────────────────────────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  Palette:       <Palette className="w-5 h-5" />,
  Code2:         <Code2 className="w-5 h-5" />,
  PenTool:       <PenTool className="w-5 h-5" />,
  TrendingUp:    <TrendingUp className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Database:      <Database className="w-5 h-5" />,
  Film:          <Film className="w-5 h-5" />,
  Briefcase:     <Briefcase className="w-5 h-5" />,
  Package:       <Package className="w-5 h-5" />,
};

/* ── 8 Structured Categories (2 Rows of 4 Cards) ────────── */
const categoriesList: ServiceCategory[] = [
  { id: 'cat-1', name: 'تصميم وهويات بصرية', slug: 'design',       description: 'شعارات، هويات، وبراندينج', icon: 'Palette',       count: 4 },
  { id: 'cat-2', name: 'برمجة وتطوير ويب',   slug: 'development',  description: 'مواقع Next.js وتطبيقات',    icon: 'Code2',         count: 3 },
  { id: 'cat-3', name: 'تصميم واجهات UI/UX', slug: 'uiux',         description: 'تطبيقات ومواقع Figma',     icon: 'LayoutGrid',    count: 2 },
  { id: 'cat-4', name: 'كتابة محتوى وسيو',   slug: 'writing',      description: 'مقالات، سيو، وتدقيق',      icon: 'PenTool',       count: 3 },
  { id: 'cat-5', name: 'تسويق وإعلانات ممولة', slug: 'marketing',  description: 'Google & Meta Ads ونمو',   icon: 'TrendingUp',    count: 2 },
  { id: 'cat-6', name: 'استشارات واعتماد NELC', slug: 'consulting', description: 'تأهيل وتراخيص المنشآت',   icon: 'GraduationCap', count: 2 },
  { id: 'cat-7', name: 'مونتاج وفيديو موشن', slug: 'media',        description: 'إنتاج مرئي وموشن جرافيك',   icon: 'Film',          count: 2 },
  { id: 'cat-8', name: 'تحليل بيانات وإكسل', slug: 'data-entry',  description: 'لوحات قياس ونماذج مالية',   icon: 'Database',      count: 2 },
];

/* ── 16 Realistic High-Quality Services Database ────────── */
const expandedServices: Service[] = [
  {
    id: 'demo-1',
    title: 'تصميم هوية بصرية متكاملة واحترافية لمنشأتك متوافقة مع رؤية 2030',
    description: 'شعار أصلي، ألوان معتمدة، بطاقات أعمال، ورق مراسلات، ودليل استخدام شامل للهوية بجودة فيكتور.',
    price: 750,
    currency: 'SAR',
    delivery_days: 5,
    revision_count: 3,
    image_url: '/services/branding.jpg',
    tags: ['تصميم', 'هوية بصرية', 'شعار', 'براندينج'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-1',
    category_name: 'تصميم وهويات بصرية',
    category_slug: 'design',
    provider_id: 'p-1',
    provider_name: 'سارة الغامدي',
    provider_role: 'استشارية براندينج وهوية',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'برمجة وتطوير موقع إلكتروني فائق السرعة بـ Next.js وTailwind CSS',
    description: 'تطوير موقع متجاوب بالكامل مع لوحة تحكم سهلة وسرعة 100% على مؤشرات Google PageSpeed.',
    price: 2500,
    currency: 'SAR',
    delivery_days: 14,
    revision_count: 2,
    image_url: '/services/development.jpg',
    tags: ['برمجة', 'Next.js', 'React', 'موقع'],
    status: 'active',
    rating_avg: 5.0,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-2',
    category_name: 'برمجة وتطوير ويب',
    category_slug: 'development',
    provider_id: 'p-2',
    provider_name: 'م. أحمد العمري',
    provider_role: 'مطور Full-Stack أول',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'تصميم واجهات وتجربة المستخدم UI/UX لتطبيقات الجوال ببرنامج Figma',
    description: 'تصميم عصري متكامل لتطبيقات iOS وAndroid مع تدفق المستخدم ونماذج تفاعلية ونظام تصميم متكامل.',
    price: 1800,
    currency: 'SAR',
    delivery_days: 10,
    revision_count: 3,
    image_url: '/services/uiux.jpg',
    tags: ['UI/UX', 'Figma', 'تصميم تطبيقات', 'تجربة مستخدم'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-3',
    category_name: 'تصميم واجهات UI/UX',
    category_slug: 'uiux',
    provider_id: 'p-3',
    provider_name: 'هديل القحطاني',
    provider_role: 'مصممة منتجات رقمية أولى',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'كتابة مقالات ومحتوى SEO احترافي باللغة العربية لتصدر نتائج جوجل',
    description: 'محتوى حصري 100% خالي من الذكاء الاصطناعي مع بحث معمق للكلمات المفتاحية التنافسية.',
    price: 150,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 2,
    image_url: '/services/writing.jpg',
    tags: ['كتابة', 'سيو', 'SEO', 'تسويق'],
    status: 'active',
    rating_avg: 4.8,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-4',
    category_name: 'كتابة محتوى وسيو',
    category_slug: 'writing',
    provider_id: 'p-4',
    provider_name: 'نورة السبيعي',
    provider_role: 'كاتبة محتوى وسيو معتمدة',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'إدارة وتوجيه حملات إعلانية ممولة على Google Ads وMeta Ads باحتراف',
    description: 'بناء خطة استهداف دقيقة وتحسين مستمر للحملات مع تقارير أداء دورية لتعظيم العائد المالي ROI.',
    price: 1200,
    currency: 'SAR',
    delivery_days: 30,
    revision_count: 5,
    image_url: '/services/marketing.jpg',
    tags: ['تسويق', 'إعلانات', 'Google Ads', 'سوشال ميديا'],
    status: 'active',
    rating_avg: 4.7,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-5',
    category_name: 'تسويق وإعلانات ممولة',
    category_slug: 'marketing',
    provider_id: 'p-5',
    provider_name: 'خالد الدوسري',
    provider_role: 'خبير نمو وتسويق رقمي',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    title: 'استشارة تدريبية متخصصة لتأهيل المنشآت لمعايير واعتماد NELC',
    description: 'إعداد ملف الاعتماد الكامل للمركز الوطني للتعليم الإلكتروني مع خارطة طريق وقوالب امتثال جاهزة.',
    price: 950,
    currency: 'SAR',
    delivery_days: 7,
    revision_count: 2,
    image_url: '/services/consulting.jpg',
    tags: ['استشارات', 'NELC', 'اعتماد', 'تدريب'],
    status: 'active',
    rating_avg: 5.0,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-6',
    category_name: 'استشارات واعتماد NELC',
    category_slug: 'consulting',
    provider_id: 'p-6',
    provider_name: 'د. عبدالله الشمري',
    provider_role: 'مستشار جودة وتعليم إلكتروني',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    title: 'مونتاج فيديو إعلاني وترويجي احترافي لمنصات التواصل الاجتماعي',
    description: 'مونتاج سينمائي بدقة 4K مع تصحيح ألوان ومؤثرات بصرية وموسيقى مرخصة ومؤثرات صوتية جذابة.',
    price: 450,
    currency: 'SAR',
    delivery_days: 4,
    revision_count: 3,
    image_url: '/services/video.jpg',
    tags: ['مونتاج', 'فيديو', 'ريلز', 'موشن'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-7',
    category_name: 'مونتاج وفيديو موشن',
    category_slug: 'media',
    provider_id: 'p-7',
    provider_name: 'عمر الخالدي',
    provider_role: 'مخرج ومونتير فيديو أول',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-8',
    title: 'بناء لوحات تحكم مالية وإحصائية متقدمة ببرنامج Excel & Power BI',
    description: 'أتمتة الجداول الحسابية، تقارير تفاعلية، ولوحات مؤشرات أداء KPI دقيقة تدعم اتخاذ القرار.',
    price: 350,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 2,
    image_url: '/services/data.jpg',
    tags: ['بيانات', 'Excel', 'Power BI', 'تحليل مالي'],
    status: 'active',
    rating_avg: 4.8,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-8',
    category_name: 'تحليل بيانات وإكسل',
    category_slug: 'data-entry',
    provider_id: 'p-8',
    provider_name: 'ريم الجهني',
    provider_role: 'محللة بيانات ونظم مالية',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-9',
    title: 'تصميم عروض تقديمية تفاعلية واحترافية للشركات والاجتماعات (Pitch Deck)',
    description: 'عروض بوربوينت وKeynote مذهلة تجذب المستثمرين والعملاء مع انفوجرافيك وتنسيق متقن.',
    price: 300,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 3,
    image_url: '/services/branding.jpg',
    tags: ['عروض', 'PowerPoint', 'Pitch Deck', 'تصميم'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-1',
    category_name: 'تصميم وهويات بصرية',
    category_slug: 'design',
    provider_id: 'p-1',
    provider_name: 'سارة الغامدي',
    provider_role: 'استشارية براندينج وهوية',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-10',
    title: 'تأسيس وتهيئة متجر إلكتروني متكامل على منصة سلة أو زد (Salla / Zid)',
    description: 'ضبط الهوية، بوابات الدفع، خيارات الشحن، إضافة المنتجات، والربط مع أدوات التحليل والتتبع.',
    price: 850,
    currency: 'SAR',
    delivery_days: 6,
    revision_count: 2,
    image_url: '/services/development.jpg',
    tags: ['سلة', 'زد', 'متجر إلكتروني', 'تجارة'],
    status: 'active',
    rating_avg: 5.0,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-2',
    category_name: 'برمجة وتطوير ويب',
    category_slug: 'development',
    provider_id: 'p-2',
    provider_name: 'م. أحمد العمري',
    provider_role: 'مطور Full-Stack أول',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-11',
    title: 'إعادة تصميم وتحسين تجربة المستخدم لموقعك أو تطبيقك القائم UI Audit',
    description: 'تحليل نقاط التعثر، تحسين مسارات التحويل، وتقديم مقترحات واجهات جديدة عالية الفاعلية.',
    price: 900,
    currency: 'SAR',
    delivery_days: 5,
    revision_count: 2,
    image_url: '/services/uiux.jpg',
    tags: ['UI/UX', 'Audit', 'تحسين', 'Figma'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-3',
    category_name: 'تصميم واجهات UI/UX',
    category_slug: 'uiux',
    provider_id: 'p-3',
    provider_name: 'هديل القحطاني',
    provider_role: 'مصممة منتجات رقمية أولى',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-12',
    title: 'كتابة الملف التعريفي للشركة (Company Profile) بصياغة تسويقية راقية',
    description: 'صياغة الرؤية، الرسالة، الأهداف، والخدمات بلغة احترافية تعزز ثقة الشركاء والعملاء.',
    price: 400,
    currency: 'SAR',
    delivery_days: 4,
    revision_count: 2,
    image_url: '/services/writing.jpg',
    tags: ['بروفايل شركة', 'كتابة', 'تسويق', 'محتوى'],
    status: 'active',
    rating_avg: 4.8,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-4',
    category_name: 'كتابة محتوى وسيو',
    category_slug: 'writing',
    provider_id: 'p-4',
    provider_name: 'نورة السبيعي',
    provider_role: 'كاتبة محتوى وسيو معتمدة',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-13',
    title: 'تصميم إعلانات وبوسترات السوشيال ميديا التسويقية باحترافية عالية',
    description: 'باقة تصاميم مبتكرة لحسابات تويتر، انستغرام، ولينكد إن ترفع التفاعل وتبرز علامتك التجارية.',
    price: 350,
    currency: 'SAR',
    delivery_days: 3,
    revision_count: 3,
    image_url: '/services/branding.jpg',
    tags: ['تصميم', 'سوشال ميديا', 'إعلانات', 'انستغرام'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-1',
    category_name: 'تصميم وهويات بصرية',
    category_slug: 'design',
    provider_id: 'p-1',
    provider_name: 'سارة الغامدي',
    provider_role: 'استشارية براندينج وهوية',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-14',
    title: 'فيديو موشن جرافيك توضيحي للمشاريع والخدمات مع تعليق صوتي فصيح',
    description: 'سيناريو مبتكر، رسومات خاصة، وتحريك احترافي مع تعليق صوتي باللغة العربية الفصحى بجودة استوديو.',
    price: 1100,
    currency: 'SAR',
    delivery_days: 7,
    revision_count: 3,
    image_url: '/services/video.jpg',
    tags: ['موشن جرافيك', 'فيديو', 'تعليق صوتي', 'تسويق'],
    status: 'active',
    rating_avg: 5.0,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-7',
    category_name: 'مونتاج وفيديو موشن',
    category_slug: 'media',
    provider_id: 'p-7',
    provider_name: 'عمر الخالدي',
    provider_role: 'مخرج ومونتير فيديو أول',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-15',
    title: 'إعداد دراسة جدوى مبسطة وخطة عمل تنفيذية للمشاريع الناشئة',
    description: 'تحليل السوق، التكاليف التشغيلية، التوقعات المالية، وخطة الانطلاق للسوق السعودي.',
    price: 1500,
    currency: 'SAR',
    delivery_days: 8,
    revision_count: 2,
    image_url: '/services/consulting.jpg',
    tags: ['دراسة جدوى', 'خطة عمل', 'استشارات', 'مشاريع'],
    status: 'active',
    rating_avg: 4.9,
    rating_count: 0,
    orders_count: 0,
    is_featured: true,
    category_id: 'cat-6',
    category_name: 'استشارات واعتماد NELC',
    category_slug: 'consulting',
    provider_id: 'p-6',
    provider_name: 'د. عبدالله الشمري',
    provider_role: 'مستشار جودة وتعليم إلكتروني',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-16',
    title: 'تنظيف وتنسيق قواعد البيانات واستخراج التقارير الإحصائية المتقدمة',
    description: 'معالجة البيانات الضخمة، إزالة التكرار، وربط الجداول لتوليد تقارير إحصائية دقيقة وموجزة.',
    price: 250,
    currency: 'SAR',
    delivery_days: 2,
    revision_count: 2,
    image_url: '/services/data.jpg',
    tags: ['قواعد بيانات', 'إكسل', 'تنظيم', 'تقارير'],
    status: 'active',
    rating_avg: 4.8,
    rating_count: 0,
    orders_count: 0,
    is_featured: false,
    category_id: 'cat-8',
    category_name: 'تحليل بيانات وإكسل',
    category_slug: 'data-entry',
    provider_id: 'p-8',
    provider_name: 'ريم الجهني',
    provider_role: 'محللة بيانات ونظم مالية',
    created_at: new Date().toISOString(),
  },
];

/* ── Sort Options ───────────────────────────────────────── */
const sortOptions = [
  { key: 'popular',    label: 'الأكثر طلباً' },
  { key: 'newest',     label: 'الأحدث أولاً' },
  { key: 'price_low',  label: 'الأقل سعراً' },
  { key: 'price_high', label: 'الأعلى سعراً' },
  { key: 'rating',     label: 'الأعلى تقييماً' },
];

export default function MarketplacePage() {
  const [categories]                  = useState<ServiceCategory[]>(categoriesList);
  const [services, setServices]       = useState<Service[]>(expandedServices);
  const [loading, setLoading]         = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sort, setSort]               = useState('popular');
  const [savedIds, setSavedIds]       = useState<string[]>([]);
  const [openFaq, setOpenFaq]         = useState<number | null>(0);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  /* ── Live Database synchronization with Admin Panel ── */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/services?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      } catch (err) {
        console.error('Marketplace fetch services error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* ── Filter & Sort ── */
  const filteredServices = services
    .filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === '' ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchCat = selectedCat === 'all' || s.category_slug === selectedCat;
      return matchQuery && matchCat;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest':     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price_low':  return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'rating':     return b.rating_avg - a.rating_avg;
        default:           return b.orders_count - a.orders_count;
      }
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-cairo)] text-slate-900 selection:bg-[#5CB07C] selection:text-white" dir="rtl">

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION (Spacious Top Padding: pt-28 sm:pt-36)            */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 sm:pt-36 pb-14 md:pb-16 overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100/60 border-b border-slate-200/80">
        
        {/* Subtle Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-contain" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-16 right-10 w-96 h-96 bg-[#173A7C]/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#5CB07C]/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="particles-grid opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          
          {/* Live Badge */}
          <div className="mb-2">
            <span className="section-badge-glass inline-flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CB07C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5CB07C]"></span>
              </span>
              <span>
                سوق متكامل لأكثر من <strong className="text-[#173A7C] font-black">{services.length} خدمة احترافية معتمدة</strong>
              </span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="section-main-title-premium text-3xl sm:text-5xl lg:text-[3.75rem] leading-[1.2]">
            سوق الخدمات المصغرة{' '}
            <span className="gradient-text">
              والحلول الاحترافية
            </span>
          </h1>

          {/* Divider */}
          <div className="w-24 h-[3px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full opacity-80" />

          {/* Subtitle */}
          <p className="section-desc-premium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            أنجز أعمالك ومشروعاتك مع نخبة الكفاءات والمدربين المعتمدين في التصميم، البرمجة، التسويق، وإدارة الأعمال مع ضمان كامل للأموال والجودة.
          </p>

          {/* Search Bar Widget */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_12px_40px_rgba(23,58,124,0.08)] p-2 sm:p-2.5 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن الخدمة المطلوبة... (مثال: تصميم هوية، موقع ويب، سيو، إكسل)"
                  className="w-full pr-12 pl-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#173A7C]/30 focus:ring-4 focus:ring-[#173A7C]/5 outline-none transition-all text-xs sm:text-sm font-medium"
                />
              </div>

              <button
                onClick={() => {}}
                className="px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg hover:from-[#1E4D9D] hover:to-[#173A7C] transition-all cursor-pointer shrink-0"
              >
                بحث
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Divider Accent */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/50 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/60 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. CATEGORIES 2-ROW GRID (NO HORIZONTAL SCROLLBAR!)               */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30">
        <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_10px_35px_rgba(23,58,124,0.07)] p-4 sm:p-6">
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#173A7C]" />
              <h2 className="card-title-royal-blue text-sm sm:text-base">تصفح تصنيفات الخدمات</h2>
            </div>
            
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-[#173A7C] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              عرض جميع الخدمات ({services.length})
            </button>
          </div>

          {/* 2-Row Structured Grid (4 Cols on Desktop / Tablet, 2 Cols on Mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            {categoriesList.map((cat) => {
              const active = selectedCat === cat.slug;
              const count = services.filter((s) => s.category_slug === cat.slug).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(active ? 'all' : cat.slug)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-right transition-all duration-300 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                    active
                      ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] border-[#173A7C] text-white shadow-md shadow-[#173A7C]/20 scale-[1.02]'
                      : 'bg-slate-50/70 hover:bg-white hover:border-[#173A7C]/30 hover:shadow-sm border-slate-200/70 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'bg-white border border-slate-200 text-[#173A7C] shadow-xs'
                    }`}
                  >
                    {iconMap[cat.icon] || <Package className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className={`text-xs sm:text-sm font-black block truncate ${active ? 'text-white' : 'text-slate-900'}`}>
                      {cat.name}
                    </span>
                    <span className={`text-[10px] block truncate mt-0.5 font-medium ${active ? 'text-white/80' : 'text-slate-500'}`}>
                      {count} {count === 1 ? 'خدمة' : 'خدمات'}
                    </span>
                  </div>

                  {active && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 absolute top-3 left-3 shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. MAIN SERVICES GRID WITH PHOTO THUMBNAILS                       */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        
        {/* Results Bar & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="card-title-royal-blue text-xl sm:text-2xl">
              {selectedCat === 'all' ? 'جميع الخدمات المصغرة' : categoriesList.find((c) => c.slug === selectedCat)?.name}
            </h2>
            <p className="card-desc-premium text-xs sm:text-sm mt-0.5">
              عرض <strong className="text-[#173A7C] font-black">{filteredServices.length}</strong> خدمة احترافية جاهزة للتنفيذ الفوري
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-bold shrink-0">ترتيب حسب:</span>
            <div className="relative bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="ترتيب الخدمات"
                className="pr-4 pl-10 py-2.5 bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none cursor-pointer appearance-none border-none"
              >
                {sortOptions.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {loading && services.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-200/80 p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="card-title-royal-blue text-lg">لا توجد خدمات مطابقة للبحث</h3>
            <p className="card-desc-premium text-xs sm:text-sm">
              جرّب استخدام كلمات بحث أخرى أو اختر فئة مختلفة.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCat('all'); }}
              className="px-5 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-bold shadow-md hover:bg-[#1E4D9D] transition-all cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          /* Services 3-Column Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service, index) => {
              const isSaved = savedIds.includes(service.id);

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
                  className="h-full"
                >
                  <div className="group relative h-full flex flex-col bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_10px_35px_-10px_rgba(23,58,124,0.06)] hover:shadow-[0_25px_60px_-15px_rgba(23,58,124,0.16)] hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                    
                    {/* Top Accent Gradient Bar */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] z-30 opacity-80 group-hover:opacity-100 transition-opacity" />

                    {/* Full artwork without cropping or hover zoom */}
                    <div className="relative w-full shrink-0 overflow-hidden bg-slate-100">
                      <CardImage
                        src={service.image_url}
                        alt={service.title}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />

                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10" />

                      {/* Category Badge on Top Right */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#173A7C] text-[11px] font-black shadow-md border border-white/60">
                          {service.category_name}
                        </span>
                      </div>

                      {/* Bookmark Button on Top Left */}
                      <button
                        onClick={(e) => toggleSave(service.id, e)}
                        className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer active:scale-90 ${
                          isSaved
                            ? 'bg-rose-500 text-white shadow-rose-500/30'
                            : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                        }`}
                        title="حفظ الخدمة"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                      </button>

                      {/* Delivery Time Pill on Bottom Right */}
                      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>تسليم خلال {service.delivery_days} أيام</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-3.5">
                      
                      {/* Provider Info Row */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {service.provider_name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-slate-800 truncate block leading-tight">
                            {service.provider_name}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>مقدم خدمة معتمد</span>
                          </span>
                        </div>
                      </div>

                      {/* Service Title */}
                      <Link href={`/marketplace/${service.id}`} className="block group-hover:text-[#173A7C] transition-colors">
                        <h3 className="card-title-royal-blue text-sm sm:text-base leading-snug line-clamp-2">
                          {service.title}
                        </h3>
                      </Link>

                      {/* Service Description (Clean & Concise) */}
                      <p className="card-desc-premium text-xs line-clamp-3 flex-1">
                        {service.description}
                      </p>

                      {/* Clean Authentic Rating & Orders Meta */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          {service.rating_count > 0 ? (
                            <>
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <strong className="text-slate-900 font-black">{service.rating_avg}</strong>
                              <span className="text-slate-400">({service.rating_count})</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                              <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                              <span>خدمة جديدة ومتاحة</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                          <span>{service.orders_count > 0 ? `${service.orders_count} طلب مكتمل` : 'جاهزة للتنفيذ'}</span>
                        </div>
                      </div>

                      {/* Price Footer & Order CTA */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">يبدأ من</span>
                          <div className="flex items-baseline gap-1 -mt-0.5">
                            <span className="text-lg sm:text-xl font-black text-[#173A7C] font-mono">
                              {service.price}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">ر.س</span>
                          </div>
                        </div>

                        <Link
                          href={`/marketplace/${service.id}`}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-1.5"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>طلب الخدمة</span>
                        </Link>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 4. VALUE PROPOSITION: WHY NAB'D MARKETPLACE?                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="section-badge-glass">
              المعايير المعتمدة لضمان الجودة
            </span>
            <h2 className="section-main-title-premium text-2xl sm:text-3xl text-slate-900">
              لماذا تختار متجر خدمات <span className="gradient-text">النبض المستدام</span>؟
            </h2>
            <div className="w-20 h-[3px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full" />
            <p className="section-desc-premium text-xs sm:text-sm">
              نوفر بيئة آمنة ومرخصة بنسبة 100% تجمع بين أصحاب الأعمال ونخبة الكفاءات الوطنية المعتمدة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-7 h-7 text-emerald-600" />,
                title: 'حماية وأمان مالي 100%',
                desc: 'أموالك محفوظة في حساب الضمان حتى استلامك للعمل واعتماده بدون أي مخاطرة.',
              },
              {
                icon: <BadgeCheck className="w-7 h-7 text-[#173A7C]" />,
                title: 'مقدمو خدمات معتمدون',
                desc: 'يتم التحقق من هوية وخبرات جميع مقدمي الخدمات وفق معايير مهنية صارمة.',
              },
              {
                icon: <FileText className="w-7 h-7 text-purple-600" />,
                title: 'فواتير ضريبية معتمدة',
                desc: 'إصدار فواتير ضريبية نظامية متوافقة مع هيئة الزكاة والضريبة والجمارك.',
              },
              {
                icon: <Zap className="w-7 h-7 text-amber-600" />,
                title: 'دعم فني وتنسيق مستمر',
                desc: 'فريق دعم متخصص يتابع طلباتك ويحل أي استفسارات أو ملاحظات بشكل فوري.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-[2rem] bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-lg hover:border-[#173A7C]/20 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="card-title-royal-blue text-base">{feat.title}</h3>
                <p className="card-desc-premium text-xs">{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 5. FAQ SECTION                                                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="section-main-title-premium text-2xl sm:text-3xl text-slate-900">الأسئلة الشائعة حول <span className="gradient-text">المتجر</span></h2>
          <p className="section-desc-premium text-xs sm:text-sm">كل ما تود معرفته عن آلية الشراء، الضمان، والتسليم</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'كيف يضمن متجر النبض المستدام حقوقي المالية؟',
              a: 'عند طلب أي خدمة، يتم حجز المبلغ بأمان في حساب الضمان التابع للمنصة، ولا يتم تحويل المستحقات لمقدم الخدمة إلا بعد استلامك للعمل كاملاً وتأكيد رضاك عنه 100%.',
            },
            {
              q: 'هل يمكنني طلب تعديلات على العمل بعد استلامه؟',
              a: 'نعم بالتأكيد! كل خدمة تتضمن عدداً محدداً من التعديلات والمراجعات المجانية الموضحة في تفاصيل الخدمة لضمان مطابقتها لتطلعاتك.',
            },
            {
              q: 'هل أحصل على فاتورة ضريبية رسمية للخدمات المشتراة؟',
              a: 'نعم، فور إتمام الطلب يصدر النظام فاتورة ضريبية معتمدة ومتوافقة مع هيئة الزكاة والضريبة والجمارك (ZATCA) يمكنك تحميلها واستخدامها في حسابات منشأتك.',
            },
            {
              q: 'كيف يمكنني التواصل مع مقدم الخدمة أثناء التنفيذ؟',
              a: 'نوفر نظام محادثة داخلي مباشر وخاص بكل طلب يمكنك من خلاله تبادل الملفات والرسائل والملاحظات لحظة بلحظة مع مقدم الخدمة.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-right font-black text-sm sm:text-base text-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#173A7C]" />
                    <span className="card-title-royal-blue text-sm sm:text-base">{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#173A7C]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="card-desc-premium px-5 pb-5 text-xs sm:text-sm border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
