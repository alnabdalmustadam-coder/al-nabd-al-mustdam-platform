'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  ShieldCheck,
  Crown,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileCheck,
  Search,
  Sliders,
  Settings,
  RefreshCw,
  Upload,
  UserPlus,
  ChevronLeft,
  X,
  Palette,
  Type,
  FileText,
  Stamp,
  QrCode,
  Trash2,
  Edit3,
  Check,
  Layers,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { CertificateTemplate, IssuedCertificate } from '@/lib/certificates-store';

export default function AdminCertificatesPage() {
  const [selectedTab, setSelectedTab] = useState<'templates' | 'registry'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([
    'دورة استخدام الحاسب الالي في الاعمال المكتبية',
    'دورات ادخال بيانات ومعالجة نصوص',
    'دورة اللغة الانجليزية',
    'دورة الذكاء الاصطناعي',
    'دورة محلل الأمن السيبراني',
    'دورة صيانة الجوالات',
    'دورة الأوشا',
    'دورة النيبوش',
    'دورة القدرات',
  ]);

  // Modal States
  const [isIssuingModalOpen, setIsIssuingModalOpen] = useState(false);
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);

  // Manual Issuing State
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedCourseForIssue, setSelectedCourseForIssue] = useState('');
  const [selectedTemplateForIssue, setSelectedTemplateForIssue] = useState('');
  const [newIssueGrade, setNewIssueGrade] = useState('ممتاز مرتفع (%98)');
  const [newIssueHours, setNewIssueHours] = useState('30 ساعة');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // Designer Form State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [designerActiveTab, setDesignerActiveTab] = useState<'bg' | 'text' | 'signatories'>('bg');
  const [designerForm, setDesignerForm] = useState<Partial<CertificateTemplate>>({
    name: 'قالب شهادة معتمد جديد',
    courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
    bgType: 'preset',
    bgPreset: 'royal-gold',
    imageUrl: '/1.png',
    headerTitle: 'شهادة إتمام وتفوق معتمدة',
    subtitle: 'CERTIFICATE OF COMPLETION & EXCELLENCE',
    statement: 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
    bodyText: 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها النظرية والتطبيقية بكفاءة واقتدار.',
    issuerName: 'معهد النبض المستدام العالي للتدريب',
    signatory1Title: 'المشرف الأكاديمي والتدريب',
    signatory1Name: 'د. عبدالرحمن الغامدي',
    signatory2Title: 'المدير التنفيذي للمعهد',
    signatory2Name: 'أ. نورة الشمري',
    showQrCode: true,
    showNationalSeal: true,
    showInstituteSeal: true,
    accentColor: '#173A7C',
    autoIssue: true,
  });
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/certificates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        setIssuedCertificates(data.issued || []);
        if (data.templates?.length > 0 && !selectedTemplateForIssue) {
          setSelectedTemplateForIssue(data.templates[0].id);
        }
      }

      // Fetch dynamic courses
      try {
        const coursesRes = await fetch('/api/admin/courses');
        const coursesData = await coursesRes.json();
        if (coursesData.success && Array.isArray(coursesData.courses)) {
          const titles = coursesData.courses.map((c: any) => c.title).filter(Boolean);
          if (titles.length > 0) {
            setAvailableCourses(titles);
            if (!selectedCourseForIssue) {
              setSelectedCourseForIssue(titles[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Courses fetch fallback:', err);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
      showToast('تعذر تحميل بيانات الشهادات من السيرفر', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Designer for New Template
  const handleOpenNewTemplate = () => {
    setEditingTemplateId(null);
    setDesignerForm({
      name: `قالب شهادة معتمد #${templates.length + 1}`,
      courseTitle: availableCourses[0] || 'كافة المساقات التدريبية',
      bgType: 'preset',
      bgPreset: 'royal-gold',
      imageUrl: '/1.png',
      headerTitle: 'شهادة إتمام وتفوق معتمدة',
      subtitle: 'CERTIFICATE OF COMPLETION & EXCELLENCE',
      statement: 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
      bodyText: 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها النظرية والتطبيقية بكفاءة واقتدار.',
      issuerName: 'معهد النبض المستدام العالي للتدريب',
      signatory1Title: 'المشرف الأكاديمي والتدريب',
      signatory1Name: 'د. عبدالرحمن الغامدي',
      signatory2Title: 'المدير التنفيذي للمعهد',
      signatory2Name: 'أ. نورة الشمري',
      showQrCode: true,
      showNationalSeal: true,
      showInstituteSeal: true,
      accentColor: '#173A7C',
      autoIssue: true,
    });
    setDesignerActiveTab('bg');
    setIsDesignerModalOpen(true);
  };

  // Open Designer for Existing Template
  const handleEditTemplate = (tpl: CertificateTemplate) => {
    setEditingTemplateId(tpl.id);
    setDesignerForm({ ...tpl });
    setDesignerActiveTab('bg');
    setIsDesignerModalOpen(true);
  };

  // Save Template to API & DB
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designerForm.name?.trim()) {
      showToast('يرجى كتابة اسم للقالب', 'error');
      return;
    }

    try {
      setIsSavingTemplate(true);
      const payload = {
        ...designerForm,
        id: editingTemplateId || undefined,
      };

      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.template) {
        showToast(editingTemplateId ? 'تم حفظ وتحديث القالب فوراً بنجاح! ✨' : 'تم إنشاء وحفظ القالب الجديد فوراً! 🎉');
        setIsDesignerModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || 'حدث خطأ أثناء حفظ القالب', 'error');
      }
    } catch (err: any) {
      console.error('Error saving template:', err);
      showToast('حدث خطأ في الاتصال بالسيرفر أثناء الحفظ', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف القالب "${name}" نهائياً؟`)) return;

    try {
      const res = await fetch(`/api/admin/certificates?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف القالب بنجاح');
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        showToast(data.error || 'تعذر حذف القالب', 'error');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      showToast('حدث خطأ أثناء حذف القالب', 'error');
    }
  };

  // Upload Custom Background Frame
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploadingBg(true);
      const res = await fetch('/api/admin/certificates/upload-template', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.imageUrl) {
        setDesignerForm((prev) => ({
          ...prev,
          bgType: 'custom',
          imageUrl: data.imageUrl,
        }));
        showToast('تم رفع صورة الخلفية بنجاح! 🖼️');
      } else {
        showToast(data.error || 'فشل رفع صورة الخلفية', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('تعذر رفع الصورة إلى السيرفر', 'error');
    } finally {
      setIsUploadingBg(false);
    }
  };

  // Toggle Auto-issue Directly on Template Card
  const handleToggleAutoIssue = async (tpl: CertificateTemplate) => {
    const updated = { ...tpl, autoIssue: !tpl.autoIssue };
    setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? updated : t)));

    try {
      await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      showToast(updated.autoIssue ? 'تم تفعيل الإصدار التلقائي للقالب' : 'تم إيقاف الإصدار التلقائي للقالب');
    } catch (err) {
      console.error('Auto issue toggle error:', err);
    }
  };

  // Issue Manual Certificate
  const handleIssueManualCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      showToast('يرجى إدخال اسم المتدرب', 'error');
      return;
    }

    try {
      setIsSubmittingIssue(true);
      const matchedTemplate = templates.find((t) => t.id === selectedTemplateForIssue) || templates[0];

      const res = await fetch('/api/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: newStudentName.trim(),
          courseTitle: selectedCourseForIssue || availableCourses[0],
          templateId: selectedTemplateForIssue || matchedTemplate?.id || 'tpl-1',
          grade: newIssueGrade,
          hours: newIssueHours,
          imageUrl: matchedTemplate?.imageUrl || '/1.png',
        }),
      });

      const data = await res.json();
      if (data.success && data.certificate) {
        showToast(`تم إصدار وتوثيق شهادة "${newStudentName}" فوراً! ⚡`);
        setIssuedCertificates((prev) => [data.certificate, ...prev]);
        setNewStudentName('');
        setIsIssuingModalOpen(false);
        // refresh template counters
        fetchData();
      } else {
        showToast(data.error || 'فشل إصدار الشهادة', 'error');
      }
    } catch (err) {
      console.error('Manual issue error:', err);
      showToast('حدث خطأ أثناء إصدار الشهادة', 'error');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Toggle Certificate Status (Active / Revoked)
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch('/api/admin/certificates/issue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success && data.certificate) {
        setIssuedCertificates((prev) =>
          prev.map((c) => (c.id === id ? data.certificate : c))
        );
        showToast(
          data.certificate.status === 'active'
            ? 'تمت إعادة تفعيل الشهادة بنجاح 🟢'
            : 'تم إبطال وإلغاء صلاحية الشهادة 🔴'
        );
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      showToast('حدث خطأ أثناء تحديث حالة الشهادة', 'error');
    }
  };

  const totalIssued = templates.reduce((acc, curr) => acc + (curr.issuedCount || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black border backdrop-blur-xl ${
              toastMessage.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/40'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO BANNER: CERTIFICATE STUDIO ── */}
      <div className="liquid-glass-hero rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden text-slate-900 border border-white/80 shadow-lg student-card-accent">
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="admin-hero-tag bg-[#173A7C]/10 border border-[#173A7C]/20 text-[#173A7C]">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>استوديو الشهادات والاعتمادات الرسمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#152C5B] student-heading-h1">
              إدارة وتصميم قوالب الشهادات
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              صمم وعدل قوالب الشهادات الرسمية بدقة متناهية، خصص الخلفيات والنصوص والأختام، مع الحفظ التلقائي الفوري وإصدار الشهادات المعتمدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenNewTemplate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] hover:from-[#0F2D69] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/25 transition-all cursor-pointer border border-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Palette className="w-4 h-4 text-amber-300" />
              <span>تصميم قالب شهادة جديد</span>
            </button>

            <button
              onClick={() => setIsIssuingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#173A7C] border border-[#173A7C]/30 text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>إصدار شهادة يدوية</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#173A7C]/15">
          <div className="liquid-glass-inset p-3 rounded-xl border border-white/60">
            <span className="block text-[11px] text-slate-500 font-bold">إجمالي الشهادات الصادرة</span>
            <span className="text-lg sm:text-xl font-black text-[#152C5B]">
              {totalIssued.toLocaleString('en-US')}
            </span>
          </div>
          <div className="liquid-glass-inset p-3 rounded-xl border border-white/60">
            <span className="block text-[11px] text-slate-500 font-bold">القوالب الفعالة</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700">
              {templates.length.toLocaleString('en-US')}
            </span>
          </div>
          <div className="liquid-glass-inset p-3 rounded-xl border border-white/60">
            <span className="block text-[11px] text-slate-500 font-bold">الإصدار التلقائي</span>
            <span className="text-lg sm:text-xl font-black text-amber-700">
              {templates.filter((t) => t.autoIssue).length.toLocaleString('en-US')} قوالب
            </span>
          </div>
          <div className="liquid-glass-inset p-3 rounded-xl border border-white/60">
            <span className="block text-[11px] text-slate-500 font-bold">التوثيق السحابي</span>
            <span className="text-lg sm:text-xl font-black text-sky-700 flex items-center gap-1">
              <span>نشط 24/7</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'templates'
              ? 'bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>قوالب الشهادات والتصاميم</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('registry')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'registry'
              ? 'bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>سجل الشهادات الصادرة</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
            {issuedCertificates.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: TEMPLATES MANAGEMENT ── */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
              <span>جاري تحميل قوالب الشهادات من السيرفر...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center bg-white/80 rounded-2xl border border-slate-200 space-y-4">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-800">لا توجد قوالب شهادات حالياً</h3>
              <p className="text-xs text-slate-500 font-bold">ابدأ بتصميم أول قالب شهادة معتمد لدوراتك الآن.</p>
              <button
                onClick={handleOpenNewTemplate}
                className="px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>تصميم قالب جديد</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="liquid-glass-card liquid-glass-hover rounded-xl sm:rounded-2xl overflow-hidden border border-white/80 space-y-4 relative group student-card-accent flex flex-col justify-between"
                >
                  <div className="specular-card-reflection" />

                  {/* Template Image Header */}
                  <div>
                    <div className="aspect-[1.414/1] relative bg-slate-950 overflow-hidden border-b border-[#173A7C]/10 group cursor-pointer"
                      onClick={() => {
                        setPreviewTemplate(tpl);
                        setIsPreviewModalOpen(true);
                      }}
                    >
                      <img
                        src={tpl.imageUrl || '/1.png'}
                        alt={tpl.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/20">
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>معاينة الشهادة</span>
                        </span>
                      </div>
                      <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-950/85 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md font-mono">
                        {(tpl.issuedCount || 0).toLocaleString('en-US')} شهادة صادرة
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 pt-3 space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-sm text-[#152C5B] student-heading-h3 truncate">
                            {tpl.name}
                          </h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-relaxed line-clamp-1">
                          {tpl.courseTitle}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/70 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">الجهة المانحة:</span>
                          <span className="font-bold text-slate-700 truncate max-w-[170px]">{tpl.issuerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">التوقيعات:</span>
                          <span className="font-bold text-slate-700">{tpl.signatory1Name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Settings Footer */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#173A7C]/10 flex items-center justify-between text-xs mt-auto">
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={tpl.autoIssue}
                        onChange={() => handleToggleAutoIssue(tpl)}
                        className="w-3.5 h-3.5 accent-[#173A7C] rounded cursor-pointer"
                      />
                      <span>الإصدار التلقائي</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditTemplate(tpl)}
                        title="تعديل القالب وتصميمه"
                        className="p-2 rounded-lg text-slate-700 hover:text-[#173A7C] hover:bg-[#173A7C]/10 transition-colors cursor-pointer border border-slate-200 bg-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        title="حذف القالب"
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-rose-200 bg-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ISSUED CERTIFICATES REGISTRY TABLE ── */}
      {selectedTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="liquid-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم المتدرب أو كود التوثيق..."
                className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>موثقة بالسجل الوطني للتدريب والتحقق السحابي 24/7</span>
            </div>
          </div>

          {/* Registry Container */}
          <div className="liquid-glass-card rounded-xl sm:rounded-2xl overflow-hidden border border-white/80 shadow-lg student-card-accent">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#173A7C]/5 text-[#173A7C] font-black border-b border-[#173A7C]/10">
                  <tr>
                    <th className="p-4">اسم المتدرب</th>
                    <th className="p-4">المساق التدريبي</th>
                    <th className="p-4">كود التوثيق</th>
                    <th className="p-4">تاريخ الإصدار</th>
                    <th className="p-4">التقدير والساعات</th>
                    <th className="p-4">حالة الاعتماد</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#173A7C]/8 font-bold text-slate-800">
                  {issuedCertificates
                    .filter(
                      (c) =>
                        c.studentName.includes(searchQuery) ||
                        c.code.includes(searchQuery) ||
                        c.courseTitle.includes(searchQuery)
                    )
                    .map((cert) => (
                      <tr key={cert.id} className="hover:bg-white/60 transition-colors">
                        <td className="p-4 font-extrabold text-[#152C5B] text-sm student-heading-h3">
                          {cert.studentName}
                        </td>
                        <td className="p-4 text-slate-700">{cert.courseTitle}</td>
                        <td className="p-4 font-mono font-black text-[#173A7C]">
                          <span className="bg-[#173A7C]/10 px-2.5 py-1 rounded-lg border border-[#173A7C]/20 text-[11px]">
                            {cert.code}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{cert.issueDate}</td>
                        <td className="p-4 text-emerald-700 font-black">
                          {cert.grade} {cert.hours && `(${cert.hours})`}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              cert.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-800 border-rose-500/30'
                            }`}
                          >
                            {cert.status === 'active' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                نشطة ومعتمدة
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                ملغاة / مبطلة
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(cert.id)}
                              title={cert.status === 'active' ? 'إبطال الشهادة' : 'إعادة تفعيل الشهادة'}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200 bg-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <a
                              href={cert.imageUrl || '/1.png'}
                              download={`شهادة_${cert.studentName}_${cert.code}.png`}
                              className="p-2 rounded-xl text-[#173A7C] hover:bg-[#173A7C] hover:text-white transition-colors cursor-pointer border border-[#173A7C]/20 bg-white"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-[#173A7C]/8">
              {issuedCertificates
                .filter(
                  (c) =>
                    c.studentName.includes(searchQuery) ||
                    c.code.includes(searchQuery) ||
                    c.courseTitle.includes(searchQuery)
                )
                .map((cert) => (
                  <div key={cert.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#152C5B] student-heading-h3">{cert.studentName}</h4>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">{cert.courseTitle}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                          cert.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-800 border-rose-500/30'
                        }`}
                      >
                        {cert.status === 'active' ? 'معتمدة 🟢' : 'ملغاة 🔴'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="liquid-glass-inset p-2 rounded-lg border border-white/60">
                        <span className="block text-slate-500 font-bold">كود التوثيق</span>
                        <span className="font-mono font-bold text-[#173A7C]">{cert.code}</span>
                      </div>
                      <div className="liquid-glass-inset p-2 rounded-lg border border-white/60">
                        <span className="block text-slate-500 font-bold">التقدير</span>
                        <span className="font-black text-emerald-700">{cert.grade}</span>
                      </div>
                      <div className="liquid-glass-inset p-2 rounded-lg border border-white/60">
                        <span className="block text-slate-500 font-bold">تاريخ الإصدار</span>
                        <span className="font-bold text-slate-600">{cert.issueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={cert.imageUrl || '/1.png'}
                        download={`شهادة_${cert.code}.png`}
                        className="flex-1 py-2 rounded-lg bg-[#173A7C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل الشهادة</span>
                      </a>
                      <button
                        onClick={() => handleToggleStatus(cert.id)}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-rose-50 hover:text-rose-600"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CERTIFICATE VISUAL DESIGNER & STUDIO MODAL ── */}
      <AnimatePresence>
        {isDesignerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-[family-name:var(--font-cairo)]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl bg-white text-slate-900 rounded-2xl sm:rounded-3xl border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/15 text-amber-300 font-black shadow-md">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-base sm:text-lg">
                      {editingTemplateId ? 'استوديو تعديل وتخصيص قالب الشهادة' : 'استوديو تصميم قالب شهادة جديد'}
                    </h2>
                    <p className="text-xs text-blue-100 font-bold">
                      تحكم كامل في الخلفيات والنصوص والأختام مع معاينة حية وحفظ فوري
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDesignerModalOpen(false)}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Body (Split into Controls on Left & Live Preview on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
                {/* 1. Left Form Controls (5 cols) */}
                <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-l border-slate-200 space-y-5 overflow-y-auto bg-slate-50/70">
                  {/* Designer Sub-Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDesignerActiveTab('bg')}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        designerActiveTab === 'bg'
                          ? 'bg-white text-[#173A7C] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>الخلفية والدورة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignerActiveTab('text')}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        designerActiveTab === 'text'
                          ? 'bg-white text-[#173A7C] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>النصوص والعناوين</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignerActiveTab('signatories')}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        designerActiveTab === 'signatories'
                          ? 'bg-white text-[#173A7C] shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Stamp className="w-3.5 h-3.5" />
                      <span>الأختام والتوقيعات</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveTemplate} id="designer-form" className="space-y-4 text-xs font-bold">
                    {/* TAB 1: Background & Course */}
                    {designerActiveTab === 'bg' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">اسم القالب الداخلي في النظام</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: قالب دبلوم الأمن السيبراني المعتمد"
                            value={designerForm.name || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, name: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">ربط القالب بالمساق / الدورة التدريبية</label>
                          <select
                            value={designerForm.courseTitle || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, courseTitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                          >
                            {availableCourses.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="كافة المساقات والدورات التدريبية">كافة المساقات والدورات التدريبية</option>
                          </select>
                        </div>

                        {/* Background Selection / Upload */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <label className="text-slate-700 block">خلفية وإطار الشهادة</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setDesignerForm({ ...designerForm, bgType: 'image', imageUrl: '/1.png' })}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                                designerForm.imageUrl === '/1.png'
                                  ? 'border-[#173A7C] bg-[#173A7C]/10 text-[#173A7C]'
                                  : 'border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              <div className="w-7 h-5 rounded bg-amber-100 border border-amber-300 shrink-0" />
                              <span className="truncate">الإطار الكلاسيكي الملكي (1)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDesignerForm({ ...designerForm, bgType: 'image', imageUrl: '/2.png' })}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                                designerForm.imageUrl === '/2.png'
                                  ? 'border-[#173A7C] bg-[#173A7C]/10 text-[#173A7C]'
                                  : 'border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              <div className="w-7 h-5 rounded bg-emerald-100 border border-emerald-300 shrink-0" />
                              <span className="truncate">الإطار المعتمد الأخضر (2)</span>
                            </button>
                          </div>

                          {/* Upload Custom Background */}
                          <div className="pt-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={isUploadingBg}
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-[#173A7C]/40 hover:border-[#173A7C] bg-white text-[#173A7C] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-[#173A7C]/5 disabled:opacity-50"
                            >
                              {isUploadingBg ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>جاري رفع صورة الخلفية...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>رفع صورة/تصميم إطار مخصص من جهازك (A4)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={designerForm.autoIssue || false}
                              onChange={(e) => setDesignerForm({ ...designerForm, autoIssue: e.target.checked })}
                              className="w-4 h-4 accent-[#173A7C] rounded cursor-pointer"
                            />
                            <span className="text-slate-800">
                              تفعيل الإصدار التلقائي فور إكمال المتدرب للدورة 100%
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Text & Statements */}
                    {designerActiveTab === 'text' && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">عنوان الشهادة الرئيسي</label>
                          <input
                            type="text"
                            value={designerForm.headerTitle || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, headerTitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">المسمى الثانوي بالإنجليزية</label>
                          <input
                            type="text"
                            value={designerForm.subtitle || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, subtitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] transition-all font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">صيغة التصدير والتهنئة</label>
                          <input
                            type="text"
                            value={designerForm.statement || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, statement: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">نص الإنجاز والاعتماد</label>
                          <textarea
                            rows={3}
                            value={designerForm.bodyText || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, bodyText: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] transition-all resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-700 block">اسم الجهة المانحة</label>
                          <input
                            type="text"
                            value={designerForm.issuerName || ''}
                            onChange={(e) => setDesignerForm({ ...designerForm, issuerName: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#173A7C] transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Signatories & Seals */}
                    {designerActiveTab === 'signatories' && (
                      <div className="space-y-3.5">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-slate-500 font-bold block text-[11px]">المعتمد الأول (اليمين)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="المسمى الوظيفي"
                              value={designerForm.signatory1Title || ''}
                              onChange={(e) => setDesignerForm({ ...designerForm, signatory1Title: e.target.value })}
                              className="p-2 rounded-lg border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="اسم المعتمد"
                              value={designerForm.signatory1Name || ''}
                              onChange={(e) => setDesignerForm({ ...designerForm, signatory1Name: e.target.value })}
                              className="p-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-slate-500 font-bold block text-[11px]">المعتمد الثاني (اليسار)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="المسمى الوظيفي"
                              value={designerForm.signatory2Title || ''}
                              onChange={(e) => setDesignerForm({ ...designerForm, signatory2Title: e.target.value })}
                              className="p-2 rounded-lg border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="اسم المعتمد"
                              value={designerForm.signatory2Name || ''}
                              onChange={(e) => setDesignerForm({ ...designerForm, signatory2Name: e.target.value })}
                              className="p-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={designerForm.showInstituteSeal || false}
                              onChange={(e) => setDesignerForm({ ...designerForm, showInstituteSeal: e.target.checked })}
                              className="w-4 h-4 accent-[#173A7C] rounded cursor-pointer"
                            />
                            <span className="text-slate-800">إظهار ختم المعهد الرسمي المذهب</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={designerForm.showNationalSeal || false}
                              onChange={(e) => setDesignerForm({ ...designerForm, showNationalSeal: e.target.checked })}
                              className="w-4 h-4 accent-[#173A7C] rounded cursor-pointer"
                            />
                            <span className="text-slate-800">إظهار شارة اعتماد المركز الوطني NELC</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={designerForm.showQrCode || false}
                              onChange={(e) => setDesignerForm({ ...designerForm, showQrCode: e.target.checked })}
                              className="w-4 h-4 accent-[#173A7C] rounded cursor-pointer"
                            />
                            <span className="text-slate-800">إظهار كود التحقق الرقمي الذكي (QR Code)</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* 2. Right Live Canvas Preview (7 cols) */}
                <div className="lg:col-span-7 p-5 sm:p-6 bg-slate-900 flex flex-col items-center justify-center space-y-4">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 font-bold px-2">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-4 h-4" />
                      <span>معاينة حية ومباشرة لحظياً (A4 Landscape)</span>
                    </span>
                    <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded font-mono">
                      دقة الطباعة 300 DPI
                    </span>
                  </div>

                  {/* Certificate Live Render Canvas */}
                  <div className="w-full aspect-[1.414/1] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-center select-none">
                    {/* Background template frame */}
                    {designerForm.imageUrl && (
                      <img
                        src={designerForm.imageUrl}
                        alt="Background frame"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90"
                      />
                    )}

                    {/* Top accreditation bar */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-700 font-bold">
                      <div className="text-right">
                        <span className="font-black text-[#173A7C] block text-xs">{designerForm.issuerName}</span>
                        <span className="text-slate-500">سجل اعتماد رقم: 2026/88421</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {designerForm.showNationalSeal && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-black">
                            معتمد رسمياً
                          </span>
                        )}
                        <img src="/logo.webp" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                      </div>
                    </div>

                    {/* Certificate Core Content */}
                    <div className="relative z-10 space-y-2 sm:space-y-3 my-auto py-2">
                      <h2 className="text-base sm:text-xl font-black text-[#173A7C] tracking-wide">
                        {designerForm.headerTitle || 'شهادة إتمام وتفوق معتمدة'}
                      </h2>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                        {designerForm.subtitle || 'CERTIFICATE OF ACHIEVEMENT'}
                      </p>

                      <div className="pt-1">
                        <p className="text-[10px] sm:text-xs text-slate-600 font-bold">
                          {designerForm.statement || 'يشهد معهد النبض المستدام بأن المتدرب/ـة:'}
                        </p>
                        <div className="my-1.5 inline-block border-b-2 border-[#173A7C] pb-1 px-8">
                          <span className="text-sm sm:text-lg font-black text-[#152C5B]">
                            أحمد بن محمد السالم
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[11px] text-slate-700 font-bold max-w-md mx-auto leading-relaxed">
                          {designerForm.bodyText}
                        </p>
                        <div className="mt-1">
                          <span className="text-[10px] sm:text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                            {designerForm.courseTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Signatures & QR */}
                    <div className="relative z-10 flex items-end justify-between pt-2 border-t border-slate-300/60 text-[8px] sm:text-[10px] text-slate-700">
                      <div className="text-right space-y-0.5">
                        <span className="text-slate-500 block">{designerForm.signatory1Title}</span>
                        <span className="font-black text-slate-900 block">{designerForm.signatory1Name}</span>
                        <span className="text-emerald-700 font-serif italic block text-[9px]">توقيع إلكتروني موثق ✔</span>
                      </div>

                      {designerForm.showQrCode && (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shadow-xs">
                            <QrCode className="w-full h-full text-slate-800" />
                          </div>
                          <span className="font-mono text-[7px] sm:text-[8px] text-slate-500 mt-0.5">
                            SA-TTI-2026-98421
                          </span>
                        </div>
                      )}

                      <div className="text-left space-y-0.5">
                        <span className="text-slate-500 block">{designerForm.signatory2Title}</span>
                        <span className="font-black text-slate-900 block">{designerForm.signatory2Name}</span>
                        <span className="text-emerald-700 font-serif italic block text-[9px]">توقيع إلكتروني موثق ✔</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDesignerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  form="designer-form"
                  disabled={isSavingTemplate}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#173A7C] hover:from-[#173A7C] hover:to-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-700/25 flex items-center gap-2 cursor-pointer transition-all border border-white/20 disabled:opacity-50"
                >
                  {isSavingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ القالب فورياً...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ القالب واعتماده فوراً 💾</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PREVIEW CERTIFICATE TEMPLATE MODAL ── */}
      <AnimatePresence>
        {isPreviewModalOpen && previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-white/20 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
                <h3 className="font-black text-sm">{previewTemplate.name}</h3>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-[1.414/1] rounded-xl overflow-hidden bg-slate-950 border border-white/20 shadow-inner">
                <img
                  src={previewTemplate.imageUrl || '/1.png'}
                  alt={previewTemplate.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold pt-2">
                <span>المساق: {previewTemplate.courseTitle}</span>
                <button
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleEditTemplate(previewTemplate);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#173A7C] text-white font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل هذا القالب</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MANUAL CERTIFICATE ISSUANCE MODAL ── */}
      <AnimatePresence>
        {isIssuingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-2xl border border-white/80 p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إصدار شهادة معتمدة جديدة</h3>
                    <p className="text-xs text-slate-500 font-bold">توليد رمز توثيق رقمي فوري وحفظ بالسجل الدائم</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsIssuingModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIssueManualCertificate} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">اسم المتدرب المكتوب بالشهادة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عبدالله الشمري"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">المساق أو الدبلوم التدريبي</label>
                  <select
                    value={selectedCourseForIssue}
                    onChange={(e) => setSelectedCourseForIssue(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all"
                  >
                    {availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">قالب التصميم المعتمد للإصدار</label>
                  <select
                    value={selectedTemplateForIssue}
                    onChange={(e) => setSelectedTemplateForIssue(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} ({tpl.courseTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">التقدير النهائي</label>
                    <input
                      type="text"
                      value={newIssueGrade}
                      onChange={(e) => setNewIssueGrade(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">عدد الساعات المعتمدة</label>
                    <input
                      type="text"
                      value={newIssueHours}
                      onChange={(e) => setNewIssueHours(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsIssuingModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingIssue}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-500/25 cursor-pointer transition-all border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingIssue ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الإصدار والتوثيق...</span>
                      </>
                    ) : (
                      <span>إصدار وتوثيق الشهادة ⚡</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
