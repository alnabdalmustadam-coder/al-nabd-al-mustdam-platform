import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "حجز موعد | SustainPulse",
  description: "احجز موعدك الآن مع خبرائنا في SustainPulse للحصول على الاستشارات والتدريب.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-[#0A162B] to-[#173A7C]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-6 z-10">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center py-6">
          <span className="text-white/80 text-xs font-bold tracking-wide uppercase bg-white/10 px-3 py-1 rounded-full inline-block mb-3 border border-white/20">
            الاستشارات والتدريب
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
            حجز <span className="text-[#5CB07C]">موعد</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-base leading-relaxed font-medium">
            نسعد بتواصلك معنا. يرجى اختيار الوقت المناسب لك من التقويم أدناه وسنقوم بتأكيد موعدك في أقرب وقت.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
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
