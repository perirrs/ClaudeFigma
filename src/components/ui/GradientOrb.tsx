"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface GradientOrbProps {
  className?: string;
  color?: "indigo" | "purple" | "pink" | "blue";
  size?: "sm" | "md" | "lg" | "xl";
}

const colorMap = {
  indigo: "from-brand-500/20 to-brand-700/5",
  purple: "from-purple-500/20 to-purple-700/5",
  pink: "from-pink-500/15 to-pink-700/5",
  blue: "from-blue-500/15 to-blue-700/5",
};

const sizeMap = {
  sm: "w-[300px] h-[300px]",
  md: "w-[500px] h-[500px]",
  lg: "w-[700px] h-[700px]",
  xl: "w-[900px] h-[900px]",
};

export default function GradientOrb({
  className,
  color = "indigo",
  size = "md",
}: GradientOrbProps) {
  return (
    <motion.div
      className={clsx(
        "absolute rounded-full bg-gradient-radial blur-3xl pointer-events-none",
        "bg-gradient-to-br",
        colorMap[color],
        sizeMap[size],
        className
      )}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
