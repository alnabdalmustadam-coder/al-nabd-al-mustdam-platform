'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { extractBunnyVideoId } from '@/lib/learning/course-content';
import type { BunnyPlayer } from '@/lib/video/playerjs';
import {
  CheckCircle2,
  Lock,
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

const extractBunnyGuid = (str: string): string | null => {
  if (!str) return null;
  const match = str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
};

const parseEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();

  // Explicitly disallow YouTube or external video links - only authentic database videos allowed
  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('youtube-nocookie.com') ||
    trimmed.includes('vimeo.com')
  ) {
    return '';
  }

  // 1. Bunny Player to Embed URL conversion
  if (trimmed.includes('player.mediadelivery.net/play/')) {
    return trimmed.replace('player.mediadelivery.net/play/', 'iframe.mediadelivery.net/embed/');
  }

  // 2. Already Signed Bunny Stream URL
  if (trimmed.includes('iframe.mediadelivery.net')) {
    return trimmed;
  }

  // 3. Raw Bunny GUID string (36-char uuid)
  const rawGuid = extractBunnyGuid(trimmed);
  if (rawGuid && !trimmed.startsWith('http')) {
    return `https://iframe.mediadelivery.net/embed/729792/${rawGuid}?autoplay=false&preload=true`;
  }

  // 4. Authentic direct HTTPS storage/CDN stream
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  // No mock or YouTube fallback - only authentic videos from database
  return '';
};

export const StudentVideoPlayer: React.FC<StudentVideoPlayerProps> = ({
  courseSlug,
  lessonId,
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
  professionalDevelopment = false,
  completionDisabled = false,
  hideToolbar = false,
  onVideoVerified,
}) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('جاري تحميل مشغل الفيديو...');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cpdSession, setCpdSession] = useState<{ id: string; duration: number; watchedSeconds: number } | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const verifiedCallback = useRef(onVideoVerified);
  useEffect(() => { verifiedCallback.current = onVideoVerified; }, [onVideoVerified]);

  const watchedSecondsRef = useRef<number>(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setLoadingMessage('جاري تحميل مشغل الفيديو...');
    setIframeUrl(null);
    setCpdSession(null);
    setTrackingError('');

    async function loadVideo(attempt = 0) {
      try {
        const trimmed = (videoUrl || '').trim();

        if (!trimmed || trimmed.includes('youtube.com') || trimmed.includes('youtu.be') || trimmed.includes('vimeo.com')) {
          if (isMounted) {
            setIframeUrl(null);
            setError(null);
            setLoading(false);
          }
          return;
        }

        // 1. Bunny Stream GUID Extraction (from GUID or URL)
        const bunnyGuid = extractBunnyVideoId(trimmed);

        if (bunnyGuid) {
          const res = await fetch('/api/videos/playback-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId, videoId: bunnyGuid, courseSlug }),
            signal: controller.signal,
          });

          const data = await res.json();
          if (!isMounted) return;
          if (res.status === 409 && data.code === 'VIDEO_PROCESSING') {
            if (attempt < 6) {
              setLoadingMessage('الفيديو قيد التجهيز. نتحقق تلقائياً من جاهزيته...');
              retryTimer = setTimeout(() => { void loadVideo(attempt + 1); }, 5000);
              return;
            }
            throw new Error('الفيديو ما زال قيد التجهيز. انتظر قليلاً ثم اضغط إعادة المحاولة.');
          }
          if (!res.ok || !data.success || !data.iframeUrl) {
            throw new Error(data.error || 'تعذر التحقق من صلاحية مشاهدة الفيديو');
          }

          if (isMounted) {
            setIframeUrl(data.iframeUrl);
            setCpdSession(data.cpdSession || null);
            if (professionalDevelopment && !data.cpdSession) throw new Error('تعذر بدء جلسة التحقق من المشاهدة');
            setLoading(false);
            return;
          }
        }

        // 2. Direct embedded or stream URL
        if (professionalDevelopment) throw new Error('هذا الدرس يتطلب فيديو مرفوعاً من داخل المنصة يدعم التحقق من المشاهدة');
        const parsed = parseEmbedUrl(trimmed);
        if (parsed) {
          if (isMounted) {
            setIframeUrl(parsed);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setIframeUrl(null);
            setError(null);
            setLoading(false);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIframeUrl(null);
          setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل مشغل الفيديو');
          setLoading(false);
        }
      }
    }

    loadVideo();

    return () => {
      isMounted = false;
      controller.abort();
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [courseSlug, lessonId, videoUrl, professionalDevelopment, loadAttempt]);

  useEffect(() => {
    if (!professionalDevelopment || !cpdSession || !iframeUrl || !scriptReady || !iframeRef.current || !window.playerjs) return;
    const player: BunnyPlayer = new window.playerjs.Player(iframeRef.current);
    let alive = true;
    let ready = false;
    let phase: 'paused' | 'authorizing' | 'resuming' | 'playing' = 'paused';
    let generation = 0;
    let frontier = cpdSession.watchedSeconds;
    let seconds = frontier;
    let anchorSeconds = frontier;
    let anchorTime = performance.now();
    let queue = Promise.resolve();
    let tickPending = false;
    let corrections = 0;
    let verified = false;
    const positionTimers = new Set<ReturnType<typeof setTimeout>>();
    const readPosition = () => new Promise<number>((resolve) => {
      let settled = false;
      const finish = (position: number) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout); positionTimers.delete(timeout);
        resolve(Number.isFinite(position) && position >= 0 ? position : seconds);
      };
      const timeout = setTimeout(() => finish(seconds), 1000);
      positionTimers.add(timeout);
      player.getCurrentTime(finish);
    });
    const update = (watched: number) => {
      if (!alive) return;
      const complete = watched >= cpdSession.duration - Math.min(1, cpdSession.duration * 0.01);
      if (complete && !verified) { verified = true; verifiedCallback.current?.(); }
    };
    const resetPosition = (position: number) => {
      seconds = position; anchorSeconds = position; anchorTime = performance.now();
      watchedSecondsRef.current = Math.floor(position);
    };
    type SavedWatch = { watchedSeconds: number; accepted?: boolean; seekTo?: number | null };
    const save = (event: 'play' | 'pause' | 'tick', position: Promise<number> | number) => {
      const request = queue.then(async (): Promise<SavedWatch | null> => {
        if (!alive) return null;
        const current = await position;
        if (!alive) return null;
        const response = await fetch('/api/courses/video-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: courseSlug, lessonId, sessionId: cpdSession.id, seconds: current, event }) });
        const payload = await response.json();
        if (!alive) return null;
        if (!response.ok || !payload.success || !Number.isFinite(payload.watchedSeconds)) throw new Error(payload.message || 'تعذر حفظ المشاهدة');
        update(payload.watchedSeconds);
        return payload as SavedWatch;
      });
      queue = request.then(() => {}, () => {});
      return request;
    };
    const fail = (failure: unknown) => {
      if (!alive) return;
      generation++; phase = 'paused'; player.pause();
      setTrackingError(failure instanceof Error ? failure.message : 'تعذر حفظ المشاهدة. أعد المحاولة لاستكمال الفيديو.');
    };
    // Start the server clock BEFORE resuming the media. Network latency during
    // the first play/resume must never be deducted from the learner's viewing.
    const beginPlayback = () => {
      if (!alive || !ready || document.hidden || phase === 'authorizing' || phase === 'resuming') return;
      phase = 'authorizing';
      const version = ++generation;
      player.pause();
      void save('play', seconds).then((saved) => {
        if (!alive || !saved || generation !== version || document.hidden) return;
        if (typeof saved.seekTo === 'number') {
          if (++corrections > 2) { fail(new Error('تعذر مزامنة المشاهدة. أعد المحاولة لاستكمالها من موضعك المحفوظ.')); return; }
          frontier = saved.seekTo; resetPosition(frontier); player.setCurrentTime(frontier);
          phase = 'paused'; beginPlayback(); return;
        }
        setTrackingError('');
        phase = 'resuming'; player.play();
      }).catch(fail);
    };
    const reconcile = (saved: SavedWatch | null) => {
      if (!alive || !saved) return;
      if (typeof saved.seekTo !== 'number') { corrections = 0; setTrackingError(''); return; }
      if (++corrections > 2) { fail(new Error('تعذر مزامنة المشاهدة. أعد المحاولة لاستكمالها من موضعك المحفوظ.')); return; }
      const resume = phase === 'playing' && !document.hidden;
      generation++; phase = 'paused'; player.pause();
      frontier = saved.seekTo; resetPosition(frontier); player.setCurrentTime(frontier);
      // Resume from the verified position; a timing correction is not an
      // accusation of skipping and must not require another manual play.
      if (resume) beginPlayback();
    };
    const stopAndSave = (final = false) => {
      if (!alive || !ready || (!final && phase !== 'playing')) return;
      generation++; phase = 'paused';
      void save('pause', readPosition()).then(reconcile).catch(fail);
    };
    const onReady = () => {
      if (!alive || ready) return;
      ready = true;
      player.pause(); player.setCurrentTime(frontier);
      if (player.supports('method', 'setPlaybackRate')) player.setPlaybackRate(1);
      player.on('timeupdate', (value) => {
        if (!alive || typeof value !== 'object' || typeof value.seconds !== 'number' || !Number.isFinite(value.seconds)) return;
        const elapsed = phase === 'playing' ? Math.max(0, (performance.now() - anchorTime) / 1000) : 0;
        // Use one continuous playback anchor. Sparse mobile events or a busy
        // main thread must not look like a seek after an arbitrary 2s clamp.
        if (value.seconds > Math.max(frontier, anchorSeconds + elapsed) + 0.5) {
          player.setCurrentTime(frontier); resetPosition(frontier); return;
        }
        if (value.seconds < seconds - 0.5) { anchorSeconds = value.seconds; anchorTime = performance.now(); }
        seconds = value.seconds;
        if (phase === 'playing' && !document.hidden) frontier = Math.max(frontier, seconds);
        watchedSecondsRef.current = Math.floor(seconds);
      });
      player.on('play', () => {
        if (!alive) return;
        if (document.hidden) { player.pause(); return; }
        if (phase === 'resuming') { phase = 'playing'; anchorSeconds = seconds; anchorTime = performance.now(); return; }
        if (phase !== 'playing') beginPlayback();
      });
      player.on('pause', () => stopAndSave());
      player.on('ended', () => stopAndSave(true));
      player.on('seeked', () => {
        if (!alive) return;
        void readPosition().then((position) => {
          if (!alive) return;
          if (position > frontier + 0.5) { player.setCurrentTime(frontier); resetPosition(frontier); }
          else resetPosition(position);
        });
      });
      player.on('playbackratechange', (rate) => { if (alive && rate !== 1 && player.supports('method', 'setPlaybackRate')) player.setPlaybackRate(1); });
    };
    update(frontier);
    player.on('ready', onReady);
    const readyTimeout = setTimeout(() => {
      if (alive && !ready) setTrackingError('تعذر الاتصال بمشغل الفيديو لحفظ المشاهدة. أعد تحميل الدرس.');
    }, 15_000);
    const timer = setInterval(() => {
      if (!alive || !ready || phase !== 'playing' || tickPending || document.hidden) return;
      tickPending = true;
      void save('tick', readPosition()).then(reconcile).catch(fail).finally(() => { tickPending = false; });
    }, 1000);
    const hide = () => {
      if (!alive || !ready || !document.hidden || phase === 'paused') return;
      generation++; phase = 'paused'; player.pause();
      void save('pause', readPosition()).then(reconcile).catch(fail);
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      alive = false; generation++; clearInterval(timer); clearTimeout(readyTimeout); document.removeEventListener('visibilitychange', hide);
      positionTimers.forEach(clearTimeout); positionTimers.clear();
      ['ready', 'timeupdate', 'play', 'pause', 'ended', 'seeked', 'playbackratechange'].forEach((event) => {
        try { player.off(event); } catch {
          // The SDK clears the local callback before posting to the iframe,
          // whose browsing context may already be gone during React cleanup.
        }
      });
    };
  }, [professionalDevelopment, cpdSession, iframeUrl, scriptReady, courseSlug, lessonId]);

  // Keep an approximate local timestamp for note-taking only. Academic lesson
  // completion is recorded explicitly by the page when the student confirms it.
  useEffect(() => {
    if (!iframeUrl || professionalDevelopment) return;

    watchedSecondsRef.current = 0;
    progressTimerRef.current = setInterval(() => {
      watchedSecondsRef.current += 1;
    }, 1000);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [iframeUrl, professionalDevelopment]);

  const handleTimestampNote = () => {
    const totalSecs = watchedSecondsRef.current;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (onAddNoteAtTimestamp) {
      onAddNoteAtTimestamp(timeStr);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col bg-[#10223E]/80 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {professionalDevelopment && <Script src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setTrackingError('تعذر تحميل تتبع المشاهدة. أعد تحميل الصفحة')} />}
      {/* Video Header Strip */}
      <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 bg-[#173056]/85 backdrop-blur-md border-b border-white/10 text-white shrink-0">
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
          <h3 className="font-black text-xs sm:text-sm text-slate-100 truncate max-w-[220px] xs:max-w-xs sm:max-w-none">{lessonTitle}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مشغل تدريبي معتمد</span>
          </span>
        </div>
      </div>

      {/* Video Viewport (No watermarks) */}
      <div
        className="relative w-full shrink-0 aspect-video bg-[#0A1322]/85 backdrop-blur-sm flex items-center justify-center select-none overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
            <p role="status" className="px-4 text-center text-xs font-bold leading-relaxed">{loadingMessage}</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center max-w-sm rounded-2xl bg-[#173056]/90 border border-white/10 text-slate-200">
            <Lock className="w-7 h-7 text-red-400 mx-auto mb-2" />
            <p className="text-xs font-bold leading-relaxed mb-4">{error}</p>
            <button
              onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              className="px-4 py-2 bg-[#173A7C] hover:bg-[#1E4D9D] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {professionalDevelopment && trackingError && <div role="alert" className="absolute inset-x-3 top-3 z-20 rounded-xl border border-white/20 bg-slate-950/95 p-3 text-center text-xs leading-6 text-white shadow-lg">
          {trackingError} <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="mr-2 font-bold underline">إعادة المحاولة</button>
        </div>}

        {!loading && !error && iframeUrl && (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title={lessonTitle}
            loading="eager"
            className="absolute inset-0 block w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}

        {!loading && !error && !iframeUrl && (
          <div className="p-8 text-center max-w-md rounded-2xl bg-[#173056]/90 border border-white/10 text-slate-200 space-y-3 mx-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-emerald-400">
              <Video className="w-7 h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-white">المحتوى المرئي قيد التجهيز</h4>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-xs"
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
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:cursor-default ${isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border border-emerald-400/40'
                : 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white hover:opacity-95 border border-white/20 shadow-blue-900/30'
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
