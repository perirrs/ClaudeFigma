"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1a2e35 0%, #0f1f24 100%)" }}>
          {/* Decorative orb */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-20" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)" }} />

          <div className="relative z-10 py-16 md:py-24 px-8 md:px-16 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-green-400 uppercase tracking-[0.15em] mb-4"
            >
              Get Started
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Ready to transform your{" "}
              <span className="text-green-400">ServiceNow experience?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
            >
              Let our certified experts show you how Mergen can accelerate
              your digital transformation with ServiceNow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="#" className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 text-base">
                Schedule a Demo
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#" className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all text-base">
                Contact Sales
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free consultation
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom roadmap
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ROI assessment
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
