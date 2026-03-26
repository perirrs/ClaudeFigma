"use client";

import { motion } from "framer-motion";

const logos = ["Adobe", "Uber", "Pepsico", "VISA", "AstraZeneca", "Lenovo"];

export default function TrustedBy() {
  return (
    <section className="sn-section" style={{ background: "linear-gradient(180deg, #0d1f22 0%, #0d1b1e 100%)" }}>
      <div className="sn-container text-center">
        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl font-semibold text-sn-text-muted mb-10"
        >
          The world works with <span className="text-sn-green">Mergen</span>
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {logos.map((name) => (
            <span
              key={name}
              className="text-xl md:text-2xl font-extrabold text-white/25 tracking-tight hover:text-white/40 transition-colors cursor-default select-none"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
