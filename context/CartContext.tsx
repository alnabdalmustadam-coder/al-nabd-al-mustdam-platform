'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course } from '@/types';
import { WishlistItem } from './WishlistContext';

export interface CartItem {
  id: number | string;
  slug: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  duration?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (course: Course | WishlistItem | CartItem) => void;
  removeFromCart: (courseId: number | string) => void;
  clearCart: () => void;
  isInCart: (courseId: number | string) => boolean;
  totalPrice: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sustainsulse_user_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. Initial load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [cart, isLoaded]);

  const isInCart = (courseId: number | string) => {
    return cart.some((item) => String(item.id) === String(courseId));
  };

  const addToCart = (course: Course | WishlistItem | CartItem) => {
    if (isInCart(course.id)) {
      setIsCartOpen(true);
      return;
    }

    const newItem: CartItem = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      price: course.price,
      image: typeof (course as any).image === 'string' ? (course as any).image : '/logo.webp',
      category: course.category,
      duration: (course as any).duration,
    };

    setCart((prev) => [newItem, ...prev]);
    setIsCartOpen(true); // Open drawer on addition for instant feedback
  };

  const removeFromCart = (courseId: number | string) => {
    setCart((prev) => prev.filter((item) => String(item.id) !== String(courseId)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalPrice,
        cartCount: cart.length,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
