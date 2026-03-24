"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import SectionLabel from "@/components/ui/SectionLabel";
import GradientOrb from "@/components/ui/GradientOrb";

const testimonials = [
  {
    quote:
      "Mergen transformed how we handle IT service management. We reduced ticket resolution time by 73% in the first quarter.",
    author: "Sarah Chen",
    title: "CTO, Axiom Technologies",
    avatar: "SC",
    color: "from-brand-400 to-purple-500",
  },
  {
    quote:
      "The AI-powered workflows are genuinely transformative. It's like having a team of analysts working 24/7 to optimize every process.",
    author: "Marcus Rivera",
    title: "VP of Operations, NovaCorp",
    avatar: "MR",
    color: "from-emerald-400 to-teal-500",
  },
  {
    quote:
      "We evaluated every major platform on the market. Mergen was the only one that could handle our scale without compromising on speed.",
    author: "Dr. Amara Osei",
    title: "Director of Engineering, GlobalHealth",
    avatar: "AO",
    color: "from-amber-400 to-orange-500",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <GradientOrb color="blue" size="lg" className="-left-40 top-1/3" />

      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <SectionLabel>Customer Stories</SectionLabel>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6"
          >
            Loved by teams
            <br />
            <span className="gradient-text">everywhere</span>
          </motion.h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              variants={staggerItem}
              className="relative rounded-2xl glass p-8 hover:bg-white/[0.08] transition-all duration-500 group hover:-translate-y-1"
            >
              {/* Quote icon */}
              <svg
                className="w-10 h-10 text-brand-500/30 mb-6"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>

              <p className="text-white/70 leading-relaxed mb-8 text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.author}</div>
                  <div className="text-sm text-white/40">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
