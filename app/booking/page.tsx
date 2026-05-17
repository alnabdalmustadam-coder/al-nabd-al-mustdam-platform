import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "حجز موعد | SustainPulse",
  description: "احجز موعدك الآن مع خبرائنا في SustainPulse للحصول على الاستشارات والتدريب.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-24 pb-8 bg-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-2 z-10">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center pt-2 pb-4">
          <span className="text-[#173A7C] text-xs font-bold tracking-wide uppercase bg-[#173A7C]/5 px-3 py-1 rounded-full inline-block mb-3 border border-[#173A7C]/10">
            الاستشارات والتدريب
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3 leading-tight">
            حجز <span className="text-[#5CB07C]">موعد</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed font-medium">
            نسعد بتواصلك معنا. يرجى اختيار الوقت المناسب لك من التقويم أدناه وسنقوم بتأكيد موعدك في أقرب وقت.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-2">
        <div className="w-full">
          <iframe
            src="https://link.digitalsolution.vip/widget/booking/wjLw0LIzohqnw41l2sxs"
            style={{ width: "100%", minHeight: "1100px", border: "none", overflow: "hidden" }}
            scrolling="no"
            id="wjLw0LIzohqnw41l2sxs_1736932483849"
            title="Booking Calendar"
          ></iframe>
          {/* GHL Widget Script to handle resizing automatically */}
          <Script src="https://link.digitalsolution.vip/js/form_embed.js" strategy="lazyOnload" />
        </div>
      </div>
    </div>
  );
}
