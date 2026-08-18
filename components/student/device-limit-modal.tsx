'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Laptop, Smartphone, Trash2, LogOut, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface RegisteredDevice {
  id?: string;
  device_id: string;
  device_name: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: string;
  last_active?: string;
  ip_address?: string;
}

interface DeviceLimitModalProps {
  isOpen: boolean;
  devices: RegisteredDevice[];
  currentDeviceInfo: {
    deviceId: string;
    deviceName: string;
    browser: string;
    os: string;
  };
  onDeviceReplaced: () => void;
}

export function DeviceLimitModal({
  isOpen,
  devices,
  currentDeviceInfo,
  onDeviceReplaced,
}: DeviceLimitModalProps) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRevokeAndActivate = async (oldDeviceId: string) => {
    setRevokingId(oldDeviceId);
    setErrorMessage(null);
    try {
      // 1. Delete old device
      const delRes = await fetch('/api/auth/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: oldDeviceId }),
      });

      if (!delRes.ok) {
        throw new Error('فشل في إزالة الجهاز القديم، يرجى المحاولة مرة أخرى');
      }

      // 2. Register current device
      const regRes = await fetch('/api/auth/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentDeviceInfo),
      });

      const regData = await regRes.json();
      if (regData.success || regData.status === 'allowed') {
        onDeviceReplaced();
      } else {
        throw new Error(regData.message || 'فشل في تسجيل الجهاز الحالي');
      }
    } catch (err: any) {
      console.error('Error replacing device:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء استبدال الجهاز');
    } finally {
      setRevokingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      window.location.href = '/auth/login';
    }
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return 'نشط مؤخراً';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'نشط مؤخراً';
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-[family-name:var(--font-cairo)]"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 relative overflow-hidden text-right"
        >
          {/* Top Decorative Alert Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 shrink-0">
              <ShieldAlert className="w-7 h-7 text-amber-600" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-100/80 text-amber-800 border border-amber-200">
                حماية الحساب وسياسة الأجهزة
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                تجاوز الحد الأقصى للأجهزة المصرح بها
              </h2>
              <p className="text-xs text-slate-600 font-bold leading-relaxed pt-1">
                وفقاً لسياسة منصة النبض المستدام، يُسمح لكل متدرب بالتسجيل من <span className="text-[#173A7C] font-black">جهازين فقط</span> في نفس الوقت لحماية أمان حسابك ومحتوى الدورات.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Device Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white text-[#173A7C] shadow-xs">
                {currentDeviceInfo.deviceName.includes('iPhone') || currentDeviceInfo.deviceName.includes('هاتف') ? (
                  <Smartphone className="w-4 h-4" />
                ) : (
                  <Laptop className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="block font-black text-[#173A7C]">الجهاز الحالي الذي تحاول الدخول منه:</span>
                <span className="text-slate-600 font-bold text-[11px]">
                  {currentDeviceInfo.deviceName} ({currentDeviceInfo.browser})
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#173A7C] text-white">
              جديد (قيد التفعيل)
            </span>
          </div>

          {/* Registered Devices List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-700">
              الأجهزة المسجلة حالياً في حسابك (اختر جهازاً لإلغاء ربطه واستبداله):
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {devices.map((device, idx) => (
                <div
                  key={device.device_id || idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-200/80 text-slate-700 shrink-0">
                      {device.device_name?.includes('iPhone') || device.device_name?.includes('هاتف') ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 truncate">
                        {device.device_name || 'جهاز مسجل'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        {device.browser || 'متصفح'} • آخر نشاط: {formatLastActive(device.last_active)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeAndActivate(device.device_id)}
                    disabled={revokingId !== null}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/80 hover:border-red-600 text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {revokingId === device.device_id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الاستبدال...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إلغاء الربط والاستبدال</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج من الحساب</span>
            </button>

            <span className="text-[11px] text-slate-400 font-bold">
              الحد الأقصى: جهازين لكل متدرب
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
