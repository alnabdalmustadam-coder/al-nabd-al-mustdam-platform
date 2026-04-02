"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Send, CheckCircle, User, Phone, Briefcase, Building,
  Sparkles, ClipboardCheck, Users, MessageSquare, Globe,
  ChevronLeft, ChevronRight, Award, Coffee
} from "lucide-react";

type Rating = "عالي" | "متوسط" | "منخفض" | "";

interface FormState {
  name: string;
  phone: string;
  jobTitle: string;
  employer: string;

  trainerIdea: Rating;
  trainerSkills: Rating;
  trainerNotes: Rating;
  trainerMotivation: Rating;
  trainerExercises: Rating;

  centerRegistration: Rating;
  centerTreatment: Rating;
  centerResponse: Rating;
  centerOrganization: Rating;

  hallHospitality: Rating;
  hallLighting: Rating;
  hallAC: Rating;
  hallAV: Rating;
  hallCleanliness: Rating;

  notes: string;
  source: string;
}

const initialFormState: FormState = {
  name: "",
  phone: "",
  jobTitle: "",
  employer: "",
  
  trainerIdea: "",
  trainerSkills: "",
  trainerNotes: "",
  trainerMotivation: "",
  trainerExercises: "",
  
  centerRegistration: "",
  centerTreatment: "",
  centerResponse: "",
  centerOrganization: "",
  
  hallHospitality: "",
  hallLighting: "",
  hallAC: "",
  hallAV: "",
  hallCleanliness: "",
  
  notes: "",
  source: "",
};

const sources = [
  "موقعنا الإلكتروني الرسمي", "فيس بوك", "سناب شات", "تليجرام", "تويتر",
  "انستقرام", "يوتيوب", "واتساب", "قريب أو صديق", "مصادر أخرى",
];

const steps = [
  { id: 0, label: "البيانات", icon: User },
  { id: 1, label: "المدرب", icon: ClipboardCheck },
  { id: 2, label: "فريق الإشراف", icon: Users },
  { id: 3, label: "القاعة والخدمات", icon: Coffee },
  { id: 4, label: "إضافات", icon: MessageSquare },
];

export default function OfflineEvaluationPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [alertModal, setAlertModal] = useState<{ open: boolean; type: "warning" | "error"; message: string }>({ open: false, type: "warning", message: "" });

  const showAlert = (message: string, type: "warning" | "error" = "warning") => {
    setAlertModal({ open: true, type, message });
  };

  const updateForm = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ═══ Completion progress ═══ */
  const progress = useMemo(() => {
    const ratingFields: (keyof FormState)[] = [
      "trainerIdea", "trainerSkills", "trainerNotes", "trainerMotivation", "trainerExercises",
      "centerRegistration", "centerTreatment", "centerResponse", "centerOrganization",
      "hallHospitality", "hallLighting", "hallAC", "hallAV", "hallCleanliness",
    ];
    const filled = ratingFields.filter((k) => form[k] !== "").length;
    const hasName = form.name.trim() !== "";
    const hasPhone = form.phone.trim() !== "";
    const total = ratingFields.length + 2;
    return Math.round(((filled + (hasName ? 1 : 0) + (hasPhone ? 1 : 0)) / total) * 100);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields from step 0
    if (!form.name.trim() || !form.phone.trim()) {
      setActiveStep(0);
      window.scrollTo({ top: 200, behavior: "smooth" });
      showAlert("يرجى ملء اسم المتدرب ورقم الجوال أولاً", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "evaluation-offline", ...form }),
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

  const goNext = () => {
    // Validate step 0 before moving forward
    if (activeStep === 0 && (!form.name.trim() || !form.phone.trim())) {
      showAlert("يرجى ملء الحقول الإجبارية (الاسم، الجوال)", "warning");
      return;
    }
    if (activeStep < steps.length - 1) setActiveStep((s) => s + 1);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };
  const goPrev = () => { if (activeStep > 0) setActiveStep((s) => s - 1); window.scrollTo({ top: 200, behavior: "smooth" }); };

  /* ═══ Alert Modal Component ═══ */
  const AlertModal = () => (
    <AnimatePresence>
      {alertModal.open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setAlertModal((p) => ({ ...p, open: false }))}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full shadow-[0_30px_80px_-15px_rgba(23,58,124,0.3)] border border-slate-100 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#173A7C] via-[#2E5EA6] to-[#5CB07C]" />
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none ${alertModal.type === "error" ? "bg-gradient-to-bl from-red-500/[0.04]" : "bg-gradient-to-bl from-amber-500/[0.04]"} to-transparent`} />

            {/* Logo */}
            <div className="mb-5">
              <img src="/logo.svg" alt="Logo" className="h-10 mx-auto object-contain" />
            </div>

            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg ${
              alertModal.type === "error"
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20"
                : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20"
            }`}>
              {alertModal.type === "error" ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-3">
              {alertModal.type === "error" ? "خطأ!" : "تنبيه!"}
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-7">
              {alertModal.message}
            </p>
            <button
              onClick={() => setAlertModal((p) => ({ ...p, open: false }))}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              حسناً، فهمت
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ═══ Rating Row Component ═══ */
  const RatingRow = ({ label, fieldName, index }: { label: string; fieldName: keyof FormState; index: number }) => {
    const value = form[fieldName] as Rating;
    const ratings: { label: Rating; emoji: string; color: string; bg: string; ring: string; glow: string }[] = [
      { label: "عالي", emoji: "😃", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-500/30", glow: "shadow-emerald-500/20" },
      { label: "متوسط", emoji: "😐", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-500/30", glow: "shadow-amber-500/20" },
      { label: "منخفض", emoji: "😞", color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-500/30", glow: "shadow-rose-500/20" },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
        className="group relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between py-5 px-5 -mx-5 rounded-[20px] hover:bg-slate-50/80 transition-all duration-300 gap-4">
          <div className="flex items-start gap-3 md:max-w-[55%]">
            <span className="w-7 h-7 rounded-xl bg-[#173A7C]/5 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black text-[#173A7C]/60">
              {index + 1}
            </span>
            <span className="text-slate-700 font-bold text-[15px] leading-relaxed">{label}</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
            {ratings.map((r) => {
              const isSelected = value === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => updateForm(fieldName, r.label)}
                  className={`relative flex-1 md:w-[110px] py-3 px-3 rounded-full text-sm font-bold transition-all duration-400 flex items-center justify-center gap-2 ${isSelected
                      ? `${r.bg} ${r.color} ring-2 ${r.ring} shadow-lg ${r.glow} scale-[1.02]`
                      : "bg-white border border-slate-200/80 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                    }`}
                >
                  <span className={`text-base transition-transform duration-300 ${isSelected ? "scale-110" : "scale-90 grayscale opacity-40"}`}>
                    {r.emoji}
                  </span>
                  {r.label}
                  {isSelected && (
                    <motion.div
                      layoutId={`check-${fieldName}`}
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${r.color}`} />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  /* ═══ Input field helper ═══ */
  const inputClass = "w-full px-5 py-4 rounded-[20px] bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all duration-300 text-[15px] font-medium shadow-sm hover:border-slate-300";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ═══ Alert Modal ═══ */}
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
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">نموذج التقييم</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
              استمارة تقييم{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
                دورة تدريبية
              </span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              يسعدنا تلقي تقييمك للبرنامج التدريبي، حيث تساهم ملاحظاتك في تحسين جودة خدماتنا وبرامجنا القادمة.
            </p>

            {/* Progress indicator */}
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">نسبة الإكمال</span>
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
            <motion.section
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto px-4 sm:px-6"
            >
              <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-[#5CB07C]/[0.03] pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/[0.04] to-transparent rounded-bl-full pointer-events-none" />

                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10"
                >
                  <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-[#5CB07C] flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                    <Award className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">شكراً لك!</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                    تم استلام تقييمك بنجاح، نقدر وقتك ومساهمتك في تطوير برامجنا التدريبية.
                  </p>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold">
                    <CheckCircle className="w-4 h-4" />
                    تم إرسال التقييم بنجاح
                  </div>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            /* ═══════════ FORM ═══════════ */
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6">
              {/* ═══ Step Navigation ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-2.5 border border-white/60 shadow-lg flex items-center gap-1.5">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = activeStep === i;
                    const isPast = activeStep > i;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => { setActiveStep(i); window.scrollTo({ top: 200, behavior: "smooth" }); }}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-3 sm:py-3.5 rounded-[1.25rem] text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                            ? "bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] text-white shadow-lg shadow-[#173A7C]/20"
                            : isPast
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                          }`}
                      >
                        {isPast && !isActive ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        ) : (
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden text-[10px]">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* ═══ Step Content ═══ */}
              <AnimatePresence mode="wait">
                {/* ─── Step 0: Personal Info ─── */}
                {activeStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#173A7C]/[0.03] to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center shadow-lg shadow-[#173A7C]/20">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">البيانات الشخصية</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">يرجى إدخال بياناتك الأساسية</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <User className="w-4 h-4 text-[#173A7C]" /> اسم المتدرب <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" required value={form.name} onChange={(e) => updateForm("name", e.target.value)}
                          className={inputClass} placeholder="أدخل اسمك الكريم"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Phone className="w-4 h-4 text-[#173A7C]" /> رقم الجوال <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel" required value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} dir="ltr"
                          className={`${inputClass} text-right`} placeholder="05XXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Briefcase className="w-4 h-4 text-[#173A7C]" /> الوظيفة
                        </label>
                        <input
                          type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)}
                          className={inputClass} placeholder="المسمى الوظيفي"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Building className="w-4 h-4 text-[#173A7C]" /> جهة العمل
                        </label>
                        <input
                          type="text" value={form.employer} onChange={(e) => updateForm("employer", e.target.value)}
                          className={inputClass} placeholder="المؤسسة / الشركة"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 1: Trainer Evaluation ─── */}
                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-500/[0.03] to-transparent rounded-br-full pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <ClipboardCheck className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">تقييم البرنامج التدريبي والأداء التدريبي (المدرب)</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">تقييم المدرب والمحتوى</p>
                      </div>
                    </div>

                    <div className="relative z-10 divide-y divide-slate-100/80">
                      <RatingRow label="القدرة على ايصال الأفكار وربطها بالواقع العملي والاجتماعي" fieldName="trainerIdea" index={0} />
                      <RatingRow label="مدى ما اكتسبته من مهارات ومعلومات جديدة" fieldName="trainerSkills" index={1} />
                      <RatingRow label="مدى رضاك عن مذكرة البرنامج التدريبي" fieldName="trainerNotes" index={2} />
                      <RatingRow label="قدرة المدرب على تحفيز المشاركين وتفاعلهم" fieldName="trainerMotivation" index={3} />
                      <RatingRow label="تنوع التمارين والأنشطة التطبيقية" fieldName="trainerExercises" index={4} />
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 2: Center Evaluation ─── */}
                {activeStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/[0.03] to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">تقييم فريق الإشراف والاستقبال (المركز)</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">المركز وفريق الدعم</p>
                      </div>
                    </div>

                    <div className="relative z-10 divide-y divide-slate-100/80">
                      <RatingRow label="سرعة التسجيل واجراءات الدخول" fieldName="centerRegistration" index={0} />
                      <RatingRow label="التعامل الودود والبشاشة" fieldName="centerTreatment" index={1} />
                      <RatingRow label="سرعة التجاوب للتساؤلات" fieldName="centerResponse" index={2} />
                      <RatingRow label="مستوى التنظيم بشكل عام" fieldName="centerOrganization" index={3} />
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 3: Hall Evaluation ─── */}
                {activeStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/[0.03] to-transparent rounded-br-full pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Coffee className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">تقييم مستوى القاعة والخدمات (الفندق)</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">مكان التدريب والضيافة</p>
                      </div>
                    </div>

                    <div className="relative z-10 divide-y divide-slate-100/80">
                      <RatingRow label="مستوى الضيافة (كوفي بريك)" fieldName="hallHospitality" index={0} />
                      <RatingRow label="الإضاءة المريحة في قاعة التدريب" fieldName="hallLighting" index={1} />
                      <RatingRow label="كفاءة التكييف" fieldName="hallAC" index={2} />
                      <RatingRow label="وضوح وكفاءة البرجكتور والشاشات والسمعيات" fieldName="hallAV" index={3} />
                      <RatingRow label="مستوى النظافة بشكل عام" fieldName="hallCleanliness" index={4} />
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 4: Notes and Sources ─── */}
                {activeStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/[0.03] to-transparent rounded-bl-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-10">
                      {/* Notes Section */}
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <MessageSquare className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900">أبرز الملاحظات والإقتراحات</h2>
                          </div>
                        </div>
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => updateForm("notes", e.target.value)}
                          className="w-full px-6 py-5 rounded-[20px] bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all text-[15px] font-medium resize-none leading-relaxed shadow-sm hover:border-slate-300"
                          placeholder="اكتب ملاحظاتك واقتراحاتك هنا..."
                        />
                      </div>

                      {/* Source Section */}
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <Globe className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-900">مصدر المعرفة</h2>
                            <p className="text-sm text-slate-400 font-medium mt-1">كيف تعرفت على الدورة؟</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {sources.map((src, i) => (
                            <motion.button
                              key={src}
                              type="button"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => updateForm("source", src)}
                              className={`px-5 py-3 rounded-full text-sm font-bold transition-all duration-300 ${form.source === src
                                ? "bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] text-white shadow-lg shadow-[#173A7C]/20 scale-[1.02]"
                                : "bg-white border border-slate-200 text-slate-600 hover:border-[#173A7C]/30 hover:bg-slate-50 hover:shadow-sm"
                                }`}
                            >
                              {src}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Navigation Footer ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center justify-between gap-4"
              >
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>

                <div className="flex items-center gap-2">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-500 ${activeStep === i ? "w-8 bg-[#173A7C]" : "w-2 bg-slate-200"
                        }`}
                    />
                  ))}
                </div>

                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] transition-all shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    التالي <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="px-10 shadow-xl shadow-[#173A7C]/20 group rounded-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        جاري الإرسال...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5 rtl:rotate-180 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform rtl:group-hover:-translate-x-0.5" />
                        إرسال التقييم
                      </span>
                    )}
                  </Button>
                )}
              </motion.div>
            </form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
