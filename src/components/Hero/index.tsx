"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1b1e 0%, #0a1a1d 50%, #0d1f22 100%)" }}>
      {/* Background gradient glow */}
      <div className="absolute top-0 right-0 w-[70%] h-[80%] opacity-30" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.15) 0%, transparent 60%)" }} />

      <div className="sn-container pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Left content */}
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold text-sn-text-dim uppercase tracking-[0.2em] mb-3"
            >
              Autonomous Workforce
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-[3.2rem] font-extrabold text-white leading-[1.1] mb-4"
            >
              <span className="sn-heading-green">Meet the AI workforce</span>
              <br />
              that thinks and acts
            </motion.h1>

            {/* Carousel dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-6"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === 0 ? "w-6 bg-sn-green" : "w-2 bg-white/20"}`} />
              ))}
              <div className="w-4 h-2 rounded-full bg-white/10 ml-1" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:hidden mb-6"
            >
              <p className="text-sm text-sn-text-muted leading-relaxed max-w-md">
                Scale your team with AI specialists that have the business context and governance to handle workflows end-to-end.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-3 lg:hidden"
            >
              <a href="#" className="sn-btn-outline-green">Learn More</a>
              <a href="#" className="sn-btn-outline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Broadcast
              </a>
            </motion.div>
          </div>

          {/* Right side - description + CTA (desktop) */}
          <div className="hidden lg:flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-sn-text-muted leading-relaxed max-w-md mb-6"
            >
              Scale your team with AI specialists that have the business context and governance to handle workflows end-to-end.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-3"
            >
              <a href="#" className="sn-btn-outline-green">Learn More</a>
              <a href="#" className="sn-btn-outline flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Broadcast
              </a>
            </motion.div>
          </div>
        </div>

        {/* Platform screenshot mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 relative"
        >
          <div className="relative grid lg:grid-cols-12 gap-4 items-end">
            {/* Main screenshot */}
            <div className="lg:col-span-8 relative">
              <div className="rounded-xl overflow-hidden border border-sn-border bg-sn-bg-card shadow-2xl">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-sn-nav border-b border-sn-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 h-5 rounded bg-white/5 mx-8" />
                </div>
                {/* Content area */}
                <div className="p-4 md:p-6">
                  {/* Tab nav */}
                  <div className="flex items-center gap-4 mb-5 border-b border-sn-border pb-3">
                    {["Workflows", "Service", "Assets", "Agents"].map((tab, i) => (
                      <span key={tab} className={`text-xs font-medium pb-1 ${i === 3 ? "text-sn-green border-b-2 border-sn-green" : "text-sn-text-dim"}`}>{tab}</span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-4">AI Specialists</h3>
                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { title: "Joie Finance Benefit Specialist", desc: "This specialist is created by ServiceNow to help navigate financial benefits and queries." },
                      { title: "Enterprise ADA Vendor Compliance", desc: "An AI analyst tracking vendor compliance metrics and regulatory standards." },
                      { title: "Security Incident Response", desc: "AI specialist for automated threat detection, escalation, and remediation." },
                    ].map((card) => (
                      <div key={card.title} className="rounded-lg bg-white/[0.03] border border-sn-border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-sn-green/20 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-sn-green" />
                          </div>
                          <span className="text-xs font-semibold text-white truncate">{card.title}</span>
                        </div>
                        <p className="text-[10px] text-sn-text-dim leading-relaxed">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bottom metrics row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: "Total Completed", val: "12,847" },
                      { label: "Collaboration Score", val: "94.2%" },
                      { label: "CISO Weekly Reports", val: "26" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-white/[0.02] border border-sn-border p-2.5">
                        <div className="text-[10px] text-sn-text-dim mb-0.5">{m.label}</div>
                        <div className="text-sm font-bold text-white">{m.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative 3D elements */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center relative h-full">
              {/* Power button / green orb */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl shadow-green-500/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                  </svg>
                </div>
              </motion.div>
              {/* Sparkle decorations */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 right-8"
              >
                <svg className="w-10 h-10 text-cyan-400/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 right-4"
              >
                <svg className="w-6 h-6 text-purple-400/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute top-20 left-0"
              >
                <svg className="w-8 h-8 text-teal-400/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
