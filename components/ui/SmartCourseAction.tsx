"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface SmartCourseActionProps {
  ghlCourseId?: string;
  ghlCheckoutUrl?: string;
  courseTitle: string;
  courseSlug?: string;
}

export default function SmartCourseAction({ ghlCourseId, ghlCheckoutUrl, courseTitle, courseSlug }: SmartCourseActionProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"guest" | "enrolled" | "not_enrolled">("guest");
  const [courseUrl, setCourseUrl] = useState("/dashboard/student");

  useEffect(() => {
    async function checkStatus() {
      try {
        // 1. Get session
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error();
        const session = await sessionRes.json();
        if (!session.user) {
          setStatus("guest");
          setLoading(false);
          return;
        }

        // 2. Get enrollments for the user from local API
        const coursesRes = await fetch(`/api/courses/my-courses?email=${encodeURIComponent(session.user.email)}`);
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          // Check if user has this course
          const enrolledCourse = data.courses?.find((c: any) => 
            (ghlCourseId && c.course_id === ghlCourseId) || 
            c.title.includes(courseTitle) || 
            courseTitle.includes(c.title)
          );
          
          if (enrolledCourse) {
            setStatus("enrolled");
            setCourseUrl("/dashboard/student");
          } else {
            setStatus("not_enrolled");
          }
        }
      } catch (err) {
        setStatus("guest");
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [ghlCourseId, courseTitle]);

  if (loading) {
    return (
      <Button size="lg" className="w-full mb-3 text-lg py-4 opacity-70 cursor-wait">
        جاري التحقق...
      </Button>
    );
  }

  if (status === "enrolled") {
    return (
      <Button href={courseUrl} size="lg" className="w-full mb-3 text-lg py-4 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30">
        <span className="flex items-center gap-2">
          متابعة التعلم في لوحة التحكم <CheckCircle className="w-5 h-5" />
        </span>
      </Button>
    );
  }

  // Not enrolled or guest -> go to local checkout
  const checkoutUrl = courseSlug ? `/checkout?slug=${courseSlug}` : "/checkout";
  return (
    <Button href={checkoutUrl} size="lg" className="w-full mb-3 text-lg py-4">
      سجّل في الدورة الآن
    </Button>
  );
}

