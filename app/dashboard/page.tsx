"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Award, 
  Settings, 
  User, 
  Clock, 
  ChevronLeft, 
  TrendingUp, 
  Download, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  Play, 
  Activity, 
  FileCheck, 
  Zap, 
  Star,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Lock,
  Share2,
  Calendar,
  ShieldAlert
} from "lucide-react";
import { courses as allAvailableCourses } from "@/data/courses";

const sidebarLinks = [
  { key: "courses", label: "دوراتي", icon: BookOpen },
  { key: "certificates", label: "شهاداتي", icon: Award },
  { key: "xapi", label: "سجل التعلم (xAPI)", icon: Activity },
  { key: "profile", label: "ملفي", icon: User },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

const certificates: any[] = [];

// xAPI verb display mapping
const VERB_AR: Record<string, { label: string; color: string; icon: any }> = {
  registered: { label: "سجّل", color: "text-blue-600 bg-blue-50 border-blue-100", icon: FileCheck },
  launched: { label: "بدأ", color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: Play },
  progressed: { label: "تقدّم", color: "text-amber-600 bg-amber-50 border-amber-100", icon: TrendingUp },
  completed: { label: "أكمل", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  passed: { label: "اجتاز", color: "text-green-600 bg-green-50 border-green-100", icon: Award },
  attended: { label: "حضر", color: "text-purple-600 bg-purple-50 border-purple-100", icon: User },
  initialized: { label: "بدأ الدرس", color: "text-cyan-600 bg-cyan-50 border-cyan-100", icon: Zap },
  evaluated: { label: "قيّم", color: "text-orange-600 bg-orange-50 border-orange-100", icon: Star },
  terminated: { label: "أنهى", color: "text-slate-600 bg-slate-50 border-slate-100", icon: Clock },
};

// Helper: relative time display
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
  return `منذ ${Math.floor(diffDays / 30)} شهر`;
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("courses");
  const [imgError, setImgError] = useState(false);

  // Email-based auth (replaces next-auth)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState("متدرب النبض المستدام");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileNationalId, setProfileNationalId] = useState("");
  const [profileProfessionalId, setProfileProfessionalId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showIdentityGate, setShowIdentityGate] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [xapiStatements, setXapiStatements] = useState<any[]>([]);
  const [isLoadingXapi, setIsLoadingXapi] = useState(false);
  const [xapiFilter, setXapiFilter] = useState("all");

  // Evaluation states
  const [courseToEvaluate, setCourseToEvaluate] = useState<any>(null);
  const [evalRating, setEvalRating] = useState(5);
  const [evalFeedback, setEvalFeedback] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // 1. Check for email and name on mount (from URL param or cookies)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    const nameFromUrl = params.get("name");

    const setupSession = async () => {
      if (emailFromUrl) {
        const clean = emailFromUrl.toLowerCase().trim();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clean, name: nameFromUrl ? nameFromUrl.trim() : "" }),
        });
        setUserEmail(clean);
        if (nameFromUrl) {
          setUserName(nameFromUrl.trim());
          window.dispatchEvent(new Event("nabd_user_updated"));
        }
        window.history.replaceState({}, "", "/dashboard");
        setIsCheckingAuth(false);
      } else {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            setUserEmail(data.user.email);
            if (data.user.name) {
              setUserName(data.user.name);
            }
          } else {
            window.location.href = "https://members.nabdtraining.com/login";
            return;
          }
        } catch (e) {
          window.location.href = "https://members.nabdtraining.com/login";
          return;
        }
        setIsCheckingAuth(false);
      }
    };

    setupSession();
  }, []);

  // 2. Fetch profile when email is available — auto-sync from GHL if missing
  useEffect(() => {
    if (!userEmail) return;
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/auth/get-profile?email=${encodeURIComponent(userEmail!)}`);
        if (res.ok) {
          const data = await res.json();
          let profile = data.profile;

          // If profile is missing or has no name, sync from GHL first
          if (!profile || !profile.full_name) {
            try {
              const syncRes = await fetch(`/api/ghl/sync-contact?email=${encodeURIComponent(userEmail!)}`);
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData.synced && syncData.profile) {
                  profile = syncData.profile;
                }
              }
            } catch (syncErr) {
              console.error("GHL sync failed (non-fatal):", syncErr);
            }
          }

          if (profile) {
            if (profile.full_name) {
              setUserName(profile.full_name);
              // Sync name back to session cookie
              await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, name: profile.full_name }),
              });
              window.dispatchEvent(new Event("nabd_user_updated"));
            }
            if (profile.phone) setProfilePhone(profile.phone);
            if (profile.national_id) {
              setProfileNationalId(profile.national_id);
            }
            if (profile.professional_id) {
              setProfileProfessionalId(profile.professional_id);
            }
            if (profile.national_id) {
              setShowIdentityGate(false);
            } else {
              setShowIdentityGate(true);
            }
          } else {
            setShowIdentityGate(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
    fetchProfile();
  }, [userEmail]);

  // 3. Fetch courses when email is available
  useEffect(() => {
    if (!userEmail) return;
    async function fetchCourses() {
      setIsLoadingCourses(true);
      try {
        const res = await fetch(`/api/ghl/get-courses?email=${encodeURIComponent(userEmail!)}`);
        if (res.ok) {
          const data = await res.json();
          setEnrolledCourses(data.courses || []);
          setCompletedCount(data.completedCount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch courses");
      } finally {
        setIsLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [userEmail]);

  // 4. Fetch xAPI statements when email is available
  useEffect(() => {
    if (!userEmail) return;
    async function fetchXapi() {
      setIsLoadingXapi(true);
      try {
        const res = await fetch(`/api/xapi/statements?agent=${encodeURIComponent(userEmail!)}&limit=30`);
        if (res.ok) {
          const data = await res.json();
          setXapiStatements(data.statements || []);
        }
      } catch (err) {
        console.error("Failed to fetch xAPI statements");
      } finally {
        setIsLoadingXapi(false);
      }
    }
    fetchXapi();
  }, [userEmail]);

  const handleUpdateProfile = async () => {
    if (!userEmail) return;

    if (!userName || userName.trim().split(" ").length < 3) {
      setSaveMessage("يرجى إدخال الاسم الثلاثي باللغة العربية كما يظهر في الهوية الوطنية");
      return;
    }

    if (!profileNationalId || profileNationalId.trim() === "") {
      setSaveMessage("يرجى إدخال رقم الهوية الوطنية أولاً");
      return;
    }

    if (!/^[124]\d{9}$/.test(profileNationalId.trim())) {
      setSaveMessage("رقم الهوية الوطنية/الإقامة غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2 أو 4");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          fullName: userName,
          phone: profilePhone,
          nationalId: profileNationalId,
          professionalId: profileProfessionalId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("تم الحفظ بنجاح!");
        setShowIdentityGate(false);
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, name: userName }),
        });
        window.dispatchEvent(new Event("nabd_user_updated"));
        
        // Reload to sync profile data completely
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setSaveMessage(data.message || "حدث خطأ أثناء الحفظ");
      }
    } catch (err) {
      setSaveMessage("تعذر الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "https://members.nabdtraining.com/login?nabd_logout=true";
  };

  const handleEvaluate = async () => {
    if (!userEmail || !courseToEvaluate) return;
    setIsSubmittingEval(true);
    try {
      const res = await fetch("/api/evaluations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          courseId: courseToEvaluate.course_id,
          courseTitle: courseToEvaluate.title,
          rating: evalRating,
          feedback: evalFeedback
        }),
      });
      if (res.ok) {
        setEnrolledCourses(prev => prev.map(c => 
          c.course_id === courseToEvaluate.course_id ? { ...c, is_evaluated: true } : c
        ));
        setCourseToEvaluate(null);
        setEvalRating(5);
        setEvalFeedback("");
        
        // Refresh xAPI logs
        const xapiRes = await fetch(`/api/xapi/statements?agent=${encodeURIComponent(userEmail)}&limit=30`);
        if (xapiRes.ok) {
          const data = await xapiRes.json();
          setXapiStatements(data.statements || []);
        }
      } else {
        alert("حدث خطأ أثناء إرسال التقييم");
      }
    } catch (e) {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#173A7C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100/70 relative overflow-hidden">
      {/* Soft Premium Background Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#173A7C]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-[28px] p-6 sticky top-28">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center text-[#173A7C] shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-800 truncate">{userName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">متدرب نشط</p>
                  </div>
                </div>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeSection === link.key;
                  return (
                    <motion.button
                      key={link.key}
                      onClick={() => setActiveSection(link.key)}
                      whileHover={{ x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-extrabold transition-all cursor-pointer border-r-4 ${
                        isActive
                          ? "bg-gradient-to-r from-transparent to-[#173A7C]/5 border-r-[#173A7C] text-[#173A7C]"
                          : "border-r-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`} />
                      {link.label}
                    </motion.button>
                  );
                })}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 text-[13px] font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white p-8 sm:p-10 mb-8 rounded-[32px] shadow-lg shadow-[#173A7C]/15 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-60" />
              
              {/* Subtle top light gradient */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold text-white/95">لوحة التحكم الذكية</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3">
                    أهلاً بك، <span className="text-white">{userName.split(' ')[0]}</span> 👋
                  </h1>
                  <p className="text-base text-white/80 font-medium leading-relaxed">
                    تابع رحلتك التعليمية وحقق أهدافك المهنية بثقة من خلال بوابتك الأكاديمية الرسمية.
                  </p>
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4 min-w-[90px] sm:min-w-[110px] text-center flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-sora leading-none mb-1">{enrolledCourses.length}</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/70">دورات مسجلة</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4 min-w-[90px] sm:min-w-[110px] text-center flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-sora leading-none mb-1">{completedCount}</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/70">مكتملة</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4 min-w-[90px] sm:min-w-[110px] text-center flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-sora leading-none mb-1">{certificates.length}</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/70">شهادات</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Active Sections Container with Page-level Micro-Animations */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="space-y-6"
              >
                {/* Courses Section */}
                {activeSection === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">دوراتي المسجلة</h2>
                  {(showIdentityGate || isLoadingCourses) && (
                    <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      {isLoadingCourses ? "جاري جلب الدورات..." : "مطلوب توثيق الهوية"}
                    </span>
                  )}
                </div>

                {isLoadingCourses ? (
                  <div className="grid gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-[24px] animate-pulse">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-slate-100 rounded-[20px]" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                            <div className="h-3 bg-slate-50 rounded w-1/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : showIdentityGate ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-dashed border-[#173A7C]/20 rounded-[32px] p-10 text-center"
                  >
                    <div className="w-20 h-20 bg-[#173A7C]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award className="w-10 h-10 text-[#173A7C]" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">توثيق الهوية الوطنية مطلوب</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                      بناءً على تعليمات المركز الوطني للتعلم الإلكتروني (NELC)، يجب توثيق رقم الهوية الوطنية للتمكن من دخول الدورات والحصول على الشهادات المعتمدة.
                    </p>
                    <button
                      onClick={() => setActiveSection("profile")}
                      className="px-10 py-4 bg-[#173A7C] text-white rounded-2xl font-black hover:bg-[#1E4D9D] transition-all shadow-lg shadow-[#173A7C]/20 cursor-pointer"
                    >
                      توثيق الهوية الآن
                    </button>
                  </motion.div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="space-y-12">
                    {/* Redesigned Empty State */}
                    <div className="bg-white border border-slate-100 rounded-[28px] p-10 sm:p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد دورات نشطة حالياً</h3>
                      <p className="text-slate-400 max-w-md mx-auto text-sm font-semibold mb-6">
                        أنت غير مسجل في أي دورة تدريبية حالياً. ابدأ رحلتك التعليمية واشترك في إحدى دوراتنا المتميزة المعتمدة لتطوير مهاراتك.
                      </p>
                      <button
                        onClick={() => {
                          window.location.href = "/courses";
                        }}
                        className="px-6 py-3 bg-[#173A7C] text-white hover:bg-[#1E4D9D] font-bold text-sm rounded-xl transition-all shadow-sm shadow-[#173A7C]/10 cursor-pointer"
                      >
                        تصفح جميع الدورات
                      </button>
                    </div>

                    {/* Recommended Courses Section */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <h3 className="text-lg font-black text-slate-800">برامج تدريبية مقترحة لك</h3>
                        </div>
                        <span className="text-xs font-bold text-[#173A7C] hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.location.href = "/courses"}>
                          عرض الكل <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allAvailableCourses.slice(0, 3).map((course, idx) => {
                          return (
                            <motion.div 
                              key={course.id}
                              whileHover={{ scale: 1.02, y: -4 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                            >
                              {/* Top Bar Decoration */}
                              <div className="h-2 bg-gradient-to-r from-[#173A7C] to-[#5CB07C]" />
                              
                              <div className="p-6 flex flex-col flex-1">
                                {/* Category */}
                                <div className="mb-3">
                                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500">
                                    {course.category === "admin" ? "أعمال مكتبية" : course.category === "data" ? "إدخال بيانات" : "لغات"}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4 className="font-extrabold text-slate-800 text-sm mb-2 line-clamp-2 min-h-[40px]">
                                  {course.title}
                                </h4>

                                {/* Description */}
                                <p className="text-slate-400 text-xs font-medium line-clamp-3 mb-4 leading-relaxed">
                                  {course.description}
                                </p>

                                <div className="mt-auto space-y-4">
                                  {/* Metrics */}
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-50 pt-3">
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                                      {course.duration}
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-500">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      {course.rating}
                                    </span>
                                  </div>

                                  {/* Price and CTA */}
                                  <div className="flex items-center justify-between gap-3 pt-1">
                                    <div>
                                      {course.price === 0 ? (
                                        <span className="text-emerald-600 font-extrabold text-sm">مجاناً</span>
                                      ) : (
                                        <span className="text-slate-800 font-extrabold text-sm">{course.price} ر.س</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => {
                                        window.location.href = `/courses`;
                                      }}
                                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[#173A7C] border border-slate-100 hover:border-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                    >
                                      استعراض الدورة
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  enrolledCourses.map((c, i) => {
                    const isCompleted = c.status === "completed";
                    const progress = c.progress || 0;
                    const courseUrl = c.course_url || "https://members.nabdtraining.com";

                    return (
                      <motion.div
                        key={c.course_id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-white border shadow-sm p-6 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-md transition-shadow group ${
                          isCompleted ? "border-emerald-200" : "border-slate-200"
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-emerald-50 border border-emerald-100"
                            : "bg-[#173A7C]/5 group-hover:bg-[#173A7C]"
                        }`}>
                          {isCompleted
                            ? <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            : <BookOpen className="w-8 h-8 text-[#173A7C] group-hover:text-white transition-colors" />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-slate-900 text-lg truncate">{c.title}</h3>
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 shrink-0">
                                مكتمل ✓
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mb-3">
                            {isCompleted ? (
                              <><Award className="w-4 h-4" /> أكملت هذه الدورة بنجاح</>
                            ) : progress > 0 ? (
                              <><Clock className="w-4 h-4" /> استكمل من حيث توقفت</>
                            ) : (
                              <><Play className="w-4 h-4" /> ابدأ التعلم الآن</>
                            )}
                          </p>
                          {/* Progress Bar */}
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className={`h-full rounded-full ${
                                isCompleted ? "bg-emerald-500" : "bg-[#173A7C]"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Progress % */}
                        <div className="text-center shrink-0 min-w-16">
                          <div className={`text-2xl font-black font-sora ${
                            isCompleted ? "text-emerald-600" : "text-[#173A7C]"
                          }`}>{progress}%</div>
                          <div className="text-xs font-bold text-slate-400">مكتمل</div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                          {isCompleted && !c.is_evaluated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCourseToEvaluate(c);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all shadow-sm"
                            >
                              <Star className="w-4 h-4 fill-current" /> قيّم الدورة
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open("https://members.nabdtraining.com/account?activeTab=Certificates", '_blank');
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                              isCompleted
                                ? "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "bg-[#173A7C] text-white hover:bg-[#1E4D9D] shadow-md shadow-[#173A7C]/20"
                            }`}
                          >
                            {isCompleted ? (
                              <><Award className="w-4 h-4" /> عرض الشهادة</>
                            ) : progress > 0 ? (
                              <><ExternalLink className="w-4 h-4" /> استكمال</>
                            ) : (
                              <><Play className="w-4 h-4" /> ابدأ</>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Certificates */}
            {activeSection === "certificates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-slate-900">شهاداتي المعتمدة</h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    توثيق فوري مع NELC
                  </span>
                </div>

                {certificates.length === 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Certificate Preview Card Mockup */}
                    <div className="lg:col-span-6 flex flex-col">
                      <motion.div 
                        whileHover={{ scale: 1.02, rotate: -0.5, y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="border border-slate-100 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-center cursor-default"
                      >
                        <div className="border-2 border-amber-100 bg-amber-50/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between aspect-[1.414/1] text-center">
                          {/* Top corner accents */}
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-200" />
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-200" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-200" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-200" />
                          
                          {/* Stamp / Logo Placeholder */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                              <Award className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">منصة النبض المستدام</div>
                          </div>

                          {/* Certificate Body */}
                          <div className="my-auto space-y-2">
                            <h4 className="text-[11px] font-black text-amber-600 tracking-wider">شهادة إتمام برنامج تدريبي</h4>
                            <div className="w-8 h-px bg-amber-200 mx-auto" />
                            <h5 className="text-base font-black text-slate-800 tracking-wide mt-2">{userName}</h5>
                            <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                              لاجتيازه بنجاح متطلبات البرنامج التدريبي المعتمد من المركز الوطني للتعلم الإلكتروني.
                            </p>
                          </div>

                          {/* Stamp / QR Footer */}
                          <div className="flex justify-between items-end mt-4 border-t border-slate-50 pt-3">
                            <div className="text-right">
                              <div className="text-[9px] font-bold text-slate-300">التوقيع والختم المعتمد</div>
                              <div className="w-12 h-6 bg-slate-100/50 rounded mt-1 border border-slate-50" />
                            </div>
                            <div className="px-2 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black">
                              رقم التوثيق: {profileNationalId ? `SA-${profileNationalId.slice(0, 4)}-XXXX` : "SA-XXXX"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* How to acquire */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                      <motion.div 
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 flex-1 flex flex-col justify-between cursor-default"
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg font-black text-slate-800">كيف أحصل على شهادتي المعتمدة؟</h3>
                          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                            جميع البرامج التدريبية التي تنهيها بنجاح تؤهلك للحصول على شهادة معتمدة موثقة برقم هويتك الوطنية لتستخدمها في مسيرتك المهنية.
                          </p>

                          <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center shrink-0 text-[#173A7C] text-xs font-black">
                                ١
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">أكمل الدورة بنسبة 100%</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">شاهد جميع المحاضرات والدروس المدرجة في خطتك التدريبية.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center shrink-0 text-[#173A7C] text-xs font-black">
                                ٢
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">اجتز الاختبار والتقييمات</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">احصل على الدرجة المطلوبة في الاختبارات التقييمية بنهاية الفصول.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center shrink-0 text-[#173A7C] text-xs font-black">
                                ٣
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">الحصول المباشر والتنزيل</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">سيتم إنشاء الشهادة وتوثيقها فورياً لتنزيلها كملف PDF.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                          <span className="text-[10px] font-semibold text-slate-400 leading-normal flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            معتمدة ومطابقة لشروط NELC
                          </span>
                          <button
                            onClick={() => setActiveSection("courses")}
                            className="px-5 py-2.5 bg-[#173A7C] text-white hover:bg-[#1E4D9D] font-bold text-xs rounded-xl transition-all shadow-sm shadow-[#173A7C]/10 cursor-pointer"
                          >
                            ابدأ التعلم الآن
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-default"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                          <div className="w-16 h-16 rounded-[20px] bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Award className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base mb-1">{cert.title}</h3>
                            <p className="text-xs font-bold text-slate-400">تاريخ الإصدار: {cert.date} · رقم: {cert.id}</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 text-xs font-bold text-slate-600 hover:text-[#173A7C] hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
                          <Download className="w-4 h-4" />
                          تحميل PDF
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* xAPI Section */}
            {activeSection === "xapi" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Activity className="w-7 h-7 text-[#173A7C]" />
                    سجل التعلم الموثق (xAPI)
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      xAPI 1.0.3 متوافق
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                      NELC معتمد
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#173A7C]/5 to-[#1E4D9D]/5 border border-[#173A7C]/10 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    يتم تتبع جميع أنشطة التعلم الخاصة بك وفقاً لمعيار <strong className="text-[#173A7C]">xAPI (Experience API)</strong> المطلوب من المركز الوطني للتعلم الإلكتروني (NELC). يشمل التتبع: التسجيل، بدء الدورة، التقدم، والإكمال.
                  </p>
                </div>

                {/* Filter Tabs */}
                {xapiStatements.length > 0 && (
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setXapiFilter("all")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        xapiFilter === "all"
                          ? "bg-[#173A7C] text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      الكل ({xapiStatements.length})
                    </button>
                    <button
                      onClick={() => setXapiFilter("started")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        xapiFilter === "started"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      البدء ({xapiStatements.filter(s => {
                        const vk = s.verb?.display?.["en-US"];
                        return vk === "launched" || vk === "initialized";
                      }).length})
                    </button>
                    <button
                      onClick={() => setXapiFilter("progress")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        xapiFilter === "progress"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      التقدم ({xapiStatements.filter(s => {
                        const vk = s.verb?.display?.["en-US"];
                        return vk === "progressed" || s.result?.extensions?.["https://nabdtraining.com/extensions/progress"] !== undefined;
                      }).length})
                    </button>
                    <button
                      onClick={() => setXapiFilter("completed")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        xapiFilter === "completed"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      الإكمال ({xapiStatements.filter(s => {
                        const vk = s.verb?.display?.["en-US"];
                        return vk === "completed" || vk === "passed";
                      }).length})
                    </button>
                  </div>
                )}

                {isLoadingXapi ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-slate-100 p-5 rounded-[20px] animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-slate-50 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : xapiStatements.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[28px] p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-400">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد سجلات تعلم بعد</h3>
                    <p className="text-slate-400 font-semibold text-xs">ستظهر سجلات xAPI والأنشطة التعليمية هنا بمجرد بدء الدراسة.</p>
                  </div>
                ) : (
                  <div className="relative border-r border-slate-100 mr-4 pr-6 space-y-8 py-2">
                    {xapiStatements
                      .filter((stmt: any) => {
                        const verbKey = stmt.verb?.display?.["en-US"] || "unknown";
                        if (xapiFilter === "completed") {
                          return verbKey === "completed" || verbKey === "passed";
                        }
                        if (xapiFilter === "started") {
                          return verbKey === "launched" || verbKey === "initialized";
                        }
                        if (xapiFilter === "progress") {
                          return verbKey === "progressed" || stmt.result?.extensions?.["https://nabdtraining.com/extensions/progress"] !== undefined;
                        }
                        return true;
                      })
                      .map((stmt: any, i: number) => {
                        const verbKey = stmt.verb?.display?.["en-US"] || "unknown";
                        const verbInfo = VERB_AR[verbKey] || { label: verbKey, color: "text-slate-600 bg-slate-50 border-slate-100", icon: Activity };
                        const VerbIcon = verbInfo.icon;
                        const objectName = stmt.object?.definition?.name?.["ar-SA"] || stmt.object?.definition?.name?.["en-US"] || "نشاط تعليمي";
                        const timestamp = stmt.timestamp ? new Date(stmt.timestamp) : new Date();
                        const timeAgo = getTimeAgo(timestamp);
                        const progress = stmt.result?.extensions?.["https://nabdtraining.com/extensions/progress"];

                        return (
                          <motion.div
                            key={stmt.id || i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative group"
                          >
                            <div className={`absolute right-[-31.5px] top-1.5 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                              verbKey === "completed" || verbKey === "passed"
                                ? "bg-emerald-500 shadow-emerald-200"
                                : verbKey === "launched" || verbKey === "initialized"
                                ? "bg-blue-500 shadow-blue-200"
                                : "bg-slate-400 shadow-slate-200"
                            }`} />

                            <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 rounded-3xl hover:shadow-md transition-shadow duration-300">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${verbInfo.color} shadow-sm`}>
                                    <VerbIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${verbInfo.color}`}>
                                        {verbInfo.label}
                                      </span>
                                      <h4 className="font-extrabold text-slate-800 text-sm">{objectName}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {timeAgo}
                                      </span>
                                      {progress !== undefined && (
                                        <span className="flex items-center gap-1 text-amber-500">
                                          <TrendingUp className="w-3.5 h-3.5" />
                                          {progress}%
                                        </span>
                                      )}
                                      {stmt.result?.completion && (
                                        <span className="flex items-center gap-1 text-emerald-600">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          مكتمل
                                        </span>
                                      )}
                                      {stmt.result?.score && (
                                        <span className="flex items-center gap-1 text-blue-600">
                                          <Award className="w-3.5 h-3.5" />
                                          {Math.round(stmt.result.score.scaled * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="sm:text-left text-slate-400 shrink-0 text-xs font-bold font-sora mt-2 sm:mt-0 border-t border-slate-50 sm:border-0 pt-2 sm:pt-0">
                                  <div>{timestamp.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}</div>
                                  <div className="text-slate-300 font-normal">{timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_12px_40px_rgba(23,58,124,0.04)] p-8 rounded-[28px]">
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b border-slate-100/80 pb-4">الملف الشخصي</h2>
                <div className="space-y-6 max-w-xl">
                  {saveMessage && (
                    <div className={`p-4 rounded-2xl text-sm font-bold border ${
                      saveMessage.includes('بنجاح') 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {saveMessage}
                    </div>
                  )}
                  <div>
                    <label htmlFor="profile-name" className="text-sm font-bold text-slate-600 block mb-2">الاسم الكامل (ثلاثي باللغة العربية)</label>
                    <input 
                      id="profile-name" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/80 text-slate-800 focus:border-[#173A7C] focus:bg-white focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold transition-all" 
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-sm font-bold text-slate-600 block mb-2">البريد الإلكتروني</label>
                    <input 
                      id="profile-email" 
                      defaultValue={userEmail || ""} 
                      readOnly 
                      disabled 
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/50 border border-slate-200/40 text-slate-400 focus:outline-none text-base font-semibold cursor-not-allowed" 
                      dir="ltr" 
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="text-sm font-bold text-slate-600 block mb-2">رقم الجوال <span className="text-slate-400 font-normal">(اختياري)</span></label>
                    <input 
                      id="profile-phone" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)} 
                      placeholder="05XXXXXXXX" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/80 text-slate-800 focus:border-[#173A7C] focus:bg-white focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold transition-all" 
                      dir="ltr" 
                    />
                  </div>
                  
                  <div className={`p-6 rounded-2xl border transition-all ${
                    showIdentityGate 
                      ? 'bg-amber-50/50 border-amber-100' 
                      : 'bg-[#173A7C]/5 border-[#173A7C]/10'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <label htmlFor="profile-national-id" className={`text-sm font-bold block ${showIdentityGate ? 'text-amber-700' : 'text-[#173A7C]'}`}>
                        رقم الهوية الوطنية / الإقامة <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        <Lock className="w-3.5 h-3.5" />
                        تشفير آمن AES-256
                      </div>
                    </div>
                    
                    <input
                      id="profile-national-id"
                      value={profileNationalId}
                      onChange={(e) => setProfileNationalId(e.target.value)}
                      placeholder="1XXXXXXXXX"
                      className={`w-full px-5 py-3.5 rounded-xl border outline-none text-base font-semibold mb-3 ${
                        showIdentityGate 
                          ? 'border-amber-200 bg-white focus:border-amber-500' 
                          : 'border-slate-200 bg-white focus:border-[#173A7C]'
                      }`}
                      dir="ltr"
                    />

                    {/* Status Info */}
                    <div className="flex items-start gap-2.5 mt-2 bg-white/50 p-3 rounded-lg border border-slate-100">
                      <ShieldAlert className={`w-5 h-5 shrink-0 ${showIdentityGate ? 'text-amber-500' : 'text-[#173A7C]'}`} />
                      <p className="text-[11px] font-bold text-slate-500 leading-normal">
                        يتطلب المركز الوطني للتعلم الإلكتروني (NELC) ربط الهوية لاعتماد ونقل سجلات تقدمك الأكاديمي. يتم تشفير هويتك بالكامل وإرسالها بأمان للجهات الحكومية المعنية.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="profile-professional-id" className="text-sm font-bold text-slate-600 block mb-2">رقم التصنيف المهني <span className="text-slate-400 font-normal">(اختياري - لساعات التعليم المستمر)</span></label>
                    <input 
                      id="profile-professional-id" 
                      value={profileProfessionalId} 
                      onChange={(e) => setProfileProfessionalId(e.target.value)} 
                      placeholder="رقم التصنيف (إن وجد)" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/80 text-slate-800 focus:border-[#173A7C] focus:bg-white focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold transition-all" 
                      dir="ltr" 
                    />
                  </div>
                  <button 
                    onClick={handleUpdateProfile} 
                    disabled={isSaving} 
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-base font-bold cursor-pointer hover:shadow-lg hover:shadow-[#173A7C]/15 transition-all mt-4 disabled:opacity-70 border-0"
                  >
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_12px_40px_rgba(23,58,124,0.04)] p-8 rounded-[28px]">
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b border-slate-100/80 pb-4">الإعدادات</h2>
                <div className="space-y-4 max-w-xl">
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 cursor-pointer hover:bg-white hover:shadow-sm transition-all duration-300">
                    <span className="text-base font-bold text-slate-700">إشعارات البريد الإلكتروني</span>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 cursor-pointer hover:bg-white hover:shadow-sm transition-all duration-300">
                    <span className="text-base font-bold text-slate-700">إشعارات واتساب</span>
                    <div className="relative">
                      <input type="checkbox" className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                    </div>
                  </label>
                </div>
              </div>
            )}
              </motion.div>
            </AnimatePresence>

            {/* Recent Activity Feed */}
            <div className="mt-14">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-[#173A7C]" />
                نشاط التعلم الأخير
              </h2>
              {xapiStatements.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm p-12 rounded-[28px] text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">لا يوجد نشاط تعلم أخير حتى الآن.</p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm p-6 rounded-[28px]">
                  <div className="space-y-4">
                    {xapiStatements.slice(0, 5).map((stmt: any, i: number) => {
                      const verbKey = stmt.verb?.display?.["en-US"] || "unknown";
                      const verbInfo = VERB_AR[verbKey] || { label: verbKey, color: "text-slate-600 bg-slate-50 border-slate-100", icon: Activity };
                      const objectName = stmt.object?.definition?.name?.["ar-SA"] || stmt.object?.definition?.name?.["en-US"] || "نشاط تعليمي";
                      const timestamp = stmt.timestamp ? new Date(stmt.timestamp) : new Date();

                      return (
                        <div key={stmt.id || i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-slate-50 transition-colors duration-200">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${verbInfo.color} shadow-sm`}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {verbInfo.label} — {objectName}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-slate-400 shrink-0 font-sora">
                            {timestamp.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {courseToEvaluate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900">تقييم الدورة</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">{courseToEvaluate.title}</p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-700 text-center mb-3">ما هو تقييمك العام للدورة؟</p>
                <div className="flex justify-center gap-2 flex-row-reverse">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEvalRating(star)}
                      aria-label={`تقييم ${star} نجوم`}
                      title={`تقييم ${star} نجوم`}
                      className={`p-2 transition-transform hover:scale-110 focus:outline-none`}
                    >
                      <Star 
                        className={`w-8 h-8 ${evalRating >= star ? 'text-orange-500 fill-orange-500' : 'text-slate-200 fill-slate-200'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">تعليقك (اختياري)</label>
                <textarea
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="أخبرنا برأيك في الدورة..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none resize-none text-sm font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCourseToEvaluate(null)}
                  className="flex-1 py-3.5 px-4 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={isSubmittingEval}
                  className="flex-1 py-3.5 px-4 rounded-xl text-white font-bold bg-[#173A7C] hover:bg-[#1E4D9D] transition-colors shadow-md shadow-[#173A7C]/20 disabled:opacity-70"
                >
                  {isSubmittingEval ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Global Identity Verification Modal */}
      {showIdentityGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm dir-rtl" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 bg-white border border-slate-100 rounded-[32px] p-8 max-w-lg w-full shadow-2xl overflow-hidden text-right"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#173A7C]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#173A7C]/10">
                <Award className="w-8 h-8 text-[#173A7C]" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 font-[family-name:var(--font-cairo)]">توثيق الهوية الوطنية مطلوب</h3>
              <p className="text-sm text-slate-500 mt-3 font-semibold leading-relaxed">
                بناءً على تعليمات المركز الوطني للتعلم الإلكتروني (NELC)، يجب توثيق رقم الهوية الوطنية أو الإقامة لتفعيل حسابك والتمكن من حضور الدورات والحصول على الشهادات المعتمدة.
              </p>
            </div>

            {saveMessage && (
              <div className={`p-4 rounded-2xl text-sm font-bold mb-5 text-center border ${
                saveMessage.includes('بنجاح') 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">الاسم الكامل (ثلاثي باللغة العربية)</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="أدخل اسمك الثلاثي باللغة العربية"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">رقم الهوية الوطنية / الإقامة</label>
                <input
                  type="text"
                  value={profileNationalId}
                  onChange={(e) => setProfileNationalId(e.target.value)}
                  placeholder="مثال: 1XXXXXXXXX"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">رقم الجوال (اختياري)</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] outline-none text-base font-semibold"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-2">
              <button
                onClick={handleLogout}
                className="order-2 sm:order-1 flex-1 py-3.5 px-4 rounded-2xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="order-1 sm:order-2 flex-1 py-3.5 px-4 rounded-2xl text-white font-bold bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] transition-all shadow-lg shadow-[#173A7C]/20 border-0 disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? "جاري الحفظ..." : "حفظ وتفعيل الحساب"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
