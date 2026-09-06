'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader2, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

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
 * Creates a consistent 16:9 WebP cover. Non-landscape uploads keep all of
 * their content and receive a soft, image-derived backdrop instead of being
 * stretched or aggressively cropped.
 */
async function prepareCoverImage(
  file: File,
  targetWidth = 1280,
  targetHeight = 720,
  quality = 0.82,
): Promise<{ blob: Blob; wasReframed: boolean }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل معالجة الصورة'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('تعذر إنشاء سياق المعالجة'));
        }

        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;
        const sourceRatio = sourceWidth / sourceHeight;
        const targetRatio = targetWidth / targetHeight;
        const wasReframed = Math.abs(sourceRatio - targetRatio) / targetRatio > 0.025;

        ctx.fillStyle = '#e8eef5';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        if (wasReframed) {
          const coverScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight) * 1.08;
          const backdropWidth = sourceWidth * coverScale;
          const backdropHeight = sourceHeight * coverScale;

          ctx.save();
          ctx.filter = 'blur(30px) brightness(0.72) saturate(0.82)';
          ctx.drawImage(
            img,
            (targetWidth - backdropWidth) / 2,
            (targetHeight - backdropHeight) / 2,
            backdropWidth,
            backdropHeight,
          );
          ctx.restore();

          ctx.fillStyle = 'rgba(12, 35, 72, 0.12)';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        const containScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
        const renderedWidth = sourceWidth * containScale;
        const renderedHeight = sourceHeight * containScale;
        ctx.drawImage(
          img,
          (targetWidth - renderedWidth) / 2,
          (targetHeight - renderedHeight) / 2,
          renderedWidth,
          renderedHeight,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, wasReframed });
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
  recommendedSize = 'المقاس الموصى به: 1280 × 720 بكسل',
  aspectRatio = 'video',
  className = '',
}: DeviceImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formatNotice, setFormatNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorText('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WebP)');
      return;
    }

    setErrorText(null);
    setFormatNotice(null);
    setIsUploading(true);
    setProgress(15);
    setStatusText('جاري تجهيز الصورة...');

    let progressTimer: ReturnType<typeof setInterval> | undefined;
    try {
      // 1. Client-side compression to WebP
      let webpBlob: Blob;
      try {
        const prepared = await prepareCoverImage(file);
        webpBlob = prepared.blob;
        setFormatNotice(
          prepared.wasReframed
            ? 'تم ضبط الصورة تلقائياً كغلاف أفقي 16:9 مع الحفاظ على محتواها كاملاً.'
            : 'الصورة مناسبة وتم تحسينها كغلاف أفقي 16:9.',
        );
      } catch (clientErr) {
        console.warn('Client-side WebP conversion notice:', clientErr);
        webpBlob = file;
        setFormatNotice('سيتم عرض الصورة داخل الإطار الموحد مع الحفاظ على محتواها كاملاً.');
      }

      setProgress(45);
      setStatusText('جاري حفظ الصورة...');

      // 2. Prepare Form Data
      const formData = new FormData();
      const cleanFileName = `${slug || 'image'}_${Date.now()}.webp`;
      formData.append('file', webpBlob, cleanFileName);
      formData.append('folder', folder);
      if (slug) formData.append('slug', slug);
      if (value) formData.append('existingImageUrl', value);

      // 3. Upload with simulated smooth progress
      progressTimer = setInterval(() => {
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
      setStatusText('تم حفظ الصورة بنجاح');
      onChange(data.imageUrl);

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        setStatusText('');
      }, 1200);
    } catch (err: unknown) {
      console.error('Image uploader error:', err);
      setErrorText(err instanceof Error ? err.message : 'حدث خطأ أثناء رفع الصورة');
      setIsUploading(false);
      setProgress(0);
      setStatusText('');
    } finally {
      if (progressTimer) clearInterval(progressTimer);
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
    video: 'aspect-video',
    square: 'aspect-square sm:max-h-[190px]',
    banner: 'aspect-21/9 sm:max-h-[150px]',
    auto: 'min-h-[150px] sm:min-h-[130px] sm:max-h-[195px]',
  }[aspectRatio];

  return (
    <div className={`space-y-1.5 text-right ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-slate-800 text-xs font-black flex items-center gap-1.5 leading-snug">
          <ImageIcon className="w-3.5 h-3.5 text-[#173A7C]" />
          <span>{label}</span>
        </label>
        {recommendedSize && (
          <span className="block pr-5 text-[10px] font-bold text-slate-400 sm:pr-0 sm:font-medium">
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
        className={`relative w-full overflow-hidden rounded-[1.25rem] border-2 transition-all duration-300 sm:rounded-2xl ${
          isDragging
            ? 'border-[#173A7C] bg-blue-50/50 scale-[1.01]'
            : 'border-dashed border-slate-300 hover:border-[#173A7C]/60 bg-slate-50/70 hover:bg-white'
        } ${aspectClasses}`}
      >
        {/* Preview of Current Image */}
        {value && !isUploading && (
          <div className="absolute inset-0 flex flex-col justify-between group">
            <ShimmerImage
              key={value}
              src={value}
              alt="معاينة الصورة"
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-contain"
            />
            {/* Bottom Floating Action Bar */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950/85 via-slate-900/60 to-transparent flex items-center justify-between gap-2 text-white">
              <span className="rounded-md border border-emerald-300/30 bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-100 backdrop-blur-md">
                صورة الغلاف
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-10 cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-black text-[#173A7C] shadow-xs transition-all hover:bg-blue-50 sm:min-h-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تغيير</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormatNotice(null);
                    onChange('');
                  }}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-rose-500/80 p-1 text-white transition-all hover:bg-rose-600 sm:h-auto sm:w-auto"
                  title="حذف الصورة"
                  aria-label="حذف الصورة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Uploading State */}
        {(!value || isUploading) && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#173A7C] ${
              isUploading ? 'cursor-wait' : ''
            }`}
          >
            {isUploading ? (
              <div className="w-full max-w-xs space-y-2.5 px-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#173A7C] flex items-center justify-center mx-auto shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-[#173A7C]" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-700 mb-1">
                    <span>{statusText}</span>
                    <span className="font-mono text-[#173A7C]">{progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="block text-[10px] font-medium text-slate-400">
                  ستظهر الصورة تلقائياً بعد اكتمال الحفظ
                </span>
              </div>
            ) : (
              <div className="group space-y-2 sm:space-y-1.5">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[#173A7C] shadow-sm transition-all group-hover:scale-105 group-hover:border-[#173A7C]/40 sm:h-10 sm:w-10 sm:rounded-xl sm:border-slate-200 sm:shadow-xs">
                  <UploadCloud className="w-5 h-5 text-[#173A7C]" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">
                    اضغط لاختيار صورة من جهازك
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    PNG أو JPG أو WebP — يتم تحسينها تلقائياً
                  </p>
                </div>
              </div>
            )}
          </button>
        )}
      </div>

      {formatNotice && !errorText && (
        <p className="flex items-start gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-2 text-[10px] font-bold leading-relaxed text-emerald-800" role="status">
          <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{formatNotice}</span>
        </p>
      )}

      {errorText && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
}
