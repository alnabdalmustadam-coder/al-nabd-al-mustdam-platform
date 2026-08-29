'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Award,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Eye,
  Printer,
  Copy,
  Check,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CertificateTemplate, CertificateCanvasElement } from '@/types/certificates';

export interface CertificateData {
  id: string;
  code: string;
  studentName: string;
  studentEmail?: string;
  courseTitle: string;
  issueDate: string;
  issuer?: string;
  grade: string;
  hours: string;
  imageUrl?: string;
  template?: CertificateTemplate | null;
  status?: 'active' | 'revoked';
}

interface CertificateViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: CertificateData;
}

export const CertificateBuilderModal: React.FC<CertificateViewerModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'original'>('canvas');
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const tpl = initialData.template;
  const activeCertificateImg = tpl?.imageUrl || initialData.imageUrl || '/1.png';
  const headerTitle = tpl?.headerTitle || 'شهادة إتمام وتفوق معتمدة';
  const subtitle = tpl?.subtitle || 'CERTIFICATE OF COMPLETION & EXCELLENCE';
  const statement = tpl?.statement || 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:';
  const bodyText =
    tpl?.bodyText ||
    'قد اجتاز/ت بنجاح متطلبات البرنامج التدريبي واكتملت كافة ساعاته النظرية والتطبيقية المعتمدة بكفاءة واقتدار.';
  const issuerName = tpl?.issuerName || 'معهد النبض المستدام العالي للتدريب';
  const sig1Title = tpl?.signatory1Title || 'المشرف الأكاديمي والتدريب';
  const sig1Name = tpl?.signatory1Name || 'د. عبدالرحمن الغامدي';
  const sig2Title = tpl?.signatory2Title || 'المدير التنفيذي للمعهد';
  const sig2Name = tpl?.signatory2Name || 'أ. نورة الشمري';
  const showQr = tpl?.showQrCode !== false;
  const showSeal = tpl?.showInstituteSeal !== false;
  const showNatSeal = tpl?.showNationalSeal !== false;
  const accentColor = tpl?.accentColor || '#173A7C';

  // Helper to interpolate dynamic variables in custom drag-and-drop elements
  const resolveElementText = (el: CertificateCanvasElement) => {
    let txt = el.content || '';
    txt = txt.replace(/{student_name}/g, initialData.studentName || 'المتدرب');
    txt = txt.replace(/{course_title}/g, initialData.courseTitle || 'البرنامج التدريبي');
    txt = txt.replace(/{cert_code}/g, initialData.code || 'SA-TTI-000');
    txt = txt.replace(/{grade}/g, initialData.grade || 'ممتاز مرتفع');
    txt = txt.replace(/{hours}/g, initialData.hours || '40 ساعة');
    txt = txt.replace(/{issue_date}/g, initialData.issueDate || '2026/08/29');
    return txt;
  };

  const hasCustomElements = Boolean(tpl?.elementsLayout && tpl.elementsLayout.length > 0);

  // Handle direct file download
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(activeCertificateImg);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `شهادة_${initialData.studentName.replace(/\s+/g, '_')}_${initialData.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Direct download error:', err);
      const link = document.createElement('a');
      link.href = activeCertificateImg;
      link.download = `شهادة_${initialData.code}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle browser print
  const handlePrint = () => {
    window.print();
  };

  // Handle code copy
  const handleCopyCode = () => {
    navigator.clipboard.writeText(initialData.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 font-[family-name:var(--font-cairo)]"
      dir="rtl"
    >
      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl sm:rounded-[32px] border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-[#0B132B] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#5CB07C] text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-sm sm:text-base text-white">الشهادة الأكاديمية المعتمدة</h2>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  موثقة ومعتمدة رسمياً
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-0.5 line-clamp-1">{initialData.courseTitle}</p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'canvas' ? 'bg-[#173A7C] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                التصميم الأكاديمي
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'original' ? 'bg-[#173A7C] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                القالب الكامل
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas Viewport */}
        <div className="p-3 sm:p-6 md:p-8 bg-slate-950 overflow-y-auto flex flex-col items-center justify-center space-y-6 flex-1">
          
          {viewMode === 'canvas' ? (
            /* 🎨 DYNAMIC HIGH-FIDELITY LIVE CERTIFICATE CANVAS */
            <div
              ref={certificateRef}
              id="printable-certificate"
              className="w-full max-w-4xl aspect-[1.414/1] relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-white text-slate-900 select-none"
              style={{
                backgroundImage: `url(${activeCertificateImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Optional Subtle White Overlay if background has text, ensuring crystal-clear readability */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[0.5px] pointer-events-none" />

              {hasCustomElements ? (
                /* ── 1. DYNAMIC DRAG & DROP CUSTOM POSITIONED ELEMENTS ── */
                tpl!.elementsLayout!
                  .filter((el) => el.visible)
                  .map((el) => {
                    const fontFamilyClass =
                      el.fontFamily === 'amiri'
                        ? 'font-serif'
                        : el.fontFamily === 'tajawal'
                        ? 'font-sans'
                        : el.fontFamily === 'changa'
                        ? 'font-mono'
                        : 'font-[family-name:var(--font-cairo)]';

                    return (
                      <div
                        key={el.id}
                        className="absolute z-20"
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          transform: 'translate(-50%, -50%)',
                          textAlign: el.textAlign || 'center',
                          color: el.color || '#173A7C',
                        }}
                      >
                        {el.type === 'qr' ? (
                          <div
                            className="bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex flex-col items-center justify-center"
                            style={{ width: `${el.width || 60}px`, height: `${el.height || 60}px` }}
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                `https://alnabdalmustadam.com/verify?code=${initialData.code}`
                              )}`}
                              alt="QR Code"
                              className="w-full h-full object-contain"
                            />
                            <span className="font-mono text-[7px] text-slate-600 mt-0.5 truncate max-w-full font-bold">
                              {initialData.code}
                            </span>
                          </div>
                        ) : el.type === 'seal' ? (
                          <div
                            className="rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-white flex flex-col items-center justify-center border-2 border-amber-300 shadow-lg text-center"
                            style={{ width: `${el.width || 75}px`, height: `${el.height || 75}px` }}
                          >
                            <Award className="w-5 h-5 text-amber-200" />
                            <span className="text-[7px] font-black leading-tight mt-0.5">ختم المعهد</span>
                            <span className="text-[6px] opacity-80">معتمد</span>
                          </div>
                        ) : el.type === 'badge' ? (
                          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm flex items-center gap-1 font-black text-[10px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{el.content || 'معتمد رسمياً'}</span>
                          </div>
                        ) : el.type === 'signature' ? (
                          <div className="text-center space-y-0.5 min-w-[120px]">
                            <div className="whitespace-pre-line text-[10px] font-bold text-slate-600">
                              {el.content || 'المشرف الأكاديمي'}
                            </div>
                            <span className="text-emerald-700 font-serif italic block text-[9px]">توقيع إلكتروني موثق ✔</span>
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
                  })
              ) : (
                /* ── 2. STRUCTURED DEFAULT HIGH-FIDELITY LAYOUT ── */
                <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10">
                  {/* Top Header Section */}
                  <div className="relative z-10 flex items-start justify-between">
                    {/* Left: QR Code & Verification */}
                    {showQr && (
                      <div className="flex flex-col items-center gap-1 bg-white/90 p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded flex items-center justify-center p-1 border border-slate-300">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              `https://alnabdalmustadam.com/verify?code=${initialData.code}`
                            )}`}
                            alt="QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[7px] sm:text-[9px] font-mono font-black text-slate-600">
                          {initialData.code}
                        </span>
                      </div>
                    )}

                    {/* Center: Official Title */}
                    <div className="text-center flex-1 px-4 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-[9px] sm:text-xs font-black">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>المملكة العربية السعودية • الاعتماد المهني</span>
                      </div>
                      <h1
                        className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight"
                        style={{ color: accentColor }}
                      >
                        {headerTitle}
                      </h1>
                      <p className="text-[9px] sm:text-xs tracking-widest text-slate-500 font-bold uppercase font-sans">
                        {subtitle}
                      </p>
                    </div>

                    {/* Right: National & Institute Seals */}
                    <div className="flex items-center gap-2">
                      {showNatSeal && (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center p-1 border-2 border-emerald-300 shadow-md text-center">
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
                          <span className="text-[6px] sm:text-[7px] font-black leading-tight mt-0.5">المركز الوطني</span>
                        </div>
                      )}
                      {showSeal && (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex flex-col items-center justify-center p-1 border-2 border-amber-300 shadow-md text-center">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                          <span className="text-[6px] sm:text-[7px] font-black leading-tight mt-0.5">ختم المعهد</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Body Section */}
                  <div className="relative z-10 text-center space-y-2 sm:space-y-3.5 my-auto px-4 sm:px-12">
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{statement}</p>

                    {/* Student Full Name Calligraphy Highlight */}
                    <div className="relative inline-block py-1 px-8 sm:px-14">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent rounded-full -skew-y-1" />
                      <h2 className="relative text-xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-wide">
                        {initialData.studentName}
                      </h2>
                    </div>

                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
                      {bodyText}
                    </p>

                    {/* Course Name Banner */}
                    <div className="inline-block px-5 py-1.5 rounded-xl bg-slate-900 text-amber-400 font-black text-xs sm:text-base border border-amber-400/30 shadow-md">
                      {initialData.courseTitle}
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs pt-1 flex-wrap font-bold text-slate-700">
                      <span>
                        التقدير العام: <strong className="text-emerald-700 font-black">{initialData.grade}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        الساعات المعتمدة: <strong className="text-slate-900 font-black">{initialData.hours}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        تاريخ التحرير: <strong className="text-slate-900 font-black">{initialData.issueDate}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Signatures Section */}
                  <div className="relative z-10 pt-4 border-t border-slate-300/80 flex items-end justify-between text-xs px-2 sm:px-6">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">{sig1Title}</span>
                      <div className="h-6 sm:h-8 flex items-center justify-center">
                        <span className="font-serif italic text-sm sm:text-base font-bold text-slate-700">
                          {sig1Name}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-slate-900 block">{sig1Name}</span>
                    </div>

                    <div className="text-center hidden sm:block">
                      <span className="text-[9px] font-bold text-slate-500 block">{issuerName}</span>
                      <span className="text-[9px] font-black text-emerald-800 block">
                        معتمد بترخيص المنشأة التدريبية برقم 10293847
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">{sig2Title}</span>
                      <div className="h-6 sm:h-8 flex items-center justify-center">
                        <span className="font-serif italic text-sm sm:text-base font-bold text-slate-700">
                          {sig2Name}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-slate-900 block">{sig2Name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 🖼️ ORIGINAL IMAGE PREVIEW */
            <div className="w-full max-w-4xl relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-slate-900 group">
              <img
                src={activeCertificateImg}
                alt={`شهادة ${initialData.studentName}`}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          )}

          {/* Verification & Metadata Ribbon */}
          <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">اسم المتدرب</span>
              <span className="font-black text-white text-sm block">{initialData.studentName}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">رمز التوثيق</span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 font-mono font-black text-amber-400 text-xs sm:text-sm hover:text-amber-300 transition-colors cursor-pointer"
                title="انقر لنسخ رمز التوثيق"
              >
                <span>{initialData.code}</span>
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">تاريخ الإصدار</span>
              <span className="font-bold text-white text-xs block">{initialData.issueDate}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">التقدير النهائي</span>
              <span className="font-black text-emerald-400 text-xs block">
                {initialData.grade} ({initialData.hours})
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#0B132B] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>هذه الشهادة رسمية ومعتمدة صادرة من إدارة {issuerName}.</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto flex-wrap justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية</span>
            </button>

            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-[#5CB07C] to-emerald-500 hover:from-[#5CB07C] hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 border border-emerald-300/40"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري التجهيز...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل الشهادة المعتمدة ⚡</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
