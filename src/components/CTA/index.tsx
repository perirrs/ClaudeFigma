"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import Button from "@/components/ui/Button";
import GradientOrb from "@/components/ui/GradientOrb";

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <GradientOrb color="indigo" size="xl" className="left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-3xl glass glow p-12 md:p-20"
        >
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6"
          >
            Ready to transform
            <br />
            <span className="gradient-text">your enterprise?</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.2}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10"
          >
            Join 85,000+ companies already using Mergen to automate workflows,
            boost productivity, and drive innovation.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="primary" size="lg">
              Start your free trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button variant="secondary" size="lg">
              Talk to sales
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.4}
            className="text-sm text-white/30 mt-6"
          >
            No credit card required &middot; 14-day free trial &middot; Cancel
            anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
