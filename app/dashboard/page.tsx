"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, Settings, User, Clock, ChevronLeft, TrendingUp, Download, LogOut, ExternalLink, CheckCircle2, Play, Activity, FileCheck, Zap, Star } from "lucide-react";

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

    if (!profileNationalId || profileNationalId.trim() === "") {
      setSaveMessage("يرجى إدخال رقم الهوية الوطنية أولاً");
      return;
    }

    if (!/^[124]\d{9}$/.test(profileNationalId.trim())) {
      setSaveMessage("رقم الهوية الوطنية غير صالح. يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2 أو 4");
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
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 sticky top-28">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 rounded-full bg-[#173A7C]/5 border border-[#173A7C]/10 flex items-center justify-center text-[#173A7C]">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{userName}</h3>
                  <p className="text-sm font-medium text-slate-500">متدرب</p>
                </div>
              </div>
              <nav className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.key}
                      onClick={() => setActiveSection(link.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeSection === link.key
                          ? "bg-[#173A7C]/10 text-[#173A7C]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white p-8 sm:p-10 mb-8 rounded-[32px] shadow-xl shadow-[#173A7C]/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-100" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-2">
                    أهلاً بك، <span className="text-white">{userName.split(' ')[0]}</span> 👋
                  </h1>
                  <p className="text-base text-white/80 font-medium">تابع رحلتك التعليمية وحقق أهدافك المهنية بثقة.</p>
                </div>
                <div className="flex items-center gap-6 text-center bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
                  <div>
                    <div className="text-3xl font-black text-white mb-1 font-sora">{enrolledCourses.length}</div>
                    <div className="text-sm font-semibold text-white/80">دورات مسجلة</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div>
                    <div className="text-3xl font-black text-white mb-1 font-sora">{completedCount}</div>
                    <div className="text-sm font-semibold text-white/80">مكتملة</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div>
                    <div className="text-3xl font-black text-white mb-1 font-sora">{certificates.length}</div>
                    <div className="text-sm font-semibold text-white/80">شهادات</div>
                  </div>
                </div>
              </div>
            </motion.div>

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
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد دورات مسجلة بعد</h3>
                    <p className="text-slate-500 font-medium">ابدأ رحلتك التعليمية واشترك في إحدى دوراتنا المتميزة.</p>
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

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(courseUrl, '_blank');
                          }}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
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
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Certificates */}
            {activeSection === "certificates" && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-6">شهاداتي</h2>
                {certificates.length === 0 ? (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-16 text-center text-slate-500 font-medium">لا توجد شهادات حالياً</div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert, i) => (
                      <div key={i} className="bg-white border border-slate-200 shadow-sm p-6 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                          <div className="w-16 h-16 rounded-[20px] bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Award className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{cert.title}</h3>
                            <p className="text-sm font-medium text-slate-500">تاريخ الإصدار: {cert.date} · رقم: {cert.id}</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#173A7C] hover:border-[#173A7C]/30 transition-all cursor-pointer shadow-sm">
                          <Download className="w-4 h-4" />
                          تحميل PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeSection === "profile" && (
              <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[24px]">
                <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">الملف الشخصي</h2>
                <div className="space-y-6 max-w-xl">
                  {saveMessage && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${saveMessage.includes('بنجاح') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {saveMessage}
                    </div>
                  )}
                  <div>
                    <label htmlFor="profile-name" className="text-sm font-bold text-slate-700 block mb-2">الاسم الكامل</label>
                    <input id="profile-name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-medium" />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
                    <input id="profile-email" defaultValue={userEmail || ""} readOnly disabled className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 focus:outline-none text-base font-medium cursor-not-allowed" dir="ltr" />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="text-sm font-bold text-slate-700 block mb-2">رقم الجوال <span className="text-slate-400 font-normal">(اختياري)</span></label>
                    <input id="profile-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="05XXXXXXXX" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-medium" dir="ltr" />
                  </div>
                  <div className={`p-5 rounded-2xl border transition-all ${showIdentityGate ? 'bg-amber-50 border-amber-200 animate-pulse' : 'bg-blue-50/50 border-blue-100'}`}>
                    <label htmlFor="profile-national-id" className={`text-sm font-bold block mb-2 ${showIdentityGate ? 'text-amber-700' : 'text-[#173A7C]'}`}>رقم الهوية الوطنية / الإقامة <span className="text-red-500">*</span></label>
                    <input
                      id="profile-national-id"
                      value={profileNationalId}
                      onChange={(e) => setProfileNationalId(e.target.value)}
                      placeholder="1XXXXXXXXX"
                      className={`w-full px-5 py-3.5 rounded-xl bg-white border outline-none text-base font-medium mb-2 ${showIdentityGate ? 'border-amber-300 focus:border-amber-500' : 'border-blue-200 focus:border-[#173A7C]'}`}
                      dir="ltr"
                    />
                    <p className={`text-xs font-medium leading-relaxed ${showIdentityGate ? 'text-amber-600' : 'text-slate-500'}`}>
                      * إدخال رقم الهوية الوطنية <strong className="text-slate-900">إلزامي</strong> وفقاً لمتطلبات المركز الوطني للتعلم الإلكتروني (NELC) لاعتماد شهادتك.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="profile-professional-id" className="text-sm font-bold text-slate-700 block mb-2">رقم التصنيف المهني <span className="text-slate-400 font-normal">(اختياري - لساعات التعليم المستمر)</span></label>
                    <input id="profile-professional-id" value={profileProfessionalId} onChange={(e) => setProfileProfessionalId(e.target.value)} placeholder="رقم التصنيف (إن وجد)" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none text-base font-medium" dir="ltr" />
                  </div>
                  <button onClick={handleUpdateProfile} disabled={isSaving} className="px-8 py-3.5 rounded-2xl bg-[#173A7C] text-white text-base font-bold cursor-pointer hover:bg-[#1E4D9D] transition-all shadow-md shadow-[#173A7C]/20 mt-4 disabled:opacity-70">
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeSection === "settings" && (
              <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[24px]">
                <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">الإعدادات</h2>
                <div className="space-y-4 max-w-xl">
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-base font-bold text-slate-700">إشعارات البريد الإلكتروني</span>
                    <input type="checkbox" defaultChecked className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-base font-bold text-slate-700">إشعارات واتساب</span>
                    <input type="checkbox" className="accent-[#173A7C] w-5 h-5 cursor-pointer" />
                  </label>
                </div>
              </div>
            )}

            {/* xAPI Learning Records */}
            {activeSection === "xapi" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Activity className="w-7 h-7 text-[#173A7C]" />
                    سجل التعلم (xAPI)
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      xAPI 1.0.3 متوافق
                    </span>
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                      NELC معتمد
                    </span>
                  </div>
                </div>

                {/* xAPI Info Banner */}
                <div className="bg-gradient-to-r from-[#173A7C]/5 to-[#1E4D9D]/5 border border-[#173A7C]/10 rounded-2xl p-5 mb-6">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    يتم تتبع جميع أنشطة التعلم الخاصة بك وفقاً لمعيار <strong className="text-[#173A7C]">xAPI (Experience API)</strong> المطلوب من المركز الوطني للتعلم الإلكتروني (NELC). يشمل التتبع: التسجيل، بدء الدورة، التقدم، والإكمال.
                  </p>
                </div>

                {isLoadingXapi ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-slate-200 p-5 rounded-[20px] animate-pulse">
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
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد سجلات تعلم بعد</h3>
                    <p className="text-slate-500 font-medium">ستظهر سجلات xAPI هنا عند بدء أي نشاط تعليمي.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {xapiStatements.map((stmt: any, i: number) => {
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
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white border border-slate-200 shadow-sm p-5 rounded-[20px] hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${verbInfo.color}`}>
                              <VerbIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${verbInfo.color}`}>
                                  {verbInfo.label}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm truncate">{objectName}</h4>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {timeAgo}
                                </span>
                                {progress !== undefined && (
                                  <span className="flex items-center gap-1 text-amber-600">
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
                            <div className="text-left shrink-0">
                              <div className="text-xs font-medium text-slate-400 font-sora">
                                {timestamp.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                              </div>
                              <div className="text-xs font-medium text-slate-300 font-sora">
                                {timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
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

            {/* Activity Timeline (now uses xAPI data) */}
            <div className="mt-14">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-[#173A7C]" />
                نشاط التعلم الأخير
              </h2>
              {xapiStatements.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm p-12 rounded-[24px] text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">لا يوجد نشاط تعلم أخير حتى الآن.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-[24px]">
                  <div className="space-y-4">
                    {xapiStatements.slice(0, 5).map((stmt: any, i: number) => {
                      const verbKey = stmt.verb?.display?.["en-US"] || "unknown";
                      const verbInfo = VERB_AR[verbKey] || { label: verbKey, color: "text-slate-600 bg-slate-50 border-slate-100", icon: Activity };
                      const objectName = stmt.object?.definition?.name?.["ar-SA"] || stmt.object?.definition?.name?.["en-US"] || "نشاط تعليمي";
                      const timestamp = stmt.timestamp ? new Date(stmt.timestamp) : new Date();

                      return (
                        <div key={stmt.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${verbInfo.color}`}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {verbInfo.label} — {objectName}
                            </p>
                          </div>
                          <p className="text-xs font-medium text-slate-400 shrink-0">
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
    </div>
  );
}
