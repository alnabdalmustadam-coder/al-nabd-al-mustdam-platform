"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Send, CheckCircle, User, Phone, Mail, GraduationCap,
  Briefcase, Building2, UserPlus, Star, Trophy, Award,
  Sparkles, MessageSquare, Info
} from "lucide-react";

interface FormState {
  name: string;
  phone: string;
  email: string;
  qualification: string;
  jobTitle: string;
  employer: string;
  marketerName: string;
  aspirations: string;
  interests: string;
  notes: string;
  membershipCategory: "silver" | "gold" | "platinum" | "";
}

const initialFormState: FormState = {
  name: "",
  phone: "",
  email: "",
  qualification: "",
  jobTitle: "",
  employer: "",
  marketerName: "",
  aspirations: "",
  interests: "",
  notes: "",
  membershipCategory: "",
};

const membershipTiers = [
  {
    id: "silver",
    label: "العضوية الفضية",
    badge: "شركاء التميز",
    icon: Award,
    color: "from-slate-300 to-slate-500",
    glow: "shadow-slate-400/20",
    text: "text-slate-700",
  },
  {
    id: "gold",
    label: "العضوية الذهبية",
    badge: "شركاء الأصالة",
    icon: Star,
    color: "from-amber-400 to-yellow-600",
    glow: "shadow-amber-500/30",
    text: "text-amber-700",
  },
  {
    id: "platinum",
    label: "العضوية البلاتينية",
    badge: "شركاء الإبداع",
    icon: Trophy,
    color: "from-blue-400 to-indigo-600",
    glow: "shadow-indigo-500/30",
    text: "text-indigo-700",
  }
];

export default function MembershipPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; type: "warning" | "error"; message: string }>({ open: false, type: "warning", message: "" });

  const showAlert = (message: string, type: "warning" | "error" = "warning") => {
    setAlertModal({ open: true, type, message });
  };

  const updateForm = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ═══ Completion progress ═══ */
  const progress = useMemo(() => {
    const essential = [form.name, form.phone, form.email, form.membershipCategory].filter(f => f !== "").length;
    return Math.round((essential / 4) * 100);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      showAlert("يرجى ملء الاسم، الجوال والبريد الإلكتروني أولاً", "warning");
      return;
    }

    if (!form.membershipCategory) {
      showAlert("يرجى اختيار فئة العضوية المناسبة لك", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "membership", ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showAlert("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ═══ Alert Modal Component ═══ */
  const AlertModal = () => (
    <AnimatePresence>
      {alertModal.open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setAlertModal((p) => ({ ...p, open: false }))}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full shadow-[0_30px_80px_-15px_rgba(23,58,124,0.3)] border border-slate-100 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#173A7C] via-[#2E5EA6] to-[#5CB07C]" />
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none ${alertModal.type === "error" ? "bg-gradient-to-bl from-red-500/[0.04]" : "bg-gradient-to-bl from-amber-500/[0.04]"} to-transparent`} />
            <div className="mb-5"><img src="/logo.svg" alt="Logo" className="h-10 mx-auto object-contain" /></div>
            <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg ${
              alertModal.type === "error"
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20"
                : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20"
            }`}>
              {alertModal.type === "error" ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{alertModal.type === "error" ? "خطأ!" : "تنبيه!"}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-7">{alertModal.message}</p>
            <button onClick={() => setAlertModal((p) => ({ ...p, open: false }))} className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">حسناً، فهمت</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ═══ Input field helper ═══ */
  const inputClass = "w-full px-5 py-4 rounded-[20px] bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all duration-300 text-[15px] font-medium shadow-sm hover:border-slate-300";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AlertModal />
      
      {/* ═══════════ BACKGROUND ═══════════ */}
      <div className="fixed inset-0 z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.92] via-slate-50/[0.88] to-blue-50/[0.85]" />
      </div>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#5CB07C]/[0.06] rounded-full blur-[200px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#173A7C]/[0.06] rounded-full blur-[180px] pointer-events-none translate-y-1/2 -translate-x-1/3 z-0" />

      <div className="relative z-10 pb-24 pt-28">
        {/* ═══════════ HERO HEADER ═══════════ */}
        <section className="relative px-4 sm:px-6 mb-12 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#173A7C]" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">عضوية التميز</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
              استمارة طلب{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
                عضوية الشراكة
              </span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              انضم إلى شركاء النجاح واستمتع بمزايا حصرية وخصومات تدريبية متقدمة من خلال فئات العضوية المصممة بعناية.
            </p>

            {/* Progress indicator */}
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">بدء الاستمارة</span>
                <span className="text-xs font-black text-[#5CB07C]">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ═══════════ SUCCESS STATE ═══════════ */
            <motion.section key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#173A7C]/[0.02] to-[#5CB07C]/[0.03] pointer-events-none" />
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative z-10">
                  <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] flex items-center justify-center shadow-2xl shadow-[#173A7C]/25">
                    <UserPlus className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">تم إرسال طلبك!</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                    مرحباً بك في أسرة المركز. سيقوم فريقنا بمراجعة طلبك وتفعيل العضوية قريباً جداً. تواصل معنا لمزيد من التفاصيل.
                  </p>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            /* ═══════════ FORM ═══════════ */
            <section className="max-w-5xl mx-auto px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* ─── Part 1: Personal Data ─── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-white/60 shadow-xl relative text-right">
                  <div className="flex items-center gap-4 mb-10 justify-end">
                    <div className="text-right">
                      <h2 className="text-2xl font-black text-slate-900">البيانات الشخصية والمهنية</h2>
                      <p className="text-sm text-slate-400 font-medium mt-1">يُرجى تعبئة الحقول الأساسية بالأرقام المعتادة (123)</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center shadow-lg shadow-[#173A7C]/20 shrink-0">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">الاسم بالكامل <User className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={inputClass} placeholder="أدخل اسمك الثلاثي" />
                    </div>
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">رقم الجوال <Phone className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} dir="ltr" className={`${inputClass} text-right`} placeholder="05XXXXXXXX" />
                    </div>
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">البريد الإلكتروني <Mail className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className={inputClass} placeholder="example@domain.com" />
                    </div>
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">المؤهل <GraduationCap className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="text" value={form.qualification} onChange={(e) => updateForm("qualification", e.target.value)} className={inputClass} placeholder="ماجستير، بكالوريوس..." />
                    </div>
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">المسمى الوظيفي <Briefcase className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className={inputClass} placeholder="أدخل وظيفتك الحالية" />
                    </div>
                    <div>
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">جهة العمل <Building2 className="w-4 h-4 text-[#173A7C]" /></label>
                      <input type="text" value={form.employer} onChange={(e) => updateForm("employer", e.target.value)} className={inputClass} placeholder="اسم الشركة أو المؤسسة" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">اسم المسوق الذي يتواصل معي بشكل مباشر</label>
                      <input type="text" value={form.marketerName} onChange={(e) => updateForm("marketerName", e.target.value)} className={inputClass} placeholder="اختياري" />
                    </div>
                  </div>
                </motion.div>

                {/* ─── Part 2: Aspirations and Interests ─── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-xl text-right">
                  <div className="space-y-10">
                    <div>
                      <label className="block text-[15px] font-bold text-slate-800 mb-3">الوظائف التي أطمح في الوصول إليها خلال ثلاث (3) سنوات</label>
                      <textarea rows={3} value={form.aspirations} onChange={(e) => updateForm("aspirations", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-[#173A7C] outline-none text-[15px] resize-none leading-relaxed text-right" placeholder="أدخل رؤيتك المهنية..." />
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-slate-800 mb-3">مجالات الاهتمام في مجال التنمية البشرية خارج إطار الوظيفة</label>
                      <textarea rows={3} value={form.interests} onChange={(e) => updateForm("interests", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-[#173A7C] outline-none text-[15px] resize-none leading-relaxed text-right" placeholder="مثال: القيادة، التطوع..." />
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-slate-800 mb-3">ملاحظات إضافية</label>
                      <textarea rows={2} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-[#173A7C] outline-none text-[15px] resize-none leading-relaxed text-right" placeholder="أي معلومات أخرى تود إضافتها" />
                    </div>
                  </div>
                </motion.div>

                {/* ─── Part 3: Membership Tiers & Badges ─── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-[#173A7C]/10 shadow-[0_30px_100px_-20px_rgba(23,58,124,0.1)] relative overflow-hidden text-right">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#173A7C]/[0.03] to-transparent pointer-events-none" />
                  
                  <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center justify-end gap-3">
                    فئات العضوية المناسبة
                    <Star className="w-6 h-6 text-amber-500" />
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {membershipTiers.map((tier) => {
                      const Icon = tier.icon;
                      const isActive = form.membershipCategory === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => updateForm("membershipCategory", tier.id)}
                          className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-500 text-center ${
                            isActive 
                              ? `bg-gradient-to-br ${tier.color} border-transparent text-white shadow-2xl ${tier.glow} scale-[1.03]` 
                              : "bg-white border-slate-100 text-slate-600 hover:border-[#173A7C]/20 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isActive ? "bg-white/20" : "bg-slate-50 text-slate-400 group-hover:text-[#173A7C]"
                          }`}>
                            <Icon className={`w-8 h-8 ${isActive ? "text-white" : ""}`} />
                          </div>
                          <h3 className={`text-lg font-black mb-1 ${isActive ? "text-white" : "text-slate-800"}`}>{tier.label}</h3>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>{tier.badge}</span>
                          
                          {isActive && (
                            <motion.div layoutId="active-marker" className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-4 h-4 text-slate-950" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* ─── Part 4: Important Notes ─── */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-slate-950/90 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 text-right relative overflow-hidden">
                  <div className="absolute top-0 right-1/2 translate-x-1/2 w-40 h-1.5 bg-[#173A7C] rounded-full opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-end gap-3">
                    ملاحظات هامة
                    <Info className="w-5 h-5 text-blue-400" />
                  </h3>
                  <div className="space-y-4 text-[14px] text-slate-300 font-medium leading-relaxed">
                    <p>• استمارة الطلب مجانية ويتم مراجعتها من قبل إدارة المركز واعتماد العضوية حسب الأعداد المحددة وفقاً للضوابط التي وضعها المركز.</p>
                    <p>• الخصومات المخصصة لكل عضو تقدم إضافة إلى الخصومات المعلن عنها في وسائل التواصل.</p>
                    <p>• الاشتراك في العضوية لمدة عام هجري غير ملزم بالتجديد ولا يلزم المتدرب بأي التزامات في حال عدم رغبته الاشتراك في أي برنامج.</p>
                    <p>• المركز غير ملزم بأي التزامات محددة يفرضها المتدرب من حيث عنوان الدورة أو تاريخ تنفيذها أو المدرب غير متوافقة مع خطة المركز.</p>
                    <p className="text-amber-400 font-bold mt-6">رقم واتساب للتواصل والإستفسار: 0123456789</p>
                  </div>
                </motion.div>

                {/* Submit button */}
                <div className="flex justify-start">
                  <Button type="submit" size="lg" className="px-14 shadow-2xl shadow-[#173A7C]/30 group rounded-full" disabled={loading}>
                    {loading ? "جاري المعالجة..." : <span className="flex items-center gap-3">إرسال الطلب <Send className="w-5 h-5 rtl:rotate-180" /></span>}
                  </Button>
                </div>

              </form>
            </section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
