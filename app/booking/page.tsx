import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "حجز موعد | SustainPulse",
  description: "احجز موعدك الآن مع خبرائنا في SustainPulse للحصول على الاستشارات والتدريب.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center py-12">
          <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
            الاستشارات والتدريب
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
            حجز <span className="gradient-text">موعد</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            نسعد بتواصلك معنا. يرجى اختيار الوقت المناسب لك من التقويم أدناه وسنقوم بتأكيد موعدك في أقرب وقت.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="w-full min-h-[700px] flex justify-center">
          <iframe
            src="https://link.digitalsolution.vip/widget/booking/wjLw0LIzohqnw41l2sxs"
            style={{ width: "100%", border: "none", overflow: "hidden" }}
            scrolling="no"
            id="wjLw0LIzohqnw41l2sxs_1736932483849"
            className="w-full min-h-[800px]"
            title="Booking Calendar"
          ></iframe>
          {/* GHL Widget Script to handle resizing automatically */}
          <Script src="https://link.digitalsolution.vip/js/form_embed.js" strategy="lazyOnload" />
        </div>
      </div>
    </div>
  );
}
