'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Eye,
  FileText,
  CheckCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CertificateBuilderModal, CertificateData } from '@/components/student/certificate-builder-modal';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('المتدرب');
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);

  // Fetch student certificates dynamically from server API
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/certificates', {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.certificates)) {
        setCertificates(data.certificates);
        if (data.studentName && data.studentName !== 'المتدرب') {
          setStudentName(data.studentName);
        }
      }
    } catch (err) {
      console.error('Error fetching student certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenBuilder = (cert: CertificateData) => {
    setSelectedCert(cert);
    setIsBuilderOpen(true);
  };

  const handleDirectDownload = async (cert: CertificateData) => {
    setActiveDownloadId(cert.id);
    try {
      const targetImg = cert.template?.imageUrl || cert.imageUrl || '/1.png';
      const response = await fetch(targetImg);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `شهادة_${cert.studentName.replace(/\s+/g, '_')}_${cert.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Direct download error:', err);
      window.open(cert.template?.imageUrl || cert.imageUrl || '/1.png', '_blank');
    } finally {
      setActiveDownloadId(null);
    }
  };

  const filteredCertificates = certificates.filter(
    (c) =>
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div
              variants={textItemVariants}
              className="student-tag-badge bg-blue-50/90 text-[#173A7C] border border-blue-200/80 shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>سجل الشهادات والاعتمادات الرسمية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              شهاداتي الأكاديمية و<span className="student-name-gradient">المعتمدة</span> 📜
            </motion.h1>

            <motion.p
              variants={textItemVariants}
              className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed"
            >
              معاينة وتحميل شهاداتك الصادرة فوراً مع التوثيق المعتمد بالمركز الوطني على مدار الساعة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 text-emerald-800 text-xs font-black border border-white/80 shadow-xs backdrop-blur-md">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {loading ? 'جاري التحقق...' : `${certificates.length} شهادة صادرة وموثقة`}
              </span>
            </div>

            <button
              onClick={fetchCertificates}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
              title="تحديث قائمة الشهادات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#173A7C]' : ''}`} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search & Filter bar if has certificates */}
      {certificates.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-white/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الدورة أو رمز التوثيق..."
              className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] font-bold"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            إجمالي الشهادات المكتملة: <strong className="text-slate-900">{filteredCertificates.length}</strong>
          </span>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/60 animate-pulse border border-slate-200" />
          ))}
        </div>
      )}

      {/* Empty State with Encouragement to Finish Courses */}
      {!loading && certificates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 border border-emerald-500/20 shadow-lg text-center space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-black text-slate-900">لا توجد شهادات صادرة حتى الآن</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
              أكمل دراسة دروسك واجتز التقييمات بنسبة 100% ليتم إصدار شهادتك الأكاديمية المعتمدة تلقائياً برمز توثيق رسمي وقالب فائق الجودة!
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/student/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black shadow-md shadow-[#173A7C]/20 transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>متابعة دراسة دوراتي التدريبية 🚀</span>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Certificates List */}
      {!loading && filteredCertificates.length > 0 && (
        <motion.div
          variants={sectionFadeVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="space-y-4 sm:space-y-6"
        >
          {filteredCertificates.map((cert, idx) => {
            const certImg = cert.template?.imageUrl || cert.imageUrl || '/1.png';
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 liquid-glass-card liquid-glass-hover space-y-5 sm:space-y-6 student-card-accent transition-all duration-300"
              >
                {/* Glass top highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent z-10" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 sm:gap-7">
                  {/* Official Certificate Thumbnail Preview */}
                  <div
                    onClick={() => handleOpenBuilder(cert)}
                    className="w-full lg:w-64 aspect-[1.414/1] rounded-2xl overflow-hidden border-2 border-slate-200/80 shadow-md relative group cursor-pointer shrink-0 bg-slate-900"
                  >
                    <img
                      src={certImg}
                      alt={cert.courseTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black gap-1.5 backdrop-blur-[2px]">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>معاينة وتكبير الشهادة</span>
                    </div>
                  </div>

                  {/* Certificate Info & Action Controls */}
                  <div className="flex-1 space-y-3.5 sm:space-y-4 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-1"
                          style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0D5C3A]" />
                          <span>شهادة معتمدة موثقة بالمركز الوطني</span>
                        </div>
                        <h3 className="student-heading-h3">{cert.courseTitle}</h3>
                        <p className="student-text-body">
                          {cert.template?.issuerName || cert.issuer || 'معهد النبض المستدام العالي للتدريب'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5 w-full sm:w-64 shrink-0">
                        <button
                          onClick={() => handleOpenBuilder(cert)}
                          className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-xs cursor-pointer hover:shadow-md hover:border-slate-300 whitespace-nowrap active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>عرض تفاصيل وتصميم الشهادة</span>
                        </button>

                        <button
                          onClick={() => handleDirectDownload(cert)}
                          disabled={activeDownloadId === cert.id}
                          className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#173A7C]/20 hover:-translate-y-0.5 border border-blue-400/20 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                        >
                          {activeDownloadId === cert.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                              <span>جاري التحميل...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>تحميل الشهادة مباشرة</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200/50">
                      <div className="p-3.5 rounded-xl border border-slate-200/30 space-y-1 liquid-glass-inner">
                        <span className="text-slate-400 font-bold block text-[10px]">رمز التوثيق</span>
                        <span className="font-mono font-black text-[#173A7C] block text-xs">
                          {cert.code}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200/30 space-y-1 liquid-glass-inner">
                        <span className="text-slate-400 font-bold block text-[10px]">تاريخ الإصدار</span>
                        <span className="font-bold text-slate-800 block text-xs">{cert.issueDate}</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200/30 space-y-1 liquid-glass-inner">
                        <span className="text-slate-400 font-bold block text-[10px]">التقدير العام</span>
                        <span className="font-black text-[#0D5C3A] block text-xs">{cert.grade}</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200/30 space-y-1 liquid-glass-inner">
                        <span className="text-slate-400 font-bold block text-[10px]">الساعات التدريبية</span>
                        <span className="font-bold text-slate-700 block text-xs">{cert.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <CertificateBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          initialData={selectedCert}
        />
      )}
    </div>
  );
}
