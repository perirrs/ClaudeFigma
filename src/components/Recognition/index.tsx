"use client";

import { motion } from "framer-motion";

const recognitions = [
  {
    rank: "#1",
    label: "Ranked",
    description: "in the Building and Managing AI Agents Use Case",
    source: "Gartner",
  },
  {
    rank: "6X",
    label: "A Consecutive Leader",
    description: "Gartner\u00AE Magic Quadrant\u2122 for Enterprise Low-Code Application Platforms",
    source: "Gartner",
  },
  {
    rank: "4",
    label: "A Leader in",
    description: "Gartner\u00AE Magic Quadrant\u2122 Reports",
    source: "Gartner",
  },
  {
    rank: "9",
    label: "A Leader in",
    description: "Forrester Wave\u2122 Reports Q1, Q2, Q3, Q4 2025, Q2, Q4 2024, and Q4 2023",
    source: "Forrester",
  },
];

export default function Recognition() {
  return (
    <section className="sn-section bg-sn-bg">
      <div className="sn-container">
        {/* Logos strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mb-16"
        >
          {["AstraZeneca", "Adobe", "Stellantis", "PureStorage", "Bell"].map((name) => (
            <span key={name} className="text-lg font-extrabold text-white/20 tracking-tight">{name}</span>
          ))}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white text-center mb-14"
        >
          Recognition from trusted industry experts
        </motion.h2>

        {/* Recognition grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {recognitions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-xs text-sn-text-dim mb-2">{item.label}</p>
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3">{item.rank}</div>
              <p className="text-xs text-sn-text-dim leading-relaxed mb-4 max-w-[200px] mx-auto">{item.description}</p>
              <p className="text-sm font-bold text-white tracking-tight">
                {item.source === "Forrester" ? (
                  <span className="italic">FORRESTER</span>
                ) : (
                  <span>Gartner</span>
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* See disclaimers */}
        <div className="text-center mt-8">
          <a href="#" className="text-xs text-sn-text-dim hover:text-sn-text-muted underline transition-colors">See Disclaimers</a>
        </div>
      </div>
    </section>
  );
}
