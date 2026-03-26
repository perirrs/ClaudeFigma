"use client";

import { motion } from "framer-motion";

const featuredPost = {
  tag: "Blueprint",
  title: "Mergen's Blueprint for Agentic Business",
  description: "AI that's anchored inside workflows with operational context and governance is better for your business \u2014 even at the enterprise scale.",
  cta: "Get Blueprint",
};

const sideCards = [
  {
    tag: "Report",
    title: "2026 Risk and Security: How AI Is Reshaping the Enterprise Landscape",
    cta: "Read Report",
  },
  {
    tag: "Report",
    title: "2025 Gartner\u00AE Magic Quadrant\u2122 for the CRM Customer Engagement Center",
    cta: "Read Report",
  },
  {
    tag: "Report",
    title: "2025 Gartner\u00AE Magic Quadrant\u2122 for AI Applications in IT Service Management",
    cta: "Read Report",
  },
];

export default function Insights() {
  return (
    <section className="sn-section" style={{ background: "linear-gradient(180deg, #0d1b1e 0%, #0a171a 100%)" }}>
      <div className="sn-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            <span className="sn-heading-green">Latest insights</span>
            <br />
            <span className="text-white">and innovations</span>
          </h2>
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="sn-btn-outline-green !text-xs">View Blogs</a>
            <a href="#" className="sn-btn-outline !text-xs">View Analyst Reports</a>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-br from-sn-bg-card to-sn-bg-light border border-sn-border overflow-hidden group"
          >
            {/* Image area */}
            <div className="h-52 md:h-64 bg-gradient-to-br from-teal-900/40 to-green-900/40 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-blue-600/10" />
              <div className="relative text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-sn-green/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-sn-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-white">Mergen&apos;s Blueprint for<br />Agentic Business</p>
              </div>
            </div>
            {/* Text content */}
            <div className="p-6">
              <span className="text-[10px] font-semibold text-sn-green uppercase tracking-widest">{featuredPost.tag}</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-3 group-hover:text-sn-green transition-colors">{featuredPost.title}</h3>
              <p className="text-xs text-sn-text-dim leading-relaxed mb-4">{featuredPost.description}</p>
              <a href="#" className="flex items-center gap-1 text-sm font-semibold text-sn-green hover:underline">
                {featuredPost.cta} &rarr;
              </a>
            </div>
          </motion.div>

          {/* Side cards stack */}
          <div className="space-y-4">
            {sideCards.map((card, i) => (
              <motion.a
                key={i}
                href="#"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start rounded-xl bg-sn-bg-card border border-sn-border p-4 hover:bg-sn-bg-hover transition-colors group"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-sn-bg-light to-sn-bg border border-sn-border flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-sn-green uppercase tracking-widest">{card.tag}</span>
                  <h4 className="text-sm font-bold text-white mt-1 mb-2 leading-snug group-hover:text-sn-green transition-colors">{card.title}</h4>
                  <span className="text-xs font-semibold text-sn-green">{card.cta} &rarr;</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex gap-3 mt-6 justify-center">
          <a href="#" className="sn-btn-outline-green !text-xs">View Blogs</a>
          <a href="#" className="sn-btn-outline !text-xs">View Analyst Reports</a>
        </div>
      </div>
    </section>
  );
}
