import HeroSection from "@/components/sections/HeroSection";
import CoursesShowcase from "@/components/sections/CoursesShowcase";
import PremiumCourseHighlights from "@/components/sections/PremiumCourseHighlights";
import WhyUsSection from "@/components/sections/WhyUsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CorporateStrip from "@/components/sections/CorporateStrip";
import PartnersLogos from "@/components/sections/PartnersLogos";
import LatestBlogSection from "@/components/sections/LatestBlogSection";
import CtaSection from "@/components/sections/CtaSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CoursesShowcase />
      <PremiumCourseHighlights />
      <WhyUsSection />
      <TestimonialsSection />
      <CorporateStrip />
      <PartnersLogos />
      <LatestBlogSection />
      <CtaSection />
      <NewsletterSection />
    </>
  );
}
