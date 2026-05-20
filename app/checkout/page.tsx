"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCourseBySlug, courses } from "@/data/courses";
import Button from "@/components/ui/Button";
import { CreditCard, Shield, CheckCircle, ArrowLeft, BookOpen, Loader2 } from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug") || "computer-basics-office";
  
  // Find selected course
  const course = getCourseBySlug(slug) || courses[0];

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Prefill profile if logged in
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setEmail(data.user.email || "");
            const nameParts = (data.profile?.full_name || "").split(" ");
            if (nameParts.length > 0) {
              setFirstName(nameParts[0]);
              setLastName(nameParts.slice(1).join(" "));
            }
            setPhone(data.profile?.phone || "");
          }
        }
      } catch (err) {
        console.error("Failed to prefill user session:", err);
      }
    }
    loadProfile();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("البريد الإلكتروني مطلوب لإتمام التسجيل");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Trigger local direct enrollment API
      const enrollRes = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          courseId: course.ghlCourseId || `course-${course.slug}`,
          courseTitle: course.title,
          courseUrl: `/courses/${course.slug}`,
        }),
      });

      if (!enrollRes.ok) {
        const errData = await enrollRes.json();
        throw new Error(errData.message || "فشل تسجيل الدورة محلياً");
      }

      // 2. Redirect to Student Dashboard
      router.push("/dashboard?enrollSuccess=true");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء إتمام التسجيل");
      setIsSubmitting(false);
    }
  };

  const coursePrice = course.price;
  const vat = parseFloat((coursePrice * 0.15).toFixed(2));
  const total = parseFloat((coursePrice + vat).toFixed(2));

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center sm:text-right">
          <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
            تأكيد التسجيل
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">إتمام <span className="gradient-text">الطلب</span></h1>
          <p className="text-slate-500 text-base font-medium max-w-xl">أكمل بيانات الدفع بأمان لتأكيد تسجيلك في الدورة والبدء في التعلم فوراً.</p>
        </motion.div>

        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold text-center">
            {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Info */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">بيانات الطالب</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">الاسم الأول</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base"
                    placeholder="الاسم"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">اسم العائلة</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base"
                    placeholder="العائلة"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base"
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">طريقة الدفع</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { key: "card", label: "بطاقة ائتمان", icon: "💳" },
                  { key: "mada", label: "مدى", icon: "🏦" },
                  { key: "apple", label: "Apple Pay", icon: "🍎" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={`p-5 rounded-2xl border text-center transition-all cursor-pointer shadow-sm ${
                      paymentMethod === m.key
                        ? "bg-[#173A7C]/5 border-[#173A7C] text-[#173A7C] shadow-[#173A7C]/10"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-sm font-bold">{m.label}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">رقم البطاقة</label>
                    <div className="relative">
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" pattern="\d*" maxLength={16} className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="XXXX XXXX XXXX XXXX" dir="ltr" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">تاريخ الانتهاء</label>
                      <input type="text" maxLength={5} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="MM/YY" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">CVV</label>
                      <input type="password" maxLength={3} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-sora" placeholder="***" dir="ltr" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 mt-6 pb-6">
              <Shield className="w-5 h-5 text-emerald-600" />
              بياناتك محمية بتشفير SSL 256-bit. لا نخزّن بيانات بطاقتك الائتمانية البتة.
            </div>
          </div>

          {/* Order Summary */}
          <aside>
            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[32px] p-8 sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">ملخص الطلب</h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-[#173A7C]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-normal truncate">{course.title}</h4>
                    <p className="text-xs font-semibold text-slate-500">{course.duration} · {course.lessonsCount} درس تفاعلي</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 mb-8">
                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>سعر الدورة</span>
                  <span className="text-slate-900">{coursePrice.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span className="text-slate-900">{vat.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-xl font-black pt-4 border-t border-slate-100 text-slate-900">
                  <span>الإجمالي</span>
                  <span className="text-[#173A7C] flex items-center gap-1">{total.toFixed(2)} <span className="text-sm text-slate-500">ر.س</span></span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-lg py-4 shadow-xl shadow-[#173A7C]/10 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري إتمام التسجيل...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 rtl:mirror" />
                    تأكيد الدفع والتسجيل
                  </>
                )}
              </Button>

              <p className="text-center text-sm font-medium text-slate-400 mt-6">
                نضمن لك استرداد كامل المبلغ خلال 7 أيام إذا لم تكن راضياً عن الدورة
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#173A7C]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
