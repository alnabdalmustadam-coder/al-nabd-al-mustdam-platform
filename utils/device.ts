'use client';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  userAgent: string;
}

const STORAGE_DEVICE_KEY = 'nabd_device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown-device';

  try {
    let id = localStorage.getItem(STORAGE_DEVICE_KEY);
    if (!id || id.length < 8) {
      id = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_DEVICE_KEY, id);
    }
    // Also save in cookie for SSR / middleware
    document.cookie = `nabd_device_id=${id}; path=/; max-age=31536000; SameSite=Lax`;
    return id;
  } catch (e) {
    return 'dev_fallback_' + Math.random().toString(36).substring(2, 9);
  }
}

export function parseUserAgent(): {
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'متصفح ويب',
      deviceType: 'desktop',
      browser: 'متصفح غير معروف',
      os: 'نظام تشغيل',
    };
  }

  const ua = navigator.userAgent;

  // OS detection
  let os = 'نظام غير معروف';
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS Apple';
  else if (/iPhone/i.test(ua)) os = 'iOS iPhone';
  else if (/iPad/i.test(ua)) os = 'iPadOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Device type & name
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let deviceName = 'كمبيوتر شخصي (PC)';

  if (/iPhone/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'هاتف آيفون (iPhone)';
  } else if (/iPad/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    deviceType = 'tablet';
    deviceName = 'جهاز لوحي (iPad)';
  } else if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) {
      deviceType = 'mobile';
      deviceName = 'هاتف ذكي (Android)';
    } else {
      deviceType = 'tablet';
      deviceName = 'تابلت (Android Tablet)';
    }
  } else if (/Macintosh/i.test(ua)) {
    deviceName = 'جهاز ماك (MacBook / iMac)';
  } else if (/Windows/i.test(ua)) {
    deviceName = 'كمبيوتر ويندوز (Windows PC)';
  }

  // Browser detection
  let browser = 'متصفح ويب';
  if (/Edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = `Microsoft Edge ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = `Apple Safari ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/Firefox\//i.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = `Mozilla Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  }

  return {
    deviceName,
    deviceType,
    browser,
    os,
  };
}

export function getDeviceInfo(): DeviceInfo {
  const deviceId = getOrCreateDeviceId();
  const parsed = parseUserAgent();

  return {
    deviceId,
    deviceName: parsed.deviceName,
    deviceType: parsed.deviceType,
    browser: parsed.browser,
    os: parsed.os,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}
