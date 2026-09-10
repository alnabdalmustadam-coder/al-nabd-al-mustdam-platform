'use client';

import { useCallback, useEffect, useState } from 'react';
import { COURSES_LOAD_ERROR, fetchPublicCourses } from '@/lib/public-courses';
import type { Course } from '@/types';

/** Refresh public course views from the same authoritative catalog. */
export function usePublicCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const reload = useCallback(() => setRetryKey(key => key + 1), []);

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    setLoading(true);
    const refresh = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const latest = await fetchPublicCourses(request.signal);
        if (!active || request.signal.aborted) return;
        setCourses(latest);
        setError(null);
      } catch {
        if (!active || request.signal.aborted) return;
        setCourses([]);
        setError(COURSES_LOAD_ERROR);
      } finally {
        if (active && !request.signal.aborted) setLoading(false);
      }
    };
    const whenVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const events = ['nabd_courses_updated', 'focus', 'online', 'pageshow'];
    void refresh();
    events.forEach(event => window.addEventListener(event, refresh));
    document.addEventListener('visibilitychange', whenVisible);
    return () => {
      active = false;
      controller?.abort();
      events.forEach(event => window.removeEventListener(event, refresh));
      document.removeEventListener('visibilitychange', whenVisible);
    };
  }, [retryKey]);

  return { courses, loading, error, reload };
}
