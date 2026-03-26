"use client";

import { motion } from "framer-motion";

export default function InfinitySection() {
  return (
    <section className="sn-section overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1b1e 0%, #0a171a 50%, #0d1b1e 100%)" }}>
      <div className="sn-container">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
            <span className="sn-heading-green">Mergen is the AI control tower</span>
            <br />
            <span className="text-white">for business reinvention</span>
          </h2>
        </motion.div>

        {/* Infinity loop visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-3xl mx-auto"
        >
          {/* Infinity SVG */}
          <div className="relative">
            <svg viewBox="0 0 600 300" className="w-full h-auto" fill="none">
              {/* Glow filter */}
              <defs>
                <linearGradient id="infinityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="25%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#2dd4a8" />
                  <stop offset="75%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Infinity path - outer glow */}
              <path
                d="M300 150 C300 80 220 40 160 40 C80 40 20 90 20 150 C20 210 80 260 160 260 C220 260 300 220 300 150 C300 80 380 40 440 40 C520 40 580 90 580 150 C580 210 520 260 440 260 C380 260 300 220 300 150"
                stroke="url(#infinityGrad)"
                strokeWidth="3"
                filter="url(#glow)"
                opacity="0.6"
              />
              {/* Infinity path - solid */}
              <path
                d="M300 150 C300 80 220 40 160 40 C80 40 20 90 20 150 C20 210 80 260 160 260 C220 260 300 220 300 150 C300 80 380 40 440 40 C520 40 580 90 580 150 C580 210 520 260 440 260 C380 260 300 220 300 150"
                stroke="url(#infinityGrad)"
                strokeWidth="2"
                opacity="0.9"
              />

              {/* Node dots */}
              {[
                { cx: 160, cy: 40, label: "IT" },
                { cx: 440, cy: 40, label: "CRM" },
                { cx: 160, cy: 260, label: "Employee\nExperience" },
                { cx: 440, cy: 260, label: "App\nDevelopment" },
              ].map((node, i) => (
                <g key={i}>
                  <circle cx={node.cx} cy={node.cy} r="8" fill="#0d1b1e" stroke="#22d3ee" strokeWidth="2" />
                  <circle cx={node.cx} cy={node.cy} r="4" fill="#22d3ee" />
                </g>
              ))}

              {/* Center hub labels */}
              <text x="300" y="145" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Data + AI + Workflows + Security</text>

              {/* Green / Cyan badges at center sides */}
              <rect x="185" y="170" width="80" height="26" rx="13" fill="#22c55e" />
              <text x="225" y="187" textAnchor="middle" fill="#0d1b1e" fontSize="10" fontWeight="bold">Employees</text>

              <rect x="335" y="170" width="80" height="26" rx="13" fill="#22d3ee" />
              <text x="375" y="187" textAnchor="middle" fill="#0d1b1e" fontSize="10" fontWeight="bold">Customers</text>
            </svg>

            {/* Corner labels */}
            <div className="absolute top-[5%] left-[15%] text-xs md:text-sm font-medium text-sn-text-muted">IT</div>
            <div className="absolute top-[5%] right-[15%] text-xs md:text-sm font-medium text-sn-text-muted">CRM</div>
            <div className="absolute bottom-[5%] left-[10%] text-xs md:text-sm font-medium text-sn-text-muted text-center">Employee<br />Experience</div>
            <div className="absolute bottom-[5%] right-[10%] text-xs md:text-sm font-medium text-sn-text-muted text-center">App<br />Development</div>

            {/* Floating photos placeholder */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[22%] top-[25%] w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-sn-border bg-sn-bg-card shadow-xl"
            >
              <div className="w-full h-full bg-gradient-to-br from-teal-600/30 to-blue-600/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-[20%] top-[20%] w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-sn-border bg-sn-bg-card shadow-xl"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
