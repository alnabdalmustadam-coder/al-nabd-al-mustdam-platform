'use client';

import React, { useRef } from 'react';
import { isDemoVideoUrl } from '@/lib/demo/media';
import {
  CheckCircle2,
  RefreshCw,
  Video,
  SkipBack,
  SkipForward,
  List,
  BookmarkPlus,
  Circle,
} from 'lucide-react';

interface StudentVideoPlayerProps {
  courseSlug: string;
  lessonId: string;
  lessonTitle: string;
  videoUrl?: string;
  onLessonComplete?: () => void;
  nextLessonUrl?: string;
  prevLessonUrl?: string;
  onOpenLessonsDrawer?: () => void;
  onAddNoteAtTimestamp?: (timestamp: string) => void;
  isCompleted?: boolean;
  isSavingCompletion?: boolean;
  onToggleComplete?: () => void;
  professionalDevelopment?: boolean;
  completionDisabled?: boolean;
  hideToolbar?: boolean;
  onVideoVerified?: () => void;
}

export const StudentVideoPlayer: React.FC<StudentVideoPlayerProps> = ({
  lessonTitle,
  videoUrl,
  onLessonComplete,
  nextLessonUrl,
  prevLessonUrl,
  onOpenLessonsDrawer,
  onAddNoteAtTimestamp,
  isCompleted = false,
  isSavingCompletion = false,
  onToggleComplete,
  completionDisabled = false,
  hideToolbar = false,
  onVideoVerified,
}) => {
  const demoVideo = isDemoVideoUrl(videoUrl ?? '');
  const video = useRef<HTMLVideoElement>(null);

  const handleTimestampNote = () => {
    const totalSeconds = Math.floor(video.current?.currentTime ?? 0);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    onAddNoteAtTimestamp?.(minutes + ':' + seconds);
  };

  return (
    <div className="w-full min-w-0 flex flex-col bg-[#10223E]/80 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {/* Video Header Strip */}
      <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-[#173056]/85 backdrop-blur-md border-b border-white/10 text-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onOpenLessonsDrawer && (
            <button
              onClick={onOpenLessonsDrawer}
              className="lg:hidden px-2.5 py-1.5 rounded-xl bg-[#0B3766] hover:bg-[#168AD3] text-white shrink-0 flex items-center gap-1.5 shadow-md border border-white/20 transition-all font-bold text-xs cursor-pointer"
              title="فهرس الدروس"
            >
              <List className="w-4 h-4 text-emerald-400" />
              <span>قائمة الدروس</span>
            </button>
          )}
          <Video className="w-4 h-4 text-emerald-400 shrink-0 hidden xs:block" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[220px] xs:max-w-xs sm:max-w-none">{lessonTitle}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مشغّل الدرس</span>
          </span>
        </div>
      </div>

      {/* Video Viewport (No watermarks) */}
      <div
        className="relative w-full shrink-0 aspect-video bg-[#0A1322]/85 backdrop-blur-sm flex items-center justify-center select-none overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {demoVideo && (
          <video ref={video} className="absolute inset-0 h-full w-full" src={videoUrl} controls playsInline preload="metadata"
            aria-label={lessonTitle} onEnded={onVideoVerified} />
        )}

        {!demoVideo && (
          <div className="p-8 text-center max-w-md rounded-2xl bg-[#173056]/90 border border-white/10 text-slate-200 space-y-3 mx-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-emerald-400">
              <Video className="w-7 h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">المحتوى المرئي قيد التجهيز</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-bold">
              لم يتم إرفاق فيديو لهذا الدرس بعد. يمكنك متابعة محتوى الدرس المكتوب والملفات المرفقة.
            </p>
          </div>
        )}
      </div>

      {/* Control Bar */}
      {!hideToolbar && <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#173056]/85 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-2 text-xs font-bold text-slate-200 shrink-0">
        {/* Left Side: Note with Timestamp Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTimestampNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="تدوين ملاحظة عند هذه اللحظة"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" />
            <span>تدوين ملاحظة [⏱️ دقيقة]</span>
          </button>
        </div>

        {/* Right Side: Navigation & Completion Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {prevLessonUrl && (
            <a
              href={prevLessonUrl}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold border border-white/10"
              title="الدرس السابق"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">السابق</span>
            </a>
          )}

          {nextLessonUrl && (
            <a
              href={nextLessonUrl}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold border border-white/10"
              title="الدرس التالي"
            >
              <span className="hidden sm:inline">التالي</span>
              <SkipBack className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={onToggleComplete || onLessonComplete}
            disabled={isCompleted || isSavingCompletion || completionDisabled}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:cursor-default ${isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border border-emerald-400/40'
                : 'bg-gradient-to-r from-[#0B3766] to-[#168AD3] text-white hover:opacity-95 border border-white/20 shadow-blue-900/30'
              }`}
          >
            {isSavingCompletion ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>جاري الحفظ...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>مكتمل ✓</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-300" />
                <span>{completionDisabled ? 'أكمل المشاهدة أولاً' : 'تحديد كمكتمل'}</span>
              </>
            )}
          </button>
        </div>
      </div>}
    </div>
  );
};
