'use client';

import { useEffect } from 'react';

/** Keep the page behind a full-screen mobile editor stationary. */
export function useMobileDialogScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const mobile = window.matchMedia('(max-width: 639px)');
    const previousOverflow = document.body.style.overflow;
    const updateOverflow = () => {
      document.body.style.overflow = mobile.matches ? 'hidden' : previousOverflow;
    };

    updateOverflow();
    mobile.addEventListener('change', updateOverflow);
    return () => {
      mobile.removeEventListener('change', updateOverflow);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
}
