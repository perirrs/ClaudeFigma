"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";

interface CounterProps {
  from: number;
  to: number;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ from, to, suffix = "", decimals = 0 }: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) return v.toFixed(decimals);
    return Math.round(v).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration: 2, ease: [0.25, 0.4, 0.25, 1] });
    }
  }, [isInView, count, to]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { value: 500, suffix: "+", label: "ServiceNow Implementations", description: "Successfully delivered across industries" },
  { value: 98, suffix: "%", label: "Client Satisfaction", description: "Based on post-project surveys" },
  { value: 73, suffix: "%", label: "Average MTTR Reduction", description: "Mean time to resolution improvement" },
  { value: 150, suffix: "+", label: "Certified Consultants", description: "ServiceNow certified professionals" },
];

export default function Stats() {
  return (
    <section className="py-20 md:py-28" style={{ background: "linear-gradient(145deg, #1a2e35 0%, #0f1f24 100%)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-green-400 uppercase tracking-[0.15em] mb-4"
          >
            Impact
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
          >
            Results that speak for themselves
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-400 mb-3">
                <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-base font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
