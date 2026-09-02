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
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md font-[family-name:var(--font-cairo)]"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-200/80 space-y-3 sm:space-y-5 relative overflow-hidden text-right max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
        >
          {/* Top Decorative Alert Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon & Title */}
          <div className="flex items-start gap-2.5 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
            </div>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <span className="inline-block px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-amber-100/80 text-amber-800 border border-amber-200">
                حماية الحساب وسياسة الأجهزة
              </span>
              <h2 className="text-sm sm:text-lg md:text-xl font-black text-slate-900 leading-tight">
                تجاوز الحد الأقصى للأجهزة المصرح بها
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-600 font-bold leading-relaxed pt-0.5 sm:pt-1">
                وفقاً لسياسة منصة النبض المستدام، يُسمح لكل متدرب بالتسجيل من <span className="text-[#173A7C] font-black">جهازين فقط</span> في نفس الوقت لحماية أمان حسابك.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-red-50 text-red-700 text-[10px] sm:text-xs font-bold border border-red-200 flex items-center gap-1.5 sm:gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Device Banner */}
          <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2 text-[10px] sm:text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white text-[#173A7C] shadow-xs shrink-0">
                {currentDeviceInfo.deviceName.includes('iPhone') || currentDeviceInfo.deviceName.includes('هاتف') ? (
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-black text-[#173A7C] text-[10px] sm:text-xs">جهازك الحالي:</span>
                <span className="text-slate-600 font-bold text-[9px] sm:text-[11px] truncate block">
                  {currentDeviceInfo.deviceName} ({currentDeviceInfo.browser})
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black bg-[#173A7C] text-white whitespace-nowrap shrink-0">
              جديد
            </span>
          </div>

          {/* Registered Devices List */}
          <div className="space-y-2">
            <h3 className="text-[10px] sm:text-xs font-black text-slate-700">
              اختر جهازاً لإلغاء ربطه واستبداله:
            </h3>

            <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-56 overflow-y-auto pr-1">
              {devices.map((device, idx) => (
                <div
                  key={device.device_id || idx}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-xs"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-200/80 text-slate-700 shrink-0">
                      {device.device_name?.includes('iPhone') || device.device_name?.includes('هاتف') ? (
                        <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 truncate text-[11px] sm:text-xs">
                        {device.device_name || 'جهاز مسجل'}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold mt-0.5">
                        {device.browser || 'متصفح'} • {formatLastActive(device.last_active)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeAndActivate(device.device_id)}
                    disabled={revokingId !== null}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/80 hover:border-red-600 text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {revokingId === device.device_id ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                        <span>جاري الاستبدال...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>إلغاء الربط والاستبدال</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-black flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>تسجيل الخروج</span>
            </button>

            <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold">
              الحد الأقصى: جهازين لكل متدرب
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
