"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { CheckCircle, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SmartCourseActionProps {
  ghlCourseId?: string;
  ghlCheckoutUrl?: string;
  courseTitle: string;
  courseSlug?: string;
  onStatusChange?: (status: "guest" | "enrolled" | "not_enrolled") => void;
  className?: string;
}

export default function SmartCourseAction({
  ghlCourseId,
  ghlCheckoutUrl,
  courseTitle,
  courseSlug,
  onStatusChange,
  className = "",
}: SmartCourseActionProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"guest" | "enrolled" | "not_enrolled">("guest");
  const [courseUrl, setCourseUrl] = useState("/dashboard/student");

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!user) {
          setStatus("guest");
          onStatusChange?.("guest");
          setLoading(false);
          return;
        }

        const userEmail = user.email ? user.email.toLowerCase().trim() : "";
        if (!userEmail) {
          setStatus("guest");
          onStatusChange?.("guest");
          setLoading(false);
          return;
        }

        const cleanSlug = (courseSlug || "").replace(/^course-/, "");
        const matchIds = Array.from(new Set([
          courseSlug,
          `course-${cleanSlug}`,
          cleanSlug,
          ghlCourseId,
          ghlCourseId ? ghlCourseId.replace(/^course-/, "") : "",
        ])).filter(Boolean);

        const orQuery = [
          ...matchIds.map(id => `course_id.eq.${id}`),
          ...(courseTitle ? [`course_title.eq.${courseTitle}`] : []),
        ].join(",");

        const { data: enrollRow } = await supabase
          .from("enrollments")
          .select("id, progress, course_id")
          .eq("email", userEmail)
          .or(orQuery)
          .maybeSingle();

        if (enrollRow) {
          setStatus("enrolled");
          onStatusChange?.("enrolled");
          const targetSlug = courseSlug || cleanSlug || "diploma-tolerance-citizenship";
          setCourseUrl(`/dashboard/student/courses/${targetSlug}/lessons/lesson-1`);
        } else {
          setStatus("not_enrolled");
          onStatusChange?.("not_enrolled");
        }
      } catch (err) {
        setStatus("guest");
        onStatusChange?.("guest");
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [ghlCourseId, courseTitle, courseSlug, onStatusChange]);

  if (loading) {
    return (
      <Button size="md" className={`w-full text-sm py-3 opacity-70 cursor-wait ${className}`}>
        جاري التحقق...
      </Button>
    );
  }

  if (status === "enrolled") {
    return (
      <div className="space-y-1.5 w-full">
        <Button 
          href={courseUrl} 
          size="md" 
          className={`w-full text-sm sm:text-base py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 ${className}`}
        >
          <Play className="w-4 h-4 fill-white shrink-0" />
          <span>متابعة التعلم</span>
        </Button>
      </div>
    );
  }

  // Not enrolled or guest -> go to local checkout
  const checkoutUrl = courseSlug ? `/checkout?slug=${courseSlug}` : "/checkout";
  return (
    <Button href={checkoutUrl} size="md" className={`w-full text-sm sm:text-base py-3 font-black ${className}`}>
      سجّل في الدورة الآن
    </Button>
  );
}

