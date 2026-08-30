"use client";

import { motion } from "framer-motion";
import {
  Award,
  Users,
  Clock,
  HeadphonesIcon,
  CheckCircle2,
  ArrowUpLeft,
} from "lucide-react";

function SustainPulseMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-12 w-12 drop-shadow-[0_8px_14px_rgba(23,58,124,0.12)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sustain-pulse-ring" x1="10" y1="8" x2="55" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#173A7C" />
          <stop offset="1" stopColor="#5CB07C" />
        </linearGradient>
        <linearGradient id="sustain-pulse-line" x1="12" y1="34" x2="53" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#173A7C" />
          <stop offset="0.55" stopColor="#25589A" />
          <stop offset="1" stopColor="#5CB07C" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="27" fill="white" stroke="url(#sustain-pulse-ring)" strokeWidth="2.6" />
      <path
        d="M12 35h10l4-12 7 24 6-19 5 9h8"
        stroke="url(#sustain-pulse-line)"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M39 13c7 .3 11.2 3.8 12.5 10.4-7 .8-11.8-1.7-14.4-7.4.2-1.1.7-2.1 1.9-3Z"
        fill="#F1FAF5"
        stroke="#5CB07C"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m38.6 22.2 8-5" stroke="#5CB07C" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

const features = [
  {
    icon: Award,
    title: "مدربون معتمدون",
    label: "خبرة موثوقة",
    description:
      "نخبة من المدربين المعتمدين دولياً بخبرات تزيد عن 15 عاماً في مجالاتهم لضمان أعلى جودة تعليمية.",
    accent: "from-[#173A7C] to-[#2B5AAD]",
    iconSurface: "from-[#173A7C] to-[#2757A7]",
  },
  {
    icon: Users,
    title: "شهادات معتمدة",
    label: "اعتماد مهني",
    description:
      "شهادات معترف بها دولياً وإقليمياً تعزز سيرتك الذاتية وتفتح لك آفاقاً مهنية جديدة وواسعة.",
    accent: "from-[#2B5AAD] to-[#5CB07C]",
    iconSurface: "from-[#245194] to-[#3A8B78]",
  },
  {
    icon: Clock,
    title: "تعلم مرن",
    label: "مرونة كاملة",
    description:
      "دورات وباقات مصممة خصيصاً لتتناسب مع جدولك. تعلم في أي وقت وبالسرعة التي تتوافق معك.",
    accent: "from-[#5CB07C] to-[#2E8B74]",
    iconSurface: "from-[#55AB78] to-[#287A69]",
  },
  {
    icon: HeadphonesIcon,
    title: "دعم مستمر",
    label: "معك دائماً",
    description:
      "فريق دعم متاح لمساعدتك في رحلتك التعليمية من البداية وحتى بعد التخرج والانضمام للعمل.",
    accent: "from-[#2E8B74] to-[#173A7C]",
    iconSurface: "from-[#347F71] to-[#173A7C]",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#f4faf7_100%)] py-20 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#173A7C]/15 to-transparent" />
      <div className="pointer-events-none absolute -right-48 top-12 h-[520px] w-[520px] rounded-full bg-[#173A7C]/[0.055] blur-[110px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[480px] w-[480px] rounded-full bg-[#5CB07C]/[0.08] blur-[110px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #173A7C 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14"
        >
          <span className="section-badge-glass mb-5">
            <CheckCircle2 className="h-4 w-4 text-[#5CB07C]" />
            لماذا النبض المستدام؟
          </span>

          <h2 className="section-main-title-premium mb-5 mt-1">
            تميّز يصنع <span className="gradient-text">الفرق</span>
          </h2>

          <p className="section-desc-premium mx-auto max-w-2xl">
            نحن لا نقدم مجرد دورات، بل نصنع تجربة تعليمية متكاملة تضعك على طريق
            النجاح المهني بأحدث الأساليب والمعايير العالمية.
          </p>

          <div className="mx-auto mt-6 flex w-52 items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-l from-[#173A7C]/55 to-transparent" />
            <SustainPulseMark />
            <span className="h-px flex-1 bg-gradient-to-r from-[#5CB07C]/65 to-transparent" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative min-h-[285px] overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 text-right shadow-[0_12px_35px_-25px_rgba(15,23,42,0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#5CB07C]/35 hover:shadow-[0_28px_55px_-28px_rgba(23,58,124,0.36)] sm:p-6"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accent}`} />
                  <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#5CB07C]/[0.07] blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${feature.iconSurface} text-white shadow-[0_12px_24px_-12px_rgba(23,58,124,0.65)] ring-4 ring-white transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105`}>
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </div>

                      <span className="font-mono text-3xl font-black tracking-tighter text-slate-200 transition-colors duration-500 group-hover:text-[#173A7C]/15">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <span className="mb-2 text-[11px] font-black tracking-wide text-[#2E8B68]">
                      {feature.label}
                    </span>
                    <h3 className="mb-3 text-lg font-black text-[#173A7C] sm:text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] font-semibold leading-[1.9] text-slate-600">
                      {feature.description}
                    </p>

                    <div className="mt-auto flex items-center justify-end pt-5 text-[#173A7C]/35 transition-colors duration-300 group-hover:text-[#5CB07C]">
                      <ArrowUpLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </div>
      </div>
    </section>
  );
}
