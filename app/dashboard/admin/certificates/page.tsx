'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  ShieldCheck,
  Crown,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileCheck,
  Search,
  Filter,
  Sliders,
  Settings,
  RefreshCw,
  Upload,
  UserPlus,
  ChevronLeft,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

interface CertificateTemplate {
  id: string;
  name: string;
  courseTitle: string;
  imageUrl: string;
  issuedCount: number;
  autoIssue: boolean;
}

interface IssuedCertificate {
  id: string;
  code: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  hours: string;
  status: 'active' | 'revoked';
  imageUrl: string;
}

export default function AdminCertificatesPage() {
  const [selectedTab, setSelectedTab] = useState<'templates' | 'registry'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIssuingModalOpen, setIsIssuingModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('برنامج القيادة المستدامة والمسؤولية المجتمعية');

  const templates: CertificateTemplate[] = [
    {
      id: 'tpl-1',
      name: 'قالب القيادة المستدامة والمسؤولية',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      imageUrl: '/1.png',
      issuedCount: 4850,
      autoIssue: true,
    },
    {
      id: 'tpl-2',
      name: 'قالب دبلوم التسامح والسلام',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      imageUrl: '/2.png',
      issuedCount: 3200,
      autoIssue: true,
    },
    {
      id: 'tpl-3',
      name: 'القالب الملكي الشرفي Ultra Gold',
      courseTitle: 'كافة المساقات المتقدمة والدبلومات العليا',
      imageUrl: '/images/certificates/royal_gold.png',
      issuedCount: 1790,
      autoIssue: false,
    },
  ];

  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([
    {
      id: 'cert-1',
      code: 'SA-TTI-2026-98421',
      studentName: 'عبدالله الشمري',
      courseTitle: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      issueDate: '15 مايو 2026',
      grade: 'ممتاز مرتفع (%98)',
      hours: '30 ساعة',
      status: 'active',
      imageUrl: '/1.png',
    },
    {
      id: 'cert-2',
      code: 'SA-TTI-2026-44109',
      studentName: 'عبدالله الشمري',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      issueDate: '28 يونيو 2026',
      grade: 'ممتاز (%95)',
      hours: '45 ساعة',
      status: 'active',
      imageUrl: '/2.png',
    },
    {
      id: 'cert-3',
      code: 'SA-TTI-2026-11892',
      studentName: 'سارة العتيبي',
      courseTitle: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      issueDate: '02 يوليو 2026',
      grade: 'ممتاز (%96)',
      hours: '40 ساعة',
      status: 'active',
      imageUrl: '/1.png',
    },
    {
      id: 'cert-4',
      code: 'SA-TTI-2026-55012',
      studentName: 'محمد الغامدي',
      courseTitle: 'دبلوم الحوكمة المؤسسية والتميز الأكاديمي',
      issueDate: '10 يوليو 2026',
      grade: 'جيد جداً (%88)',
      hours: '35 ساعة',
      status: 'active',
      imageUrl: '/2.png',
    },
  ]);

  const toggleStatus = (id: string) => {
    setIssuedCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' } : c))
    );
  };

  const handleIssueManualCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newCert: IssuedCertificate = {
      id: `cert-${Date.now()}`,
      code: `SA-TTI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: newStudentName,
      courseTitle: selectedCourse,
      issueDate: '27 يوليو 2026',
      grade: 'ممتاز مرتفع (%99)',
      hours: '30 ساعة',
      status: 'active',
      imageUrl: '/1.png',
    };

    setIssuedCertificates([newCert, ...issuedCertificates]);
    setNewStudentName('');
    setIsIssuingModalOpen(false);
  };

  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  };

  return (
    <div className="space-y-6">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-amber-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>استوديو المصمم للأدمن • إدارة الشهادات الرسمية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              مركز تحكم وإصدار الشهادات 👑
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              رفع القوالب المعتمدة، تخصيص أختام التوثيق، وإصدار الشهادات الفردية والجماعية بنقرة واحدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsIssuingModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-white/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>إصدار شهادة جديدة لمتدرب ⚡</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Templates vs Issued Registry) */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl" style={glassNeumorphicInset}>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedTab === 'templates'
              ? 'bg-white text-[#173A7C] shadow-md border border-white'
              : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>قوالب الشهادات الرسمية ({templates.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('registry')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedTab === 'registry'
              ? 'bg-white text-[#173A7C] shadow-md shadow-blue-900/10 border border-white'
              : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>سجل الشهادات الصادرة الموثقة ({issuedCertificates.length})</span>
        </button>
      </div>

      {/* ── TAB 1: TEMPLATES MANAGEMENT ── */}
      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-[28px] overflow-hidden border space-y-4 transition-all hover:shadow-xl group"
              style={glassNeumorphicCard}
            >
              {/* Template Image Header */}
              <div className="aspect-[1.414/1] relative bg-slate-900 overflow-hidden border-b border-white/60">
                <img
                  src={tpl.imageUrl}
                  alt={tpl.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-400 border border-amber-400/40 backdrop-blur-md">
                  {tpl.issuedCount.toLocaleString()} شهادة صادرة
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-slate-900">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{tpl.courseTitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={tpl.autoIssue}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>الإصدار التلقائي (100%)</span>
                  </label>

                  <button className="p-2 rounded-xl text-slate-600 hover:text-[#173A7C] hover:bg-slate-100 transition-colors cursor-pointer">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: ISSUED CERTIFICATES REGISTRY TABLE ── */}
      {selectedTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl" style={glassNeumorphicInset}>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم المتدرب أو كود التوثيق..."
                className="w-full py-2 pr-9 pl-4 text-xs font-bold text-slate-800 bg-white/80 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>جميع الشهادات موثقة بالسجل الوطني للتدريب 24/7</span>
            </div>
          </div>

          {/* Registry Table */}
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 ultra-card-hover" style={glassNeumorphicCard}>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200/60 text-slate-600 font-black">
                  <tr>
                    <th className="p-4">اسم المتدرب</th>
                    <th className="p-4">المساق التدريبي</th>
                    <th className="p-4">كود التوثيق</th>
                    <th className="p-4">تاريخ الإصدار</th>
                    <th className="p-4">التقدير</th>
                    <th className="p-4">حالة الاعتماد</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 font-bold">
                  {issuedCertificates
                    .filter(
                      (c) =>
                        c.studentName.includes(searchQuery) ||
                        c.code.includes(searchQuery) ||
                        c.courseTitle.includes(searchQuery)
                    )
                    .map((cert) => (
                      <tr key={cert.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-4 font-black text-slate-900">{cert.studentName}</td>
                        <td className="p-4 text-slate-700">{cert.courseTitle}</td>
                        <td className="p-4 font-mono font-black text-[#173A7C]">{cert.code}</td>
                        <td className="p-4 text-slate-600">{cert.issueDate}</td>
                        <td className="p-4 text-emerald-600 font-black">{cert.grade}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${cert.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                          >
                            {cert.status === 'active' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                نشطة ومعتمدة
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                ملغاة / مبطلة
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleStatus(cert.id)}
                              title={cert.status === 'active' ? 'إبطال الشهادة' : 'إعادة تفعيل الشهادة'}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <a
                              href={cert.imageUrl}
                              download={`شهادة_${cert.code}.png`}
                              className="p-2 rounded-xl text-slate-500 hover:text-[#173A7C] hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL CERTIFICATE ISSUANCE MODAL ── */}
      {isIssuingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 text-white rounded-[32px] border border-white/20 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm text-white">إصدار شهادة معتمدة جديدة</h3>
              </div>
              <button
                onClick={() => setIsIssuingModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueManualCertificate} className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-slate-300 block">اسم المتدرب المكتوب بالشهادة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبدالله الشمري"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 block">المساق أو الدبلوم التدريبي</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="برنامج القيادة المستدامة والمسؤولية المجتمعية">برنامج القيادة المستدامة والمسؤولية المجتمعية</option>
                  <option value="دبلوم التسامح والسلام والمواطنة الصالحة">دبلوم التسامح والسلام والمواطنة الصالحة</option>
                  <option value="الشهادة الاحترافية في إدارة الاستدامة البيئية">الشهادة الاحترافية في إدارة الاستدامة البيئية</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssuingModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black hover:scale-[1.02] transition-transform"
                >
                  إصدار وتوثيق الشهادة ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
