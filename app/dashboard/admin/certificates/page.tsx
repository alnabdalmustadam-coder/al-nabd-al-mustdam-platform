'use client';

import React, { useState } from 'react';
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
  Filter,
  Sliders,
  Settings,
  RefreshCw,
  Upload,
  UserPlus,
  ChevronLeft,
  X,
} from 'lucide-react';

interface CertificateTemplate {
  id: string;
  name: string;
  courseTitle: string;
  imageUrl: string;
  issuedCount: number;
  autoIssue: boolean;
}

interface IssuedCertificate {
  id: string;
  code: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  hours: string;
  status: 'active' | 'revoked';
  imageUrl: string;
}

export default function AdminCertificatesPage() {
  const [selectedTab, setSelectedTab] = useState<'templates' | 'registry'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIssuingModalOpen, setIsIssuingModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('برنامج القيادة المستدامة والمسؤولية المجتمعية');

  const templates: CertificateTemplate[] = [
    {
      id: 'tpl-1',
      name: 'قالب القيادة المستدامة والمسؤولية',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      imageUrl: '/1.png',
      issuedCount: 4850,
      autoIssue: true,
    },
    {
      id: 'tpl-2',
      name: 'قالب دبلوم التسامح والسلام',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      imageUrl: '/2.png',
      issuedCount: 3200,
      autoIssue: true,
    },
    {
      id: 'tpl-3',
      name: 'القالب الملكي الشرفي Ultra Gold',
      courseTitle: 'كافة المساقات المتقدمة والدبلومات العليا',
      imageUrl: '/1.png',
      issuedCount: 1790,
      autoIssue: false,
    },
  ];

  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([
    {
      id: 'cert-1',
      code: 'SA-TTI-2026-98421',
      studentName: 'عبدالله الشمري',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      issueDate: '15 مايو 2026',
      grade: 'ممتاز مرتفع (%98)',
      hours: '30 ساعة',
      status: 'active',
      imageUrl: '/1.png',
    },
    {
      id: 'cert-2',
      code: 'SA-TTI-2026-44109',
      studentName: 'سارة العتيبي',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      issueDate: '28 يونيو 2026',
      grade: 'ممتاز (%95)',
      hours: '60 ساعة',
      status: 'active',
      imageUrl: '/2.png',
    },
    {
      id: 'cert-3',
      code: 'SA-TTI-2026-11892',
      studentName: 'م. خالد الدوسري',
      courseTitle: 'دبلوم الحوكمة المؤسسية والتميز الأكاديمي',
      issueDate: '10 يوليو 2026',
      grade: 'جيد جداً (%88)',
      hours: '35 ساعة',
      status: 'active',
      imageUrl: '/2.png',
    },
  ]);

  const toggleStatus = (id: string) => {
    setIssuedCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' } : c))
    );
  };

  const handleIssueManualCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newCert: IssuedCertificate = {
      id: `cert-${Date.now()}`,
      code: `SA-TTI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: newStudentName,
      courseTitle: selectedCourse,
      issueDate: '27 يوليو 2026',
      grade: 'ممتاز مرتفع (%99)',
      hours: '30 ساعة',
      status: 'active',
      imageUrl: '/1.png',
    };

    setIssuedCertificates([newCert, ...issuedCertificates]);
    setNewStudentName('');
    setIsIssuingModalOpen(false);
  };

  const totalIssued = templates.reduce((acc, curr) => acc + curr.issuedCount, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-amber-500/8 rounded-full blur-[160px]" />
      </div>

      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-7 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-900 text-[10px] sm:text-xs font-black border border-amber-500/20 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>استوديو المصمم للأدمن • إدارة الشهادات الرسمية</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                مركز تحكم وإصدار الشهادات <span className="inline-block whitespace-nowrap">والاعتمادات 👑</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              رفع القوالب الرسمية المعتمدة، تخصيص أختام التوثيق بالباركود وQR، وإصدار الشهادات الفردية والجماعية بنقرة واحدة.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsIssuingModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>إصدار شهادة جديدة لمتدرب ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي القوالب</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{templates.length} قوالب معتمدة</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">الشهادات الصادرة</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-amber-700">{totalIssued.toLocaleString()} شهادة</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">سجل التوثيق الرقمي</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">مربوط بالـ QR كود 🟢</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">الاعتماد الحكومي</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-[#173A7C]">معتمد NELC / TVTC</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs (Templates vs Issued Registry) - Single Line on Mobile */}
      <div className="liquid-glass-card p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/60 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setSelectedTab('templates')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap ${
            selectedTab === 'templates'
              ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-[#173A7C]'
              : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">قوالب الشهادات ({templates.length})</span>
            <span className="hidden sm:inline">قوالب الشهادات الرسمية ({templates.length})</span>
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('registry')}
          className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap ${
            selectedTab === 'registry'
              ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-[#173A7C]'
              : 'text-slate-600 hover:text-[#173A7C] hover:bg-white/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">الشهادات الصادرة ({issuedCertificates.length})</span>
            <span className="hidden sm:inline">سجل الشهادات الصادرة الموثقة ({issuedCertificates.length})</span>
          </span>
        </button>
      </div>

      {/* ── TAB 1: TEMPLATES MANAGEMENT ── */}
      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl overflow-hidden border border-white/70 space-y-4 relative group student-card-accent"
            >
              <div className="specular-card-reflection" />

              {/* Template Image Header */}
              <div className="aspect-[1.414/1] relative bg-slate-900 overflow-hidden border-b border-[#173A7C]/10">
                <img
                  src={tpl.imageUrl}
                  alt={tpl.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-950/85 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md">
                  {tpl.issuedCount.toLocaleString()} شهادة صادرة
                </span>
              </div>

              <div className="p-4 sm:p-5 pt-1 space-y-3.5">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#152C5B] student-heading-h3 [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-relaxed">{tpl.courseTitle}</p>
                </div>

                <div className="pt-3 border-t border-[#173A7C]/10 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer text-[11px] sm:text-xs">
                    <input
                      type="checkbox"
                      defaultChecked={tpl.autoIssue}
                      className="w-3.5 h-3.5 accent-[#173A7C] rounded cursor-pointer"
                    />
                    <span>الإصدار التلقائي (100%)</span>
                  </label>

                  <button className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-[#173A7C] hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── TAB 2: ISSUED CERTIFICATES REGISTRY TABLE ── */}
      {selectedTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم المتدرب أو كود التوثيق..."
                className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg sm:rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>موثقة بالسجل الوطني للتدريب والتحقق السحابي 24/7</span>
            </div>
          </div>

          {/* Registry Container */}
          <div className="liquid-glass-card rounded-lg sm:rounded-xl overflow-hidden border border-white/70 shadow-lg student-card-accent">
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#173A7C]/5 text-[#173A7C] font-black border-b border-[#173A7C]/10">
                  <tr>
                    <th className="p-4">اسم المتدرب</th>
                    <th className="p-4">المساق التدريبي</th>
                    <th className="p-4">كود التوثيق</th>
                    <th className="p-4">تاريخ الإصدار</th>
                    <th className="p-4">التقدير</th>
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
                        <td className="p-4 text-emerald-700 font-black">{cert.grade}</td>
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
                              onClick={() => toggleStatus(cert.id)}
                              title={cert.status === 'active' ? 'إبطال الشهادة' : 'إعادة تفعيل الشهادة'}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200 bg-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <a
                              href={cert.imageUrl}
                              download={`شهادة_${cert.code}.png`}
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
                        href={cert.imageUrl}
                        download={`شهادة_${cert.code}.png`}
                        className="flex-1 py-2 rounded-lg bg-[#173A7C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل الشهادة</span>
                      </a>
                      <button
                        onClick={() => toggleStatus(cert.id)}
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
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إصدار شهادة معتمدة جديدة</h3>
                    <p className="text-xs text-slate-500 font-bold">توليد رمز توثيق رقمي فوري وتوليد الشهادة</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsIssuingModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition-all"
                  >
                    <option value="برنامج القيادة المستدامة والمسؤولية المجتمعية">برنامج القيادة المستدامة والمسؤولية المجتمعية</option>
                    <option value="دبلوم التسامح والسلام والمواطنة الصالحة">دبلوم التسامح والسلام والمواطنة الصالحة</option>
                    <option value="الشهادة الاحترافية في إدارة الاستدامة البيئية">الشهادة الاحترافية في إدارة الاستدامة البيئية</option>
                  </select>
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
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-500/25 cursor-pointer transition-all border border-white/20"
                  >
                    إصدار وتوثيق الشهادة ⚡
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
