"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, BookOpen, Award, Calendar } from "lucide-react";

const stats = [
  { value: 5000, suffix: "+", label: "متدرب ومتدربة", icon: GraduationCap },
  { value: 50, suffix: "+", label: "دورة تدريبية", icon: BookOpen },
  { value: 95, suffix: "%", label: "نسبة الرضا", icon: Award },
  { value: 15, suffix: "+", label: "سنة خبرة", icon: Calendar },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-black text-white">
      {count.toLocaleString("ar-SA")}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="relative py-16 -mt-16 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-dark p-8 sm:p-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald/15 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-light" />
                  </div>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
