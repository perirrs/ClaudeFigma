"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface SectionLabelProps {
  children: React.ReactNode;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-brand-300 mb-6"
    >
      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
      {children}
    </motion.div>
  );
}
