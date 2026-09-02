'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, X, RefreshCw } from 'lucide-react';

interface DeviceImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: 'articles' | 'services' | 'courses' | 'general';
  slug?: string;
  label?: string;
  recommendedSize?: string;
  aspectRatio?: 'video' | 'square' | 'banner' | 'auto';
  className?: string;
}

/**
 * Client-side WebP compression helper using HTML5 Canvas
 */
async function compressToWebPClient(file: File, maxDimension = 1400, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل معالجة الصورة'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('تعذر إنشاء سياق المعالجة'));
        }

        // Draw and export as WebP
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('فشل تحويل الصورة إلى WebP'));
          },
          'image/webp',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function DeviceImageUploader({
  value,
  onChange,
  folder = 'general',
  slug = '',
  label = 'صورة الغلاف المعتمدة',
  recommendedSize = 'المقاس الموصى به: 1200 × 800 بكسل (WebP / JPG / PNG)',
  aspectRatio = 'video',
  className = '',
}: DeviceImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorText('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WebP)');
      return;
    }

    setErrorText(null);
    setIsUploading(true);
    setProgress(15);
    setStatusText('جاري ضغط الصورة ومعالجتها إلى صيغة WebP...');

    try {
      // 1. Client-side compression to WebP
      let webpBlob: Blob;
      try {
        webpBlob = await compressToWebPClient(file);
      } catch (clientErr) {
        console.warn('Client-side WebP conversion notice:', clientErr);
        webpBlob = file;
      }

      setProgress(45);
      setStatusText('جاري رفع الصورة إلى التخزين السحابي...');

      // 2. Prepare Form Data
      const formData = new FormData();
      const cleanFileName = `${slug || 'image'}_${Date.now()}.webp`;
      formData.append('file', webpBlob, cleanFileName);
      formData.append('folder', folder);
      if (slug) formData.append('slug', slug);
      if (value) formData.append('existingImageUrl', value);

      // 3. Upload with simulated smooth progress
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 120);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      const data = await res.json();

      if (!res.ok || !data.success || !data.imageUrl) {
        throw new Error(data.error || 'فشل رفع الصورة للخادم');
      }

      setProgress(100);
      setStatusText('تم الرفع والضغط بنجاح (صيغة WebP فائقة السرعة)!');
      onChange(data.imageUrl);

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        setStatusText('');
      }, 1200);
    } catch (err: any) {
      console.error('Image uploader error:', err);
      setErrorText(err.message || 'حدث خطأ أثناء رفع الصورة');
      setIsUploading(false);
      setProgress(0);
      setStatusText('');
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const aspectClasses = {
    video: 'aspect-16/9',
    square: 'aspect-square',
    banner: 'aspect-21/9',
    auto: 'min-h-[160px]',
  }[aspectRatio];

  return (
    <div className={`space-y-2 text-right ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-slate-800 text-xs font-black flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#173A7C]" />
          <span>{label}</span>
        </label>
        {recommendedSize && (
          <span className="text-[10px] text-slate-400 font-medium">
            {recommendedSize}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg,image/avif"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="hidden"
      />

      {/* Main Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
          isDragging
            ? 'border-[#173A7C] bg-blue-50/50 scale-[1.01]'
            : 'border-dashed border-slate-300 hover:border-[#173A7C]/60 bg-slate-50/70 hover:bg-white'
        } ${aspectClasses}`}
      >
        {/* Preview of Current Image */}
        {value && !isUploading && (
          <div className="relative w-full h-full group">
            <img
              src={value}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.webp';
              }}
            />
            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3 text-white backdrop-blur-xs">
              <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                صورة معتمدة (WebP)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-[#173A7C] text-xs font-black shadow-md hover:bg-blue-50 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تغيير الصورة من الجهاز</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition-all cursor-pointer"
                  title="حذف الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Uploading State */}
        {(!value || isUploading) && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
              isUploading ? 'cursor-wait' : ''
            }`}
          >
            {isUploading ? (
              <div className="w-full max-w-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#173A7C] flex items-center justify-center mx-auto shadow-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-[#173A7C]" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                    <span>{statusText}</span>
                    <span className="font-mono text-[#173A7C]">{progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  يتم التحويل التلقائي لصيغة WebP المضغوطة لتسريع الموقع
                </span>
              </div>
            ) : (
              <div className="space-y-2 group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-[#173A7C] flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:border-[#173A7C]/40 transition-all">
                  <UploadCloud className="w-7 h-7 text-[#173A7C]" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">
                    اضغط لاختيار صورة من جهازك <span className="text-[#173A7C]">أو اسحبها وأفلتها هنا</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    يدعم PNG, JPG, JPEG, WebP (تُضغط وتُحوّل لـ WebP تلقائياً)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {errorText && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
}
