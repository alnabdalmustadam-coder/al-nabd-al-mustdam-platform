"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseBySlug, courses } from "@/data/courses";
import Button from "@/components/ui/Button";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  BookOpen, 
  Loader2, 
  User, 
  Lock, 
  Sparkles,
  Smartphone,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

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
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // Card details (visual simulation)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Authenticate user and prefill or redirect
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // Redirect to register with checkout destination
          router.push(`/auth/register?redirect=${encodeURIComponent(`/checkout?slug=${slug}`)}`);
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.push(`/auth/register?redirect=${encodeURIComponent(`/checkout?slug=${slug}`)}`);
          return;
        }
        
        // Populate states
        setEmail(data.user.email || "");
        setUserName(data.user.name || "");
        
        // Retrieve full profile details to get phone
        const supabase = createClient();
        const { data: profileData } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", data.user.id || "")
          .maybeSingle();

        const userPhone = profileData?.phone || data.user.phone || "";
        setPhone(userPhone);
        if (userPhone) {
          setPhoneInput(userPhone);
        }
        
        setAuthLoading(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push(`/auth/register?redirect=${encodeURIComponent(`/checkout?slug=${slug}`)}`);
      }
    }
    checkAuth();
  }, [slug, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("البريد الإلكتروني مطلوب لإتمام التسجيل");
      return;
    }

    // Phone number is mandatory
    const finalPhone = phone || phoneInput;
    if (!finalPhone.trim()) {
      setErrorMessage("رقم الجوال مطلوب لإكمال عملية التسجيل واعتماد الشهادة");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // If user provided phone number for the first time, save it to profile
      if (!phone && phoneInput) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          await supabase
            .from("profiles")
            .update({ phone: phoneInput })
            .eq("id", userData.user.id);
        }
      }

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
      router.push("/dashboard/student?enrollSuccess=true");
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء إتمام التسجيل");
      setIsSubmitting(false);
    }
  };

  const coursePrice = course.price;
  const vat = parseFloat((coursePrice * 0.15).toFixed(2));
  const total = parseFloat((coursePrice + vat).toFixed(2));

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
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100/50 relative overflow-hidden text-slate-800 font-sans">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation / Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="text-right">
            <span className="text-[#5CB07C] text-xs font-black tracking-widest uppercase bg-[#5CB07C]/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3 border border-[#5CB07C]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#5CB07C]" />
              بوابة الدفع الآمنة
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#173A7C]">إتمام <span className="text-[#5CB07C]">الطلب والاشتراك</span></h1>
          </div>
          <Link 
            href={`/courses/${course.slug}`} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-sm font-bold transition-all text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            الرجوع لتفاصيل الدورة
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

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Checkout Form Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Logged in Profile details (Visual Only) */}
            <div className="bg-white border border-slate-200 backdrop-blur-md rounded-[28px] p-8 shadow-xl shadow-slate-200/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5CB07C]/5 rounded-bl-full pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#5CB07C]/10 border border-[#5CB07C]/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#5CB07C]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#173A7C]">بيانات الاشتراك والحساب</h3>
                    <p className="text-xs text-slate-500 font-medium">تم التحقق من هويتك بنجاح ومزامنتها مع الطلب.</p>
                  </div>
                </div>
                <div className="bg-[#5CB07C]/10 text-[#5CB07C] border border-[#5CB07C]/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  حساب نشط ومسجل
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold block mb-1">الاسم الكامل</span>
                  <span className="text-base font-black text-slate-700">{userName || "-"}</span>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold block mb-1">البريد الإلكتروني</span>
                  <span className="text-base font-black text-slate-700 truncate block" dir="ltr">{email || "-"}</span>
                </div>

                {/* If user doesn't have phone, ask for it here */}
                {!phone ? (
                  <div className="sm:col-span-2 bg-[#5CB07C]/5 border border-[#5CB07C]/20 p-5 rounded-2xl">
                    <label className="text-sm font-black text-[#5CB07C] block mb-2 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      رقم الجوال (مطلوب لإكمال الطلب) *
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-1 focus:ring-[#5CB07C] outline-none text-base transition-all"
                      placeholder="+966 5X XXX XXXX"
                      dir="ltr"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">ملاحظة: هذا الحقل ضروري لاعتماد شهادات NELC الحكومية وتلقي إشعارات الدورة.</p>
                  </div>
                ) : (
                  <div className="sm:col-span-2 bg-slate-50/80 border border-slate-100 p-4 rounded-2xl">
                    <span className="text-xs text-slate-400 font-bold block mb-1">رقم الجوال</span>
                    <span className="text-base font-black text-slate-700" dir="ltr">{phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-white border border-slate-200 backdrop-blur-md rounded-[28px] p-8 shadow-xl shadow-slate-200/30">
              <h2 className="text-xl font-black text-[#173A7C] mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#5CB07C]" />
                طريقة الدفع الآمنة
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { key: "card", label: "بطاقة ائتمانية", logo: "💳" },
                  { key: "mada", label: "مدى", logo: "🏦" },
                  { key: "apple", label: "Apple Pay", logo: " Pay" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={`p-5 rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                      paymentMethod === m.key
                        ? "bg-[#5CB07C]/10 border-[#5CB07C] text-[#5CB07C] shadow-lg shadow-[#5CB07C]/10 scale-[1.02]"
                        : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <div className={`text-2xl transition-transform duration-300 group-hover:scale-110`}>{m.logo}</div>
                    <div className="text-sm font-black">{m.label}</div>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === "card" && (
                  <motion.div
                    key="card-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Futuristic Credit Card Widget Simulation */}
                    <div className="relative mx-auto max-w-sm h-48 rounded-2xl bg-gradient-to-tr from-[#173A7C] to-[#2E5EAA] border border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-hidden mb-6 text-white">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-9 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center font-bold text-amber-500 text-xs">CHIP</div>
                        <span className="font-bold text-white tracking-widest text-lg">VISA</span>
                      </div>
                      
                      <div className="text-center font-mono text-xl tracking-[0.2em] text-white my-3 relative z-10">
                        {cardNumber.padEnd(16, "•").replace(/(.{4})/g, "$1 ")}
                      </div>

                      <div className="flex justify-between items-end relative z-10 font-sans">
                        <div>
                          <span className="text-[10px] text-slate-300 block uppercase font-bold">صاحب البطاقة</span>
                          <span className="text-sm font-bold text-white truncate max-w-[200px] block">{userName || "اسم المتدرب"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-300 block uppercase font-bold">الانتهاء</span>
                          <span className="text-sm font-bold text-white tracking-wider">{cardExpiry || "MM/YY"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-3">
                        <label className="text-sm font-bold text-slate-600 block mb-2">رقم البطاقة</label>
                        <div className="relative">
                          <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            maxLength={16}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                            required={paymentMethod === "card"}
                            className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:bg-white focus:ring-1 focus:ring-[#5CB07C] outline-none text-base font-mono"
                            placeholder="XXXX XXXX XXXX XXXX"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-bold text-slate-600 block mb-2">تاريخ الانتهاء</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (val.length === 2 && !val.includes("/")) {
                              val += "/";
                            }
                            setCardExpiry(val);
                          }}
                          required={paymentMethod === "card"}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:bg-white focus:ring-1 focus:ring-[#5CB07C] outline-none text-base font-mono"
                          placeholder="MM/YY"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">الرمز السري (CVV)</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          required={paymentMethod === "card"}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-50/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:bg-white focus:ring-1 focus:ring-[#5CB07C] outline-none text-base font-mono"
                          placeholder="***"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "mada" && (
                  <motion.div
                    key="mada-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">دفع فوري عبر شبكة مدى الوطنية</h4>
                    <p className="text-xs text-slate-500">سيتم معالجة عملية الدفع بأمان مباشرة من حسابك البنكي.</p>
                  </motion.div>
                )}

                {paymentMethod === "apple" && (
                  <motion.div
                    key="apple-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 rounded-2xl bg-slate-50/50 border border-slate-200 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                      <span className="text-2xl text-black font-semibold"></span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">دفع بلمسة واحدة باستخدام Apple Pay</h4>
                    <p className="text-xs text-slate-500">تأكيد عملية الشراء فوري باستخدام بصمة الوجه أو الاصبع.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Security SSL seal */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 py-3 bg-slate-100 border border-slate-200 rounded-2xl">
              <Shield className="w-4 h-4 text-[#5CB07C]" />
              اتصال مشفر بـ SSL 256-bit. جميع تفاصيل الدفع آمنة ومحمية بالكامل.
            </div>
          </div>

          {/* Right Summary Column */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-slate-200 backdrop-blur-md rounded-[32px] p-8 shadow-xl shadow-slate-200/30 sticky top-28 space-y-6">
              <h2 className="text-lg font-black text-[#173A7C] border-b border-slate-100 pb-4">ملخص الاشتراك</h2>

              {/* Course Detail Badge */}
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5CB07C]/10 border border-[#5CB07C]/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-[#5CB07C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 leading-normal truncate">{course.title}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{course.duration} · {course.lessonsCount} درس</p>
                </div>
              </div>

              {/* Pricing Breakdowns */}
              <div className="space-y-4 pt-4 border-t border-slate-100 font-medium">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>سعر الدورة الأساسي</span>
                  <span>{coursePrice.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span>{vat.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-lg font-black pt-4 border-t border-slate-100 text-[#173A7C]">
                  <span>الإجمالي المطلوب</span>
                  <span className="text-[#5CB07C] flex items-baseline gap-1 text-xl">
                    {total.toFixed(2)}
                    <span className="text-xs text-slate-400 font-bold">ر.س</span>
                  </span>
                </div>
              </div>

              {/* Checkout submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base py-4 bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] hover:from-[#4EA06E] hover:to-[#5CB07C] text-white rounded-2xl font-black shadow-xl shadow-[#5CB07C]/20 border-0 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تأكيد الدفع وتفعيل الاشتراك...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    تأكيد الدفع والتسجيل الآمن
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] font-bold text-slate-400 leading-normal">
                بالضغط على الزر، أنت توافق على شروط وأحكام الأكاديمية وسياسة الخصوصية.
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
        <div className="w-10 h-10 border-4 border-[#5CB07C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
