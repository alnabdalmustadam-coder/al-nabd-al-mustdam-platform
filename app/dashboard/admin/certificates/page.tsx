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
  EyeOff,
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
  Move,
  AlignCenter,
  AlignRight,
  AlignLeft,
  Underline,
  Grid,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Sparkle,
} from 'lucide-react';
import {
  CertificateTemplate,
  IssuedCertificate,
  CertificateCanvasElement,
  DEFAULT_CERTIFICATE_ELEMENTS,
} from '@/types/certificates';

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

  // Visual Drag & Drop Canvas State
  const [canvasElements, setCanvasElements] = useState<CertificateCanvasElement[]>(DEFAULT_CERTIFICATE_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('el-student-name');
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [resizingState, setResizingState] = useState<{
    elementId: string;
    handle: 'nw' | 'ne' | 'se' | 'sw';
    startX: number;
    startY: number;
    initialFontSize?: number;
    initialWidth?: number;
  } | null>(null);
  const [showLayersDrawer, setShowLayersDrawer] = useState<boolean>(false);
  const [showGridGuides, setShowGridGuides] = useState<boolean>(false);
  const [snapGuidelineX, setSnapGuidelineX] = useState<number | null>(null);
  const [sampleStudentIdx, setSampleStudentIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sample Previews for live canvas testing
  const SAMPLE_PREVIEWS = [
    {
      studentName: 'أحمد بن محمد السالم',
      courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
      certCode: 'SA-TTI-2026-98421',
      grade: 'ممتاز مرتفع (%98)',
      hours: '40 ساعة تدريبية',
      issueDate: '15 مايو 2026',
    },
    {
      studentName: 'سارة بنت عبدالله العتيبي',
      courseTitle: 'دورات ادخال بيانات ومعالجة نصوص',
      certCode: 'SA-TTI-2026-44109',
      grade: 'ممتاز (%95)',
      hours: '30 ساعة تدريبية',
      issueDate: '28 يونيو 2026',
    },
    {
      studentName: 'د. فيصل بن خالد القحطاني',
      courseTitle: 'دبلوم الأمن السيبراني والذكاء الاصطناعي',
      certCode: 'SA-TTI-2026-11880',
      grade: 'مرتبة الشرف الأولى (%100)',
      hours: '60 ساعة تدريبية',
      issueDate: '10 أغسطس 2026',
    },
  ];

  // Designer Form State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [designerActiveTab, setDesignerActiveTab] = useState<'elements' | 'inspector' | 'bg'>('elements');
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
    setCanvasElements([...DEFAULT_CERTIFICATE_ELEMENTS]);
    setSelectedElementId('el-student-name');
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
    setDesignerActiveTab('elements');
    setIsDesignerModalOpen(true);
  };

  // Open Designer for Existing Template
  const handleEditTemplate = (tpl: CertificateTemplate) => {
    setEditingTemplateId(tpl.id);
    setDesignerForm({ ...tpl });
    if (tpl.elementsLayout && tpl.elementsLayout.length > 0) {
      setCanvasElements([...tpl.elementsLayout]);
    } else {
      setCanvasElements([...DEFAULT_CERTIFICATE_ELEMENTS]);
    }
    setSelectedElementId('el-student-name');
    setDesignerActiveTab('elements');
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
        elementsLayout: canvasElements,
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

  // Canvas Element Helpers & Handlers
  const resolveElementText = (el: CertificateCanvasElement) => {
    const sample = SAMPLE_PREVIEWS[sampleStudentIdx] || SAMPLE_PREVIEWS[0];
    let text = el.content || '';
    text = text.replace(/{student_name}/g, sample.studentName);
    text = text.replace(/{course_title}/g, designerForm.courseTitle || sample.courseTitle);
    text = text.replace(/{cert_code}/g, sample.certCode);
    text = text.replace(/{grade}/g, sample.grade);
    text = text.replace(/{hours}/g, sample.hours);
    text = text.replace(/{issue_date}/g, sample.issueDate);
    text = text.replace(/{header_title}/g, designerForm.headerTitle || 'شهادة إتمام وتفوق معتمدة');
    text = text.replace(/{subtitle}/g, designerForm.subtitle || 'CERTIFICATE OF ACHIEVEMENT');
    text = text.replace(/{issuer_name}/g, designerForm.issuerName || 'معهد النبض المستدام العالي للتدريب');
    return text;
  };

  const handleSelectElement = (id: string) => {
    setSelectedElementId(id);
    setDesignerActiveTab('inspector');
  };

  const handleUpdateElement = (id: string, patch: Partial<CertificateCanvasElement>) => {
    setCanvasElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...patch } : el))
    );
  };

  const handleToggleVisibility = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCanvasElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible: !el.visible } : el))
    );
  };

  const handleDuplicateElement = (id: string) => {
    const target = canvasElements.find((e) => e.id === id);
    if (!target) return;
    const newEl: CertificateCanvasElement = {
      ...target,
      id: `el-custom-${Date.now()}`,
      label: `${target.label} (نسخة)`,
      x: Math.min(92, target.x + 4),
      y: Math.min(92, target.y + 4),
    };
    setCanvasElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    setDesignerActiveTab('inspector');
    showToast('تم تكرار العنصر بنجاح ✨');
  };

  const handleDeleteElement = (id: string) => {
    setCanvasElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
      setDesignerActiveTab('elements');
    }
    showToast('تم حذف العنصر من القالب');
  };

  const handleAddNewCustomText = () => {
    const newId = `el-text-${Date.now()}`;
    const newEl: CertificateCanvasElement = {
      id: newId,
      type: 'custom_text',
      label: `نص مخصص #${canvasElements.length + 1}`,
      content: 'نص إضافي مخصص بالشهادة',
      x: 50,
      y: 50,
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'cairo',
      color: '#173A7C',
      textAlign: 'center',
      visible: true,
    };
    setCanvasElements((prev) => [...prev, newEl]);
    setSelectedElementId(newId);
    setDesignerActiveTab('inspector');
    showToast('تمت إضافة حقل نصي جديد إلى منتصف الشهادة 🎯');
  };

  const handleResetLayout = () => {
    if (!window.confirm('هل تريد استعادة الترتيب والمواقع الافتراضية لعناصر الشهادة؟')) return;
    setCanvasElements([...DEFAULT_CERTIFICATE_ELEMENTS]);
    setSelectedElementId('el-student-name');
    showToast('تمت استعادة المواقع الافتراضية بنجاح 🔄');
  };

  const handleCenterElementX = (id: string) => {
    handleUpdateElement(id, { x: 50 });
    showToast('تم توسيط العنصر أفقياً 🎯');
  };

  // Pointer Dragging & Direct Mouse Resizing on Visual Canvas
  const handlePointerDownElement = (e: React.PointerEvent, elementId: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (_) {}
    setSelectedElementId(elementId);
    setDraggingElementId(elementId);
  };

  const handlePointerDownResize = (
    e: React.PointerEvent,
    elementId: string,
    handle: 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (_) {}
    const el = canvasElements.find((item) => item.id === elementId);
    if (!el) return;

    setSelectedElementId(elementId);
    setResizingState({
      elementId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialFontSize: el.fontSize || 16,
      initialWidth: el.width || 60,
    });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    // 1. Direct Mouse Resizing
    if (resizingState) {
      const deltaX = e.clientX - resizingState.startX;
      const deltaY = e.clientY - resizingState.startY;

      let distanceDelta = 0;
      if (resizingState.handle === 'se') {
        distanceDelta = (deltaX + deltaY) / 2;
      } else if (resizingState.handle === 'sw') {
        distanceDelta = (-deltaX + deltaY) / 2;
      } else if (resizingState.handle === 'ne') {
        distanceDelta = (deltaX - deltaY) / 2;
      } else if (resizingState.handle === 'nw') {
        distanceDelta = (-deltaX - deltaY) / 2;
      }

      const targetEl = canvasElements.find((el) => el.id === resizingState.elementId);
      if (!targetEl) return;

      if (targetEl.type === 'seal' || targetEl.type === 'qr' || targetEl.type === 'badge') {
        const newWidth = Math.max(
          28,
          Math.min(220, Math.round((resizingState.initialWidth || 60) + distanceDelta * 1.1))
        );
        handleUpdateElement(targetEl.id, { width: newWidth, height: newWidth });
      } else {
        const newFontSize = Math.max(
          9,
          Math.min(64, Math.round((resizingState.initialFontSize || 16) + distanceDelta / 3.2))
        );
        handleUpdateElement(targetEl.id, { fontSize: newFontSize });
      }
      return;
    }

    // 2. Dragging Position
    if (!draggingElementId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    let newY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Bounding constraints
    newX = Math.max(4, Math.min(96, newX));
    newY = Math.max(4, Math.min(96, newY));

    // Snapping guideline to horizontal center (50%)
    if (Math.abs(newX - 50) <= 1.8) {
      newX = 50;
      setSnapGuidelineX(50);
    } else {
      setSnapGuidelineX(null);
    }

    setCanvasElements((prev) =>
      prev.map((el) => (el.id === draggingElementId ? { ...el, x: newX, y: newY } : el))
    );
  };

  const handleCanvasPointerUp = () => {
    if (draggingElementId) {
      setDraggingElementId(null);
      setSnapGuidelineX(null);
    }
    if (resizingState) {
      setResizingState(null);
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
    formData.append('templateId', editingTemplateId || `draft-${Date.now()}`);
    formData.append('existingImageUrl', designerForm.imageUrl || '');

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
      <div className="premium-tabs flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setSelectedTab('templates')}
          className={`premium-tab px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'templates'
              ? 'bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="premium-tab-label">قوالب الشهادات والتصاميم</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('registry')}
          className={`premium-tab px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            selectedTab === 'registry'
              ? 'bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span className="premium-tab-label">سجل الشهادات الصادرة</span>
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

      {/* ── CERTIFICATE VISUAL DRAG & DROP CANVAS STUDIO MODAL ── */}
      <AnimatePresence>
        {isDesignerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-[family-name:var(--font-cairo)]"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-full max-w-6xl bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto"
            >
              {/* ── 1. CLEAN TOP HEADER BAR ── */}
              <div className="p-3 sm:p-4 bg-slate-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                {/* Right: Close & Template Name */}
                <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                  <button
                    type="button"
                    onClick={() => setIsDesignerModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={designerForm.name || ''}
                      onChange={(e) => setDesignerForm({ ...designerForm, name: e.target.value })}
                      placeholder="اسم القالب..."
                      className="w-full max-w-[280px] bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-white/20 focus:border-amber-400 outline-none transition-all"
                    />
                    <select
                      value={designerForm.courseTitle || ''}
                      onChange={(e) => setDesignerForm({ ...designerForm, courseTitle: e.target.value })}
                      className="hidden sm:block bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/20 outline-none max-w-[200px] truncate cursor-pointer"
                    >
                      {availableCourses.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                      <option value="كافة الدورات التدريبية" className="bg-slate-900 text-white">
                        كافة الدورات التدريبية
                      </option>
                    </select>
                  </div>
                </div>

                {/* Center: Background Switcher */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setDesignerForm({ ...designerForm, imageUrl: '/1.png' })}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      designerForm.imageUrl === '/1.png'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    الإطار الملكي (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignerForm({ ...designerForm, imageUrl: '/2.png' })}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      designerForm.imageUrl === '/2.png'
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    الإطار الأخضر (2)
                  </button>
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
                    className="px-2.5 py-1 rounded-lg font-bold text-blue-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="رفع صورة إطار مخصص"
                  >
                    {isUploadingBg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden md:inline">رفع إطار</span>
                  </button>
                </div>

                {/* Left: Reset & Save Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetLayout}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="إعادة ضبط المواقع الافتراضية"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-400/30 disabled:opacity-50"
                  >
                    {isSavingTemplate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>حفظ القالب 💾</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── 2. SMART FLOATING CONTEXT TOOLBAR (CANVA-STYLE) ── */}
              {(() => {
                const currentEl = canvasElements.find((e) => e.id === selectedElementId && e.visible);

                return (
                  <div className="bg-slate-950/90 border-b border-white/10 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                    {currentEl ? (
                      <div className="w-full flex flex-wrap items-center justify-between gap-3">
                        {/* Right: Quick text editor / tags */}
                        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                          {currentEl.type === 'qr' ? (
                            <span className="text-slate-400 font-bold flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-amber-400" />
                              <span>رمز التحقق الذكي QR Code</span>
                            </span>
                          ) : currentEl.type === 'seal' || currentEl.type === 'badge' ? (
                            <span className="text-slate-400 font-bold flex items-center gap-1.5">
                              <Stamp className="w-4 h-4 text-amber-400" />
                              <span>ختم / شارة الاعتماد الموثقة</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={currentEl.content || ''}
                                onChange={(e) =>
                                  handleUpdateElement(currentEl.id, { content: e.target.value })
                                }
                                placeholder="نص الحقل..."
                                className="w-full bg-slate-800 border border-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold focus:border-blue-400 outline-none"
                              />
                              {/* Quick variable tags */}
                              <div className="hidden xl:flex items-center gap-1">
                                {[
                                  { label: 'طالب', tag: '{student_name}' },
                                  { label: 'دورة', tag: '{course_title}' },
                                  { label: 'تقدير', tag: '{grade}' },
                                  { label: 'ساعات', tag: '{hours}' },
                                ].map((v) => (
                                  <button
                                    key={v.tag}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateElement(currentEl.id, {
                                        content: (currentEl.content || '') + ' ' + v.tag,
                                      })
                                    }
                                    className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-blue-600 text-[10px] text-slate-300 font-bold transition-colors cursor-pointer"
                                  >
                                    +{v.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Middle: Font, Size, Color & Align Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Font Family (for text) */}
                          {currentEl.fontSize !== undefined && (
                            <select
                              value={currentEl.fontFamily || 'cairo'}
                              onChange={(e) =>
                                handleUpdateElement(currentEl.id, { fontFamily: e.target.value as any })
                              }
                              className="bg-slate-800 text-slate-200 px-2 py-1 rounded-lg border border-slate-700 text-xs font-bold cursor-pointer"
                            >
                              <option value="cairo">خط القاهرة (Cairo)</option>
                              <option value="amiri">خط النسخ (Amiri)</option>
                              <option value="tajawal">خط تجوال (Tajawal)</option>
                              <option value="alexandria">خط الإسكندرية</option>
                            </select>
                          )}

                          {/* Font Size Stepper */}
                          {currentEl.fontSize !== undefined ? (
                            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateElement(currentEl.id, {
                                    fontSize: Math.max(9, (currentEl.fontSize || 14) - 1),
                                  })
                                }
                                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-black cursor-pointer"
                                title="تصغير الخط"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-amber-300 min-w-[36px] text-center">
                                {currentEl.fontSize}px
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateElement(currentEl.id, {
                                    fontSize: Math.min(64, (currentEl.fontSize || 14) + 1),
                                  })
                                }
                                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-black cursor-pointer"
                                title="تكبير الخط"
                              >
                                +
                              </button>
                            </div>
                          ) : currentEl.width !== undefined ? (
                            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  const nw = Math.max(30, (currentEl.width || 60) - 5);
                                  handleUpdateElement(currentEl.id, { width: nw, height: nw });
                                }}
                                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-black cursor-pointer"
                                title="تصغير الحجم"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-amber-300 min-w-[40px] text-center">
                                {currentEl.width}px
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nw = Math.min(200, (currentEl.width || 60) + 5);
                                  handleUpdateElement(currentEl.id, { width: nw, height: nw });
                                }}
                                className="px-2 py-1 hover:bg-slate-700 text-slate-300 font-black cursor-pointer"
                                title="تكبير الحجم"
                              >
                                +
                              </button>
                            </div>
                          ) : null}

                          {/* Bold Toggle */}
                          {currentEl.fontSize !== undefined && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateElement(currentEl.id, {
                                  fontWeight: currentEl.fontWeight === 'bold' || currentEl.fontWeight === 'black' ? 'normal' : 'bold',
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-colors cursor-pointer ${
                                currentEl.fontWeight === 'bold' || currentEl.fontWeight === 'black'
                                  ? 'bg-blue-600 text-white border-blue-500'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                              title="سُمك عريض"
                            >
                              B
                            </button>
                          )}

                          {/* Text Align */}
                          {currentEl.textAlign !== undefined && (
                            <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateElement(currentEl.id, { textAlign: 'right' })}
                                className={`p-1 rounded cursor-pointer ${
                                  currentEl.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <AlignRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateElement(currentEl.id, { textAlign: 'center' })}
                                className={`p-1 rounded cursor-pointer ${
                                  currentEl.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <AlignCenter className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateElement(currentEl.id, { textAlign: 'left' })}
                                className={`p-1 rounded cursor-pointer ${
                                  currentEl.textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                <AlignLeft className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Color Palette Dots */}
                          {currentEl.color !== undefined && (
                            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1 rounded-lg">
                              {['#173A7C', '#152C5B', '#B45309', '#065F46', '#1E293B', '#B91C1C'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateElement(currentEl.id, { color: c })}
                                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                    currentEl.color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                              <input
                                type="color"
                                value={currentEl.color || '#173A7C'}
                                onChange={(e) => handleUpdateElement(currentEl.id, { color: e.target.value })}
                                className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                                title="اختر لوناً مخصصاً"
                              />
                            </div>
                          )}
                        </div>

                        {/* Left: Quick Actions (Center, Duplicate, Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCenterElementX(currentEl.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="توسيط العنصر أفقياً في منتصف الشهادة"
                          >
                            <AlignCenter className="w-3 h-3" />
                            <span>توسيط 🎯</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateElement(currentEl.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                            title="تكرار العنصر"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteElement(currentEl.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-colors cursor-pointer"
                            title="حذف العنصر"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* If No Element Selected: Helpful Tips & Add Button */
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>اضغط على أي نص أو ختم لتحريكه، واسحب زوايا المربع بالماوس لتكبير وتصغير الحجم مباشرة.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddNewCustomText}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة نص جديد</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── 3. MAIN INTERACTIVE CANVAS VIEWPORT ── */}
              <div className="relative flex-1 bg-slate-950 p-4 sm:p-8 flex items-center justify-center overflow-auto min-h-[460px] select-none">
                {/* ── THE A4 CERTIFICATE CANVAS ── */}
                <div
                  ref={canvasRef}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  className="w-full max-w-[820px] aspect-[1.414/1] bg-white rounded-xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-amber-400/40 relative overflow-hidden text-slate-900 select-none touch-none cursor-default"
                  style={{
                    backgroundImage: `url(${designerForm.imageUrl || '/1.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Readability Overlay */}
                  <div className="absolute inset-0 bg-white/60 pointer-events-none" />

                  {/* Grid Guides */}
                  {showGridGuides && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-15"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #173A7C 1px, transparent 1px), linear-gradient(to bottom, #173A7C 1px, transparent 1px)',
                        backgroundSize: '10% 10%',
                      }}
                    />
                  )}

                  {/* Center Snap Guideline */}
                  {snapGuidelineX !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-[1.5px] bg-blue-500 z-30 pointer-events-none shadow-[0_0_6px_rgba(59,130,246,0.9)]"
                      style={{ left: `${snapGuidelineX}%` }}
                    />
                  )}

                  {/* ── DYNAMIC ELEMENTS WITH SLEEK 1PX BOUNDARY & 4 CORNER RESIZE HANDLES ── */}
                  {canvasElements
                    .filter((el) => el.visible)
                    .map((el) => {
                      const isSelected = selectedElementId === el.id;

                      const fontFamilyClass =
                        el.fontFamily === 'amiri'
                          ? 'font-serif'
                          : el.fontFamily === 'tajawal'
                          ? 'font-sans'
                          : el.fontFamily === 'alexandria'
                          ? 'font-mono'
                          : 'font-[family-name:var(--font-cairo)]';

                      return (
                        <div
                          key={el.id}
                          onPointerDown={(e) => handlePointerDownElement(e, el.id)}
                          className={`absolute transition-shadow z-20 group cursor-move ${
                            isSelected
                              ? 'border border-blue-500 bg-blue-500/[0.04] rounded-sm'
                              : 'hover:border hover:border-blue-400/40 hover:bg-black/[0.02] rounded-sm'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            transform: 'translate(-50%, -50%)',
                            textAlign: el.textAlign || 'center',
                            color: el.color || '#173A7C',
                            userSelect: 'none',
                            padding: isSelected ? '2px 4px' : '2px 4px',
                          }}
                        >
                          {/* Selected Element Mini Top Tag */}
                          {isSelected && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap z-30 flex items-center gap-1">
                              <span>{el.label}</span>
                              {el.fontSize && <span className="opacity-80">({el.fontSize}px)</span>}
                            </div>
                          )}

                          {/* 4 Minimalist Corner Resize Handles (Direct Mouse Drag to Scale!) */}
                          {isSelected && (
                            <>
                              {/* Top-Left Corner Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDownResize(e, el.id, 'nw')}
                                className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-blue-600 shadow-sm cursor-nwse-resize hover:scale-125 transition-transform z-30"
                                title="اسحب لتكبير/تصغير الحجم بالماوس"
                              />
                              {/* Top-Right Corner Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDownResize(e, el.id, 'ne')}
                                className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-blue-600 shadow-sm cursor-nesw-resize hover:scale-125 transition-transform z-30"
                                title="اسحب لتكبير/تصغير الحجم بالماوس"
                              />
                              {/* Bottom-Left Corner Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDownResize(e, el.id, 'sw')}
                                className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-blue-600 shadow-sm cursor-nesw-resize hover:scale-125 transition-transform z-30"
                                title="اسحب لتكبير/تصغير الحجم بالماوس"
                              />
                              {/* Bottom-Right Corner Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDownResize(e, el.id, 'se')}
                                className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-blue-600 shadow-sm cursor-nwse-resize hover:scale-125 transition-transform z-30"
                                title="اسحب لتكبير/تصغير الحجم بالماوس"
                              />
                            </>
                          )}

                          {/* Element Render Body */}
                          {el.type === 'qr' ? (
                            <div
                              className="bg-white p-1 rounded border border-slate-300 shadow-xs flex flex-col items-center justify-center pointer-events-none"
                              style={{ width: `${el.width || 60}px`, height: `${el.height || 60}px` }}
                            >
                              <QrCode className="w-full h-full text-slate-800" />
                              <span className="font-mono text-[7px] text-slate-600 mt-0.5 truncate max-w-full font-bold">
                                {SAMPLE_PREVIEWS[sampleStudentIdx].certCode}
                              </span>
                            </div>
                          ) : el.type === 'seal' ? (
                            <div
                              className="rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-white flex flex-col items-center justify-center border-2 border-amber-300 shadow-md text-center pointer-events-none"
                              style={{ width: `${el.width || 75}px`, height: `${el.height || 75}px` }}
                            >
                              <Award className="w-5 h-5 text-amber-200" />
                              <span className="text-[7px] font-black leading-tight mt-0.5">ختم المعهد</span>
                              <span className="text-[6px] opacity-80">معتمد</span>
                            </div>
                          ) : el.type === 'badge' ? (
                            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-xs flex items-center gap-1 font-black text-[10px] pointer-events-none">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{el.content || 'معتمد رسمياً'}</span>
                            </div>
                          ) : el.type === 'signature' ? (
                            <div className="text-center space-y-0.5 min-w-[110px] pointer-events-none">
                              <div className="whitespace-pre-line text-[10px] font-bold text-slate-700">
                                {el.content || 'المشرف الأكاديمي'}
                              </div>
                              <span className="text-emerald-700 font-serif italic block text-[8px]">توقيع إلكتروني موثق ✔</span>
                            </div>
                          ) : (
                            <div
                              className={`whitespace-pre-line leading-snug ${fontFamilyClass} ${
                                el.borderBottom ? 'border-b-2 border-current pb-0.5' : ''
                              }`}
                              style={{
                                fontSize: `${el.fontSize || 14}px`,
                                fontWeight:
                                  el.fontWeight === 'black'
                                    ? 900
                                    : el.fontWeight === 'bold'
                                    ? 700
                                    : el.fontWeight === 'medium'
                                    ? 600
                                    : 400,
                              }}
                            >
                              {resolveElementText(el)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* ── 4. STREAMLINED BOTTOM STATUS & LAYERS BAR ── */}
              <div className="p-3 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                {/* Right: Sample Student Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">معاينة باسم:</span>
                  <select
                    value={sampleStudentIdx}
                    onChange={(e) => setSampleStudentIdx(Number(e.target.value))}
                    className="bg-slate-800 text-amber-300 px-2 py-1 rounded-lg border border-slate-700 text-xs font-bold cursor-pointer"
                  >
                    {SAMPLE_PREVIEWS.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.studentName}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowGridGuides(!showGridGuides)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      showGridGuides
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    شبكة المحاذاة
                  </button>
                </div>

                {/* Left: Layers Drawer Toggle & Auto-Issue Checkbox */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                    <input
                      type="checkbox"
                      checked={designerForm.autoIssue || false}
                      onChange={(e) => setDesignerForm({ ...designerForm, autoIssue: e.target.checked })}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span>إصدار تلقائي عند إكمال 100%</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowLayersDrawer(!showLayersDrawer)}
                    className={`px-3 py-1 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showLayersDrawer
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>الطبقات ({canvasElements.filter((e) => e.visible).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewCustomText}
                    className="px-3 py-1 rounded-lg bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة نص</span>
                  </button>
                </div>
              </div>

              {/* ── 5. OPTIONAL COLLAPSIBLE LAYERS LIST ── */}
              {showLayersDrawer && (
                <div className="p-3 bg-slate-900 border-t border-white/10 max-h-36 overflow-y-auto flex flex-wrap gap-2 text-xs">
                  {canvasElements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 font-black shadow-xs'
                            : el.visible
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                        }`}
                      >
                        <span className="truncate max-w-[130px]">{el.label}</span>
                        <button
                          type="button"
                          onClick={(e) => handleToggleVisibility(el.id, e)}
                          className="text-slate-400 hover:text-white"
                          title={el.visible ? 'إخفاء' : 'إظهار'}
                        >
                          {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
