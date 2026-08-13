'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export interface CertificateData {
  id: string;
  code: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  issuer: string;
  grade: string;
  hours: string;
  imageUrl?: string;
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

  if (!isOpen) return null;

  // Use the assigned official certificate image or fallback to /1.png
  const activeCertificateImg = initialData.imageUrl || '/1.png';

  // 🚀 Direct Instant File Download of the Official Admin-Issued Certificate Image
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch image blob for direct clean download
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
      // Fallback direct link download
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 font-[family-name:var(--font-cairo)]" dir="rtl">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-[32px] border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#0B132B] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#5CB07C] text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-white">الشهادة الأكاديمية المعتمدة</h2>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  موثقة بالمركز الوطني
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-0.5">{initialData.courseTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Canvas Viewport */}
        <div className="p-4 sm:p-8 bg-slate-950 overflow-y-auto flex flex-col items-center justify-center space-y-6 flex-1">
          
          {/* High-Resolution Official Certificate Preview Frame */}
          <div className="w-full max-w-4xl relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-slate-900 group">
            <img
              src={activeCertificateImg}
              alt={`شهادة ${initialData.studentName}`}
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </div>

          {/* Verification & Metadata Ribbon */}
          <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">اسم المتدرب</span>
              <span className="font-black text-white text-sm block">{initialData.studentName}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">رمز التوثيق</span>
              <span className="font-mono font-black text-amber-400 text-sm block">{initialData.code}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">تاريخ الإصدار</span>
              <span className="font-bold text-white text-xs block">{initialData.issueDate}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[10px] block">التقدير النهائي</span>
              <span className="font-black text-emerald-400 text-xs block">{initialData.grade} ({initialData.hours})</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#0B132B] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>هذه الشهادة رسمية ومعتمدة صادرة من إدارة معهد النبض المستدام العالي للتدريب.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              إغلاق المعاينة
            </button>

            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-[#5CB07C] to-emerald-500 hover:from-[#5CB07C] hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 border border-emerald-300/40"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل الشهادة الرسمية مباشرة ⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
