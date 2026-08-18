'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course } from '@/types';
import { createClient } from '@/utils/supabase/client';

export interface WishlistItem {
  id: number | string;
  slug: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  duration?: string;
  lessonsCount?: number;
  rating?: number;
  instructor?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (course: Course | WishlistItem) => void;
  removeFromWishlist: (courseId: number | string) => void;
  toggleWishlist: (course: Course | WishlistItem) => void;
  isInWishlist: (courseId: number | string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sustainsulse_user_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading wishlist from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to storage:', e);
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (courseId: number | string) => {
    return wishlist.some((item) => String(item.id) === String(courseId));
  };

  const addToWishlist = (course: Course | WishlistItem) => {
    if (isInWishlist(course.id)) return;
    const newItem: WishlistItem = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      price: course.price,
      image: typeof (course as any).image === 'string' ? (course as any).image : '/logo.webp',
      category: course.category,
      duration: course.duration,
      lessonsCount: course.lessonsCount,
      rating: course.rating,
      instructor: (course as any).instructor,
    };
    setWishlist((prev) => [newItem, ...prev]);
  };

  const removeFromWishlist = (courseId: number | string) => {
    setWishlist((prev) => prev.filter((item) => String(item.id) !== String(courseId)));
  };

  const toggleWishlist = (course: Course | WishlistItem) => {
    if (isInWishlist(course.id)) {
      removeFromWishlist(course.id);
    } else {
      addToWishlist(course);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
