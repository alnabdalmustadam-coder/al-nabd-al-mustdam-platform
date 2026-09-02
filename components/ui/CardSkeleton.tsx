'use client';

import React from 'react';

/**
 * Animated Skeleton Shimmer Card for Course Catalog & Course Grids
 */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      {/* Image Banner Shimmer */}
      <div className="relative aspect-16/10 w-full animate-skeleton-shimmer bg-slate-100">
        <div className="absolute top-4 right-4 w-16 h-6 rounded-full bg-slate-200" />
        <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-200" />
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        {/* Title Lines */}
        <div className="w-3/4 h-5 rounded-lg bg-slate-200 animate-skeleton-shimmer" />
        <div className="w-1/2 h-4 rounded-lg bg-slate-100 animate-skeleton-shimmer" />

        {/* Description Lines */}
        <div className="space-y-1.5 mt-2">
          <div className="w-full h-3 rounded bg-slate-100" />
          <div className="w-5/6 h-3 rounded bg-slate-100" />
        </div>

        {/* Meta Pills */}
        <div className="flex items-center gap-2 mt-auto pt-4">
          <div className="w-24 h-7 rounded-full bg-slate-100 animate-skeleton-shimmer" />
          <div className="w-20 h-7 rounded-full bg-slate-100 animate-skeleton-shimmer" />
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="w-20 h-6 rounded-md bg-slate-200 animate-skeleton-shimmer" />
          <div className="w-28 h-10 rounded-xl bg-slate-200 animate-skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Animated Skeleton Shimmer Card for Marketplace Services
 */
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      {/* Thumbnail */}
      <div className="relative aspect-16/10 w-full animate-skeleton-shimmer bg-slate-100">
        <div className="absolute top-4 right-4 w-20 h-6 rounded-full bg-slate-200" />
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        <div className="w-4/5 h-5 rounded-lg bg-slate-200 animate-skeleton-shimmer" />
        <div className="w-full h-3.5 rounded bg-slate-100" />
        <div className="w-2/3 h-3.5 rounded bg-slate-100" />

        <div className="flex items-center gap-2 mt-auto pt-4">
          <div className="w-20 h-6 rounded-full bg-slate-100" />
          <div className="w-24 h-6 rounded-full bg-slate-100" />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="w-16 h-5 rounded bg-slate-200" />
          <div className="w-24 h-9 rounded-xl bg-slate-200 animate-skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Animated Skeleton Shimmer Card for Articles & Knowledge Base
 */
export function ArticleCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      {/* Image Banner */}
      <div className="relative aspect-16/10 w-full animate-skeleton-shimmer bg-slate-100" />

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <div className="w-16 h-5 rounded-full bg-slate-100" />
          <div className="w-24 h-4 rounded bg-slate-100" />
        </div>

        <div className="w-full h-5 rounded-lg bg-slate-200 animate-skeleton-shimmer" />
        <div className="w-3/4 h-5 rounded-lg bg-slate-200 animate-skeleton-shimmer" />

        <div className="w-full h-3 rounded bg-slate-100 mt-2" />
        <div className="w-4/5 h-3 rounded bg-slate-100" />

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="w-24 h-4 rounded bg-slate-100" />
          <div className="w-6 h-6 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
