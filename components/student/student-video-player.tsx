'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Lock,
  RefreshCw,
  Video,
  SkipBack,
  SkipForward,
  List,
  BookmarkPlus,
  Circle
} from 'lucide-react';

interface StudentVideoPlayerProps {
  lessonId: string;
  lessonTitle: string;
  videoUrl?: string;
  onLessonComplete?: () => void;
  nextLessonUrl?: string;
  prevLessonUrl?: string;
  onOpenLessonsDrawer?: () => void;
  onAddNoteAtTimestamp?: (timestamp: string) => void;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

const parseEmbedUrl = (url: string): string => {
  if (!url) return '';
  let vId = '';
  if (url.includes('youtube.com/watch?v=')) {
    vId = url.split('v=')[1]?.split('&')[0] || '';
  } else if (url.includes('youtu.be/')) {
    vId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }

  if (vId) {
    return `https://www.youtube.com/embed/${vId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`;
  }
  return url;
};

export const StudentVideoPlayer: React.FC<StudentVideoPlayerProps> = ({
  lessonId,
  lessonTitle,
  videoUrl,
  onLessonComplete,
  nextLessonUrl,
  prevLessonUrl,
  onOpenLessonsDrawer,
  onAddNoteAtTimestamp,
  isCompleted = false,
  onToggleComplete,
}) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [userWatermark, setUserWatermark] = useState<string>('الطالب المعتمد');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<string>('1.0x');

  const watchedSecondsRef = useRef<number>(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (videoUrl) {
      setIframeUrl(parseEmbedUrl(videoUrl));
      setUserWatermark('الطالب المعتمد');
      setLoading(false);
      return;
    }

    async function fetchPlaybackToken() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/videos/playback-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'تعذر تشغيل الفيديو، يرجى التأكد من صلاحية اشتراكك.');
        }

        if (isMounted) {
          setIframeUrl(parseEmbedUrl(data.iframeUrl));
          setUserWatermark(data.userWatermark || 'الطالب المعتمد');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'حدث خطأ أثناء تحميل مشغل الفيديو');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPlaybackToken();

    return () => {
      isMounted = false;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [lessonId, videoUrl]);

  useEffect(() => {
    if (!iframeUrl) return;

    watchedSecondsRef.current = 0;
    progressTimerRef.current = setInterval(() => {
      watchedSecondsRef.current += 10;
      saveProgress(watchedSecondsRef.current, false);
    }, 10000);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [iframeUrl, lessonId]);

  const saveProgress = async (watchedSec: number, completedStatus: boolean) => {
    try {
      await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          watchedSeconds: watchedSec,
          lastPositionSeconds: watchedSec,
          isCompleted: completedStatus,
        }),
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleTimestampNote = () => {
    const mins = Math.floor(watchedSecondsRef.current / 60);
    const secs = watchedSecondsRef.current % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (onAddNoteAtTimestamp) {
      onAddNoteAtTimestamp(timeStr);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between h-full bg-slate-950 rounded-2xl overflow-hidden shadow-md">
      {/* Video Header Strip */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 border-b border-slate-800 text-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onOpenLessonsDrawer && (
            <button
              onClick={onOpenLessonsDrawer}
              className="lg:hidden px-2.5 py-1.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white shrink-0 flex items-center gap-1.5 shadow-md border border-white/20 transition-all font-black text-xs cursor-pointer"
              title="فهرس الدروس"
            >
              <List className="w-4 h-4 text-emerald-400" />
              <span>قائمة الدروس</span>
            </button>
          )}
          <Video className="w-4 h-4 text-emerald-400 shrink-0 hidden xs:block" />
          <h3 className="font-black text-xs sm:text-sm text-slate-100 truncate max-w-[180px] xs:max-w-xs sm:max-w-none">{lessonTitle}</h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs font-medium">
          <span className="hidden sm:inline-flex text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono border border-slate-700">
            🔒 {userWatermark}
          </span>
        </div>
      </div>

      {/* Video Viewport */}
      <div
        className="relative w-full flex-1 aspect-video lg:aspect-auto lg:min-h-[560px] xl:min-h-[650px] bg-black flex items-center justify-center select-none overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
            <p className="text-xs font-bold">جاري تحميل مشغل الفيديو...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center max-w-sm rounded-2xl bg-slate-900 border border-slate-800 text-slate-200">
            <Lock className="w-7 h-7 text-red-400 mx-auto mb-2" />
            <p className="text-xs font-bold leading-relaxed mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#173A7C] text-white rounded-xl text-xs font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && iframeUrl && (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            loading="eager"
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      {/* Single Clean Control Bar directly under the Video Viewport */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300 shrink-0">
        {/* Playback Speed Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">السرعة:</span>
          {['0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((spd) => (
            <button
              key={spd}
              onClick={() => setCurrentSpeed(spd)}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${currentSpeed === spd
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              {spd}
            </button>
          ))}
        </div>

        {/* Action Buttons: Note, Prev/Next, Complete */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Add Timestamp Note */}
          <button
            onClick={handleTimestampNote}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-700"
            title="إضافة ملاحظة عند هذه الدقيقة"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">ملاحظة ⏱️</span>
          </button>

          {/* Prev Lesson Button */}
          {prevLessonUrl && (
            <a
              href={prevLessonUrl}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold border border-slate-700"
              title="الدرس السابق"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">السابق</span>
            </a>
          )}

          {/* Next Lesson Button */}
          {nextLessonUrl && (
            <a
              href={nextLessonUrl}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-[11px] sm:text-xs font-bold border border-slate-700"
              title="الدرس التالي"
            >
              <span className="hidden sm:inline">التالي</span>
              <SkipBack className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Complete Toggle Button */}
          <button
            onClick={onToggleComplete || onLessonComplete}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs ${isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white hover:opacity-90'
              }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>مكتمل ✓</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 text-slate-300" />
                <span>تحديد كمكتمل</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
