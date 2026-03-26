"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 lg:pt-32" style={{ background: "linear-gradient(145deg, #1a2e35 0%, #0f1f24 40%, #162329 70%, #0d1a1f 100%)" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[60%] h-full opacity-20">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-40 right-60 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/15 border border-green-500/20 text-green-400 text-sm font-medium rounded-full mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Premier ServiceNow Partner
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Put AI to work{" "}
              <span className="text-green-400">for your people</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed"
            >
              Mergen accelerates your ServiceNow journey with AI-powered workflows,
              intelligent automation, and expert-led implementations that deliver
              measurable results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <a href="#contact" className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-500 transition-all duration-200 text-base shadow-lg shadow-green-600/20">
                Get Started
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#solutions" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-200 text-base">
                Explore Solutions
              </a>
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-8 lg:gap-12"
            >
              {[
                { value: "500+", label: "Implementations" },
                { value: "98%", label: "Client Satisfaction" },
                { value: "150+", label: "Certified Experts" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gray-900/60 backdrop-blur border border-white/10 p-1 shadow-2xl">
              <div className="rounded-xl bg-gray-900/80 p-5">
                {/* Window bar */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  <div className="ml-3 flex-1 h-6 rounded-lg bg-white/5" />
                </div>

                {/* Dashboard content */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { val: "2,847", label: "Active Workflows", color: "text-green-400" },
                    { val: "99.9%", label: "Platform Uptime", color: "text-blue-400" },
                    { val: "12ms", label: "Avg Response", color: "text-purple-400" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-white/5 border border-white/5 p-3">
                      <div className={`text-xl font-bold ${item.color}`}>{item.val}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart bars */}
                <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4 flex items-end gap-1.5 h-40">
                  {[35, 55, 45, 70, 50, 85, 65, 90, 55, 75, 60, 80, 70, 95, 60].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-green-600/70 to-green-400/30"
                    />
                  ))}
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg bg-white/5 border border-white/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">Incidents Resolved</span>
                    </div>
                    <div className="text-lg font-bold text-white">1,284</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/5 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs text-gray-400">MTTR Reduction</span>
                    </div>
                    <div className="text-lg font-bold text-white">73%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow under card */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-green-500/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
