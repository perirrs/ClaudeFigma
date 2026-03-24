"use client";

import { motion } from "framer-motion";
import { fadeUp, fadeIn, staggerContainer } from "@/lib/animations";
import Button from "@/components/ui/Button";
import GradientOrb from "@/components/ui/GradientOrb";

const trustedLogos = [
  "Fortune 500",
  "Global 2000",
  "TechCrunch",
  "Forbes",
  "Gartner",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <GradientOrb color="indigo" size="xl" className="-top-40 -right-40" />
      <GradientOrb color="purple" size="lg" className="-bottom-20 -left-40" />
      <GradientOrb color="pink" size="md" className="top-1/3 left-1/4" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-950" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-brand-300 font-medium">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
            </span>
            Now available — AI-powered workflow engine v3.0
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          custom={0.1}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight mb-8"
        >
          <span className="text-white">The platform that</span>
          <br />
          <span className="gradient-text">makes work flow</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          custom={0.2}
          className="text-lg sm:text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 text-balance leading-relaxed"
        >
          Unify your enterprise with AI-driven automation, intelligent
          workflows, and a single platform that connects every team, tool, and
          process.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          custom={0.3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button variant="primary" size="lg">
            Start building for free
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
          <Button variant="secondary" size="lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Watch demo
          </Button>
        </motion.div>

        {/* Trusted by */}
        <motion.div variants={fadeIn} custom={0.5}>
          <p className="text-sm text-white/30 uppercase tracking-widest mb-6">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustedLogos.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-white/20 text-lg font-semibold hover:text-white/40 transition-colors cursor-default"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Hero visual — animated dashboard mockup */}
        <motion.div
          variants={fadeUp}
          custom={0.4}
          className="mt-20 relative"
        >
          <div className="relative rounded-2xl overflow-hidden glass glow p-1">
            <div className="rounded-xl bg-surface-900/90 p-6 md:p-10">
              {/* Fake dashboard */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
                <div className="ml-4 flex-1 h-6 rounded-lg bg-white/5" />
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* Sidebar */}
                <div className="col-span-3 hidden md:flex flex-col gap-3">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.08 }}
                      className={`h-8 rounded-lg ${
                        i === 1
                          ? "bg-brand-500/20 border border-brand-500/30"
                          : "bg-white/5"
                      }`}
                    />
                  ))}
                </div>

                {/* Main content */}
                <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "99.9%", label: "Uptime", color: "from-green-400/20 to-emerald-500/5" },
                      { value: "2.4M", label: "Workflows", color: "from-brand-400/20 to-brand-600/5" },
                      { value: "<50ms", label: "Response", color: "from-purple-400/20 to-purple-600/5" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                        className={`rounded-xl bg-gradient-to-br ${stat.color} border border-white/5 p-4`}
                      >
                        <div className="text-xl md:text-2xl font-bold text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/40">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="rounded-xl bg-white/[0.02] border border-white/5 p-6 flex-1 min-h-[200px] flex items-end gap-2"
                  >
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{
                            delay: 1.6 + i * 0.05,
                            duration: 0.6,
                            ease: [0.25, 0.4, 0.25, 1],
                          }}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500/60 to-brand-400/20"
                        />
                      )
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-brand-500/10 blur-3xl rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
