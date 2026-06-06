"use client";

import { motion } from "motion/react";

export default function DashboardBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-24 -right-24 h-96 w-96 bg-indigo-200/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 bg-violet-200/25 blur-3xl" />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="rounded-md absolute border border-indigo-300/40 bg-indigo-50/50"
          style={{
            width: `${48 + i * 24}px`,
            height: `${48 + i * 24}px`,
            top: `${15 + i * 12}%`,
            right: `${8 + i * 6}%`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.12, 0.22, 0.12], rotate: [0, 4, 0] }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
}
