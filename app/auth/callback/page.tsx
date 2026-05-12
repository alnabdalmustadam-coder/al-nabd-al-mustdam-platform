"use client";

import { useEffect } from "react";

/**
 * صفحة callback قديمة — الآن التسجيل يتم عبر GHL Client Portal.
 * هذه الصفحة تعيد التوجيه فقط.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    window.location.href = "https://members.nabdtraining.com/login";
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        direction: "rtl",
      }}
    >
      جاري إعادة التوجيه...
    </div>
  );
}
