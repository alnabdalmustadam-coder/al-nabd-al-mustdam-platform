"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCourseBySlug, courses } from "@/data/courses";
import {
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  User, 
  Sparkles,
  Smartphone,
  AlertCircle,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useCart } from "@/context/CartContext";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isCartCheckout = searchParams.get("cart") === "true";
  const slug = searchParams.get("slug") || "computer-basics-office";
  
  const { cart, clearCart } = useCart();
  const singleCourse = getCourseBySlug(slug) || courses[0];

  const checkoutItems = isCartCheckout && cart.length > 0
    ? cart
    : [{
        id: singleCourse.id,
        slug: singleCourse.slug,
        title: singleCourse.title,
        price: singleCourse.price,
        image: typeof singleCourse.image === 'string' ? singleCourse.image : '/logo.webp',
        category: singleCourse.category,
        duration: singleCourse.duration,
      }];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [nationalIdInput, setNationalIdInput] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Authenticate user and prefill phone & national_id from profile
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push(`/auth/register?redirect=${encodeURIComponent(isCartCheckout ? '/checkout?cart=true' : `/checkout?slug=${slug}`)}`);
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.push(`/auth/register?redirect=${encodeURIComponent(isCartCheckout ? '/checkout?cart=true' : `/checkout?slug=${slug}`)}`);
          return;
        }
        
        setEmail(data.user.email || "");
        
        const supabase = createClient();
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone, national_id")
          .eq("id", data.user.id || "")
          .maybeSingle();

        const userFullName = profileData?.full_name || data.user.name || "";
        setUserName(userFullName);

        const rawPhone = profileData?.phone || data.user.phone || "";
        const cleanPhone = (rawPhone && rawPhone !== '+966 50 000 0000' && rawPhone !== '0500000000') ? rawPhone : "";
        setPhone(cleanPhone);
        if (cleanPhone) {
          setPhoneInput(cleanPhone);
        }

        const rawNationalId = profileData?.national_id || data.user.national_id || "";
        const cleanNationalId = (rawNationalId && rawNationalId !== '10XXXXXXXX') ? rawNationalId : "";
        setNationalId(cleanNationalId);
        if (cleanNationalId) {
          setNationalIdInput(cleanNationalId);
        }
        
        setAuthLoading(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push(`/auth/register?redirect=${encodeURIComponent(isCartCheckout ? '/checkout?cart=true' : `/checkout?slug=${slug}`)}`);
      }
    }
    checkAuth();
  }, [slug, isCartCheckout, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("البريد الإلكتروني مطلوب لإتمام التسجيل");
      return;
    }

    const finalPhone = (phoneInput || phone || '').trim();
    if (!finalPhone) {
      setErrorMessage("رقم الجوال مطلوب لإكمال عملية التسجيل وتوثيق الحساب");
      return;
    }

    const finalNationalId = (nationalIdInput || nationalId || '').trim();
    if (!finalNationalId) {
      setErrorMessage("رقم الهوية الوطنية أو الإقامة مطلوب لاعتماد شهادتك الرسمية");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // Automatically sync and persist phone & nationalId to profile so student never needs to re-enter
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        await supabase
          .from("profiles")
          .update({
            full_name: userName || undefined,
            phone: finalPhone,
            national_id: finalNationalId,
            nelc_eligible: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userData.user.id);
      }

      // Enroll in each item
      for (const item of checkoutItems) {
        const enrollRes = await fetch("/api/courses/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            courseId: item.slug,
            courseTitle: item.title,
            courseUrl: `/courses/${item.slug}`,
          }),
        });

        if (!enrollRes.ok) {
          const errData = await enrollRes.json();
          throw new Error(errData.message || "فشل تسجيل الدورة");
        }
      }

      if (isCartCheckout) {
        clearCart();
      }

      router.push("/dashboard/student?enrollSuccess=true");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء إتمام التسجيل");
      setIsSubmitting(false);
    }
  };

  const originalSubtotal = checkoutItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-[#5CB07C]/20 border-t-[#5CB07C] rounded-full animate-spin" />
          <Shield className="absolute w-8 h-8 text-[#5CB07C] animate-pulse" />
        </div>
        <p className="mt-6 text-slate-500 font-bold text-lg animate-pulse">جاري التحقق من الحساب والأمان...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100/50 relative overflow-hidden text-slate-800 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation / Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="text-right">
            <div className="mb-3">
              <span className="section-badge-glass">
                <Sparkles className="w-3.5 h-3.5 text-[#173A7C] ml-1 inline" />
                التسجيل المفتوح مؤقتاً
              </span>
            </div>
            <h1 className="section-main-title-premium text-3xl sm:text-4xl">تفعيل <span className="gradient-text">الدورات المختارة</span></h1>
          </div>
          <Link 
            href={isCartCheckout ? "/courses" : `/courses/${singleCourse.slug}`} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-sm font-bold transition-all text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {isCartCheckout ? "متابعة تصفح الدورات" : "الرجوع لتفاصيل الدورة"}
          </Link>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xl shadow-slate-900/5 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">ملخص الطلب</h2>
                  <p className="text-xs text-slate-500 font-bold">{checkoutItems.length} دورات محددة</p>
                </div>
              </div>

              {/* Items in Checkout */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{item.duration || 'دورة تدريبية معتمدة'}</span>
                    </div>
                    <span className="text-xs font-black text-[#173A7C] shrink-0">
                      <span className="text-emerald-700">متاحة مجاناً مؤقتاً</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Temporary free-access summary */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>القيمة الأصلية:</span>
                  <span className="line-through text-slate-400">{originalSubtotal} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>المطلوب دفعه الآن:</span>
                  <span className="text-xl text-emerald-700">0 ر.س</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="rounded-2xl p-5 bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3.5">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-950">ضمان الاعتماد والجودة الرسمية</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-bold">
                  التسجيل متاح مجاناً بصورة مؤقتة لحين تفعيل وسائل الدفع، مع بقاء متطلبات إتمام الدورة والشهادة كما هي.
                </p>
              </div>
            </div>
          </div>

          {/* Payment & Student Data Form Column */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCheckout} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">بيانات المتدرب والتسجيل</h2>
                <p className="text-xs text-slate-500 font-bold mt-0.5">تأكد من صحة الاسم ورقم الجوال ورقم الهوية لطباعة واعتماد الشهادة</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">الاسم الكامل (كما سيظهر بالشهادة) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all"
                      placeholder="الاسم الثلاثي أو الرباعي"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">البريد الإلكتروني المسجل</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-500 text-xs font-bold cursor-not-allowed text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-slate-700">
                      رقم الجوال للتواصل وتوثيق الحساب *
                    </label>
                    {phone && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ محفوظ بملفك الشخصي
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all text-left font-mono"
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                    <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-slate-700">
                      رقم الهوية الوطنية / الإقامة (لإصدار الشهادة الرسمية) *
                    </label>
                    {nationalId && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ محفوظ بملفك الشخصي
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nationalIdInput}
                      onChange={(e) => setNationalIdInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#173A7C] focus:bg-white transition-all text-left font-mono"
                      placeholder="10XXXXXXXX"
                      dir="ltr"
                    />
                    <Shield className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>لا تحتاج لإدخال بيانات دفع. اضغط التأكيد لتفعيل جميع الدورات المحددة فوراً.</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0D5C3A] via-[#127A4D] to-[#0D5C3A] hover:from-[#127A4D] hover:to-[#0D5C3A] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#0D5C3A]/25 hover:shadow-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري تأكيد التسجيل وتفعيل الدورة...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>تفعيل الدورات مجاناً والبدء الفوري</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-[#173A7C] animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
