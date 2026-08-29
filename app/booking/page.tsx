import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "حجز موعد | SustainPulse",
  description: "احجز موعدك الآن مع خبرائنا في SustainPulse للحصول على الاستشارات والتدريب.",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-8 bg-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden mb-0 z-10">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center pt-2 pb-0">
          <div className="mb-3">
            <span className="section-badge-glass">
              الاستشارات والتدريب
            </span>
          </div>
          <h1 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl mb-2 leading-tight">
            حجز <span className="gradient-text">موعد</span>
          </h1>
          <p className="section-desc-premium max-w-full mx-auto text-base">
            نسعد بتواصلك معنا. يرجى اختيار الوقت المناسب لك من التقويم أدناه وسنقوم بتأكيد موعدك في أقرب وقت.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-4">
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
