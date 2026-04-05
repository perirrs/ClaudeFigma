"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden noise" style={{ background: "linear-gradient(180deg, #0d1b1e 0%, #0a1a1d 50%, #0d1f22 100%)" }}>
      {/* Ambient gradient orbs */}
      <div className="orb-green animate-orb-1" style={{ width: 600, height: 600, top: "-10%", right: "-10%" }} />
      <div className="orb-teal animate-orb-2" style={{ width: 500, height: 500, bottom: "-20%", left: "-10%" }} />
      <div className="orb-cyan" style={{ width: 400, height: 400, top: "30%", left: "40%", opacity: 0.5 }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Top light beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none opacity-60"
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(129, 253, 74, 0.18) 0%, transparent 70%)" }}
      />

      <div className="sn-container pt-10 pb-16 md:pt-16 md:pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Left content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-5"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sn-green opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sn-green" />
              </span>
              <span className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.2em]">Autonomous Workforce</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-[3.4rem] font-extrabold text-white leading-[1.08] mb-5 tracking-tight"
            >
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, #81fd4a 0%, #4ade80 40%, #2dd4a8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Meet the AI workforce
              </span>
              <span className="block text-white">that thinks and acts</span>
            </motion.h1>

            {/* Carousel dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-6"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === 0 ? "w-8 bg-sn-green shadow-[0_0_12px_rgba(129,253,74,0.6)]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
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
              className="text-[15px] text-sn-text-muted leading-relaxed max-w-md mb-6"
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 relative"
        >
          {/* Glow behind screenshot */}
          <div
            className="absolute -inset-10 opacity-60 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(129, 253, 74, 0.15) 0%, transparent 70%)" }}
          />

          <div className="relative grid lg:grid-cols-12 gap-4 items-end">
            {/* Main screenshot */}
            <div className="lg:col-span-8 relative">
              <div className="relative rounded-2xl overflow-hidden glass-card">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sn-green/60 to-transparent" />

                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5" style={{ background: "linear-gradient(180deg, rgba(10,22,24,0.8), rgba(10,22,24,0.6))" }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/70 shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70 shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/70 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-white/5 border border-white/5 mx-8" />
                </div>
                {/* Content area */}
                <div className="p-4 md:p-6">
                  {/* Tab nav */}
                  <div className="flex items-center gap-5 mb-5 border-b border-white/5 pb-3">
                    {["Workflows", "Service", "Assets", "Agents"].map((tab, i) => (
                      <span
                        key={tab}
                        className={`text-xs font-medium pb-2 transition-colors ${
                          i === 3
                            ? "text-sn-green border-b-2 border-sn-green"
                            : "text-sn-text-dim"
                        }`}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">AI Specialists</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sn-green/10 border border-sn-green/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-sn-green animate-pulse" />
                      <span className="text-[10px] font-semibold text-sn-green">Live</span>
                    </div>
                  </div>
                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { title: "Joie Finance Benefit Specialist", desc: "This specialist is created by Mergen to help navigate financial benefits and queries." },
                      { title: "Enterprise ADA Vendor Compliance", desc: "An AI analyst tracking vendor compliance metrics and regulatory standards." },
                      { title: "Security Incident Response", desc: "AI specialist for automated threat detection, escalation, and remediation." },
                    ].map((card, i) => (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="relative rounded-xl p-3 border border-white/5 overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                        }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sn-green/30 to-transparent" />
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sn-green/30 to-sn-green/10 border border-sn-green/30 flex items-center justify-center shadow-[0_0_12px_rgba(129,253,74,0.3)]">
                            <div className="w-2 h-2 rounded-full bg-sn-green" />
                          </div>
                          <span className="text-[11px] font-semibold text-white truncate">{card.title}</span>
                        </div>
                        <p className="text-[10px] text-sn-text-dim leading-relaxed">{card.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                  {/* Bottom metrics row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: "Total Completed", val: "12,847", trend: "+12%" },
                      { label: "Collaboration Score", val: "94.2%", trend: "+3.1%" },
                      { label: "CISO Weekly Reports", val: "26", trend: "+4" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <div className="text-[10px] text-sn-text-dim mb-1">{m.label}</div>
                        <div className="flex items-baseline gap-1.5">
                          <div className="text-sm font-bold text-white">{m.val}</div>
                          <div className="text-[9px] font-semibold text-sn-green">{m.trend}</div>
                        </div>
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
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Pulsing glow rings */}
                <div className="absolute inset-0 rounded-full bg-sn-green/20 blur-2xl scale-150 animate-pulse" />
                <div
                  className="absolute -inset-4 rounded-full border border-sn-green/20"
                  style={{ animation: "spin 20s linear infinite" }}
                />
                <div
                  className="absolute -inset-8 rounded-full border border-sn-green/10"
                  style={{ animation: "spin 30s linear infinite reverse" }}
                />
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center relative glow-strong-green"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #a3f76b 0%, #81fd4a 40%, #4ade80 80%, #22c55e 100%)",
                  }}
                >
                  <svg className="w-14 h-14 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                  </svg>
                </div>
              </motion.div>

              {/* Sparkle decorations */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 right-8"
              >
                <svg className="w-12 h-12 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="url(#cyan-grad)">
                  <defs>
                    <linearGradient id="cyan-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 right-2"
              >
                <svg className="w-7 h-7 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" viewBox="0 0 24 24" fill="url(#purple-grad)">
                  <defs>
                    <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute top-20 left-0"
              >
                <svg className="w-9 h-9 drop-shadow-[0_0_10px_rgba(45,212,168,0.5)]" viewBox="0 0 24 24" fill="url(#teal-grad)">
                  <defs>
                    <linearGradient id="teal-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2dd4a8" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </motion.div>

              {/* Floating data card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                transition={{ opacity: { delay: 0.8 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute -bottom-2 -left-2 glass-card rounded-xl p-3 w-40"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sn-green animate-pulse" />
                  <span className="text-[9px] font-semibold text-sn-text-dim uppercase tracking-wider">Active agents</span>
                </div>
                <div className="text-xl font-extrabold text-white">2,847</div>
                <div className="text-[9px] text-sn-green font-semibold">+18.2% this week</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, #0d1b1e)" }} />
    </section>
  );
}
