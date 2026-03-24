"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { fadeUp } from "@/lib/animations";
import SectionLabel from "@/components/ui/SectionLabel";

interface CounterProps {
  from: number;
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({ from, to, suffix = "", prefix = "", duration = 2 }: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => {
    if (to >= 1000) return `${(v / 1000).toFixed(1)}k`;
    if (to < 1) return v.toFixed(1);
    return Math.round(v).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration, ease: [0.25, 0.4, 0.25, 1] });
    }
  }, [isInView, count, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: { from: 0, to: 85000, suffix: "+", prefix: "" },
    label: "Enterprise customers",
    description: "Companies trusting our platform",
  },
  {
    value: { from: 0, to: 99.99, suffix: "%", prefix: "" },
    label: "Uptime SLA",
    description: "Industry-leading reliability",
  },
  {
    value: { from: 0, to: 500, suffix: "+", prefix: "" },
    label: "Integrations",
    description: "Connect your entire stack",
  },
  {
    value: { from: 0, to: 150, suffix: "+", prefix: "" },
    label: "Countries served",
    description: "True global infrastructure",
  },
];

export default function Stats() {
  return (
    <section className="relative py-32">
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <SectionLabel>By the Numbers</SectionLabel>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            className="text-4xl md:text-5xl font-extrabold text-white"
          >
            Scale that speaks for itself
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.1}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text mb-3">
                <AnimatedCounter
                  from={stat.value.from}
                  to={stat.value.to}
                  suffix={stat.value.suffix}
                  prefix={stat.value.prefix}
                />
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-white/40">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
