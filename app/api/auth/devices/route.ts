import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/security/auth";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function getApproxLocation(req: NextRequest): string {
  const city = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity");
  const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry");
  const ip = getClientIp(req);

  // If running on localhost / private network
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "localhost") {
    return "اتصال محلي (Localhost)";
  }
  
  const countryNameMap: Record<string, string> = {
    SA: "المملكة العربية السعودية",
    EG: "مصر",
    AE: "الإمارات",
    KW: "الكويت",
    QA: "قطر",
    BH: "البحرين",
    OM: "عمان",
    JO: "الأردن",
  };

  if (city && country) {
    const cName = countryNameMap[country.toUpperCase()] || country;
    return `${decodeURIComponent(city)}، ${cName}`;
  }

  if (country) {
    return countryNameMap[country.toUpperCase()] || country;
  }

  return "الموقع الجغرافي للشبكة";
}

async function getAuthenticatedUser(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.ok && auth.user.email) {
      return { id: auth.user.id, email: auth.user.email.toLowerCase().trim() };
    }
  } catch {
    return null;
  }
  return null;
}

// ── Database State Storage for Devices in xapi_state ──
const ACTIVITY_ID = "user_device_sessions";
const STATE_ID = "devices";

async function getStoredDevices(email: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("xapi_state")
      .select("state_data")
      .eq("activity_id", ACTIVITY_ID)
      .eq("agent_email", email)
      .eq("state_id", STATE_ID)
      .maybeSingle();

    if (error || !data || !data.state_data) {
      return [];
    }

    const stateObj = typeof data.state_data === "string" ? JSON.parse(data.state_data) : data.state_data;
    const list = Array.isArray(stateObj?.devices) ? stateObj.devices : [];
    return list.filter((d: any) => !d.is_revoked);
  } catch (err) {
    console.error("Error reading stored devices:", err);
    return [];
  }
}

async function saveStoredDevices(email: string, devices: any[]): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("xapi_state").upsert(
      {
        activity_id: ACTIVITY_ID,
        agent_email: email,
        state_id: STATE_ID,
        state_data: { devices },
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "activity_id,agent_email,state_id",
      }
    );

    if (error) {
      console.error("Error upserting stored devices:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error saving stored devices:", err);
    return false;
  }
}

// ── GET: List registered active devices for student ──
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
    }

    const devices = await getStoredDevices(user.email);

    return NextResponse.json({
      success: true,
      devices,
      deviceCount: devices.length,
      maxDevices: 2,
    });
  } catch (err: any) {
    console.error("GET /api/auth/devices error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── POST: Register or Heartbeat Device with 2-Device Limit ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
    }

    const deviceId = (body.deviceId || req.cookies.get("nabd_device_id")?.value || "").trim();
    if (!deviceId) {
      return NextResponse.json({ success: false, message: "معرف الجهاز مفقود" }, { status: 400 });
    }

    const deviceName = body.deviceName || "متصفح ويب";
    const deviceType = body.deviceType || "desktop";
    const browser = body.browser || "متصفح ويب";
    const os = body.os || "نظام تشغيل";
    const ipAddress = getClientIp(req);
    const location = getApproxLocation(req);
    const nowIso = new Date().toISOString();

    const activeDevices = await getStoredDevices(user.email);
    const matchedIndex = activeDevices.findIndex((d: any) => d.device_id === deviceId);

    // 1. Case A: Device already registered -> Update heartbeat & metadata
    if (matchedIndex !== -1) {
      activeDevices[matchedIndex] = {
        ...activeDevices[matchedIndex],
        device_name: deviceName,
        device_type: deviceType,
        browser,
        os,
        ip_address: ipAddress,
        location,
        last_active: nowIso,
        is_revoked: false,
      };

      await saveStoredDevices(user.email, activeDevices);

      return NextResponse.json({
        success: true,
        status: "allowed",
        message: "تم تحديث نشاط الجهاز",
        currentDeviceId: deviceId,
        deviceCount: activeDevices.length,
        maxDevices: 2,
        devices: activeDevices,
      });
    }

    // Check if user is admin/instructor — exempt from device limits
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const userRoleRaw = String(userProfile?.role || '').toUpperCase().trim();
    const isPrivileged = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TRAINER', 'TEACHER'].includes(userRoleRaw);

    // 2. Case B: New device, but user already has 2 active devices -> Limit Reached!
    //    (Only enforce for students)
    if (activeDevices.length >= 2 && !isPrivileged) {
      return NextResponse.json(
        {
          success: false,
          status: "limit_reached",
          message: "تم تجاوز الحد الأقصى للأجهزة المصرح بها (جهازين فقط). يرجى إلغاء ربط أحد الأجهزة القديمة للمتابعة.",
          currentDeviceId: deviceId,
          deviceCount: activeDevices.length,
          maxDevices: 2,
          devices: activeDevices,
        },
        { status: 403 }
      );
    }

    // 3. Case C: New device and under limit (< 2) -> Add to list
    const newDevice = {
      id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType,
      browser,
      os,
      ip_address: ipAddress,
      location,
      last_active: nowIso,
      created_at: nowIso,
      is_revoked: false,
    };

    const updatedDevices = [...activeDevices, newDevice];
    await saveStoredDevices(user.email, updatedDevices);

    return NextResponse.json({
      success: true,
      status: "allowed",
      message: "تم تسجيل الجهاز بنجاح",
      currentDeviceId: deviceId,
      deviceCount: updatedDevices.length,
      maxDevices: 2,
      devices: updatedDevices,
    });
  } catch (err: any) {
    console.error("POST /api/auth/devices error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── DELETE: Revoke/Remove Registered Device ──
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetDeviceId = (searchParams.get("deviceId") || body.deviceId || "").trim();

    if (!targetDeviceId) {
      return NextResponse.json({ success: false, message: "معرف الجهاز المطلوب حذفه مفقود" }, { status: 400 });
    }

    const activeDevices = await getStoredDevices(user.email);
    const filteredDevices = activeDevices.filter((d: any) => d.device_id !== targetDeviceId);

    await saveStoredDevices(user.email, filteredDevices);

    return NextResponse.json({
      success: true,
      message: "تم إلغاء ربط الجهاز بنجاح",
      devices: filteredDevices,
      deviceCount: filteredDevices.length,
      maxDevices: 2,
    });
  } catch (err: any) {
    console.error("DELETE /api/auth/devices error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
