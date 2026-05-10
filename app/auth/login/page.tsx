"use client";

import { useEffect } from "react";

const GHL_LOGIN_URL = "https://members.nabdtraining.com/login";

export default function LoginPage() {
  useEffect(() => {
    window.location.href = GHL_LOGIN_URL;
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ direction: "rtl", fontFamily: "sans-serif" }}
    >
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#173A7C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-slate-700">جاري التوجيه لصفحة تسجيل الدخول...</p>
        <a
          href={GHL_LOGIN_URL}
          className="text-sm text-[#173A7C] hover:underline mt-2 inline-block"
        >
          اضغط هنا إذا لم يتم التوجيه تلقائياً
        </a>
      </div>
    </div>
  );
}
