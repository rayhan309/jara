"use client";

import { motion } from "motion/react";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";

export default function PagePlaceholder({ title, description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="dash-card flex min-h-[480px] flex-col items-center justify-center p-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6 flex h-20 w-20 items-center justify-center border border-indigo-200 bg-indigo-50"
      >
        {Icon ? (
          <Icon className="h-8 w-8 text-indigo-600" />
        ) : (
          <HiOutlineWrenchScrewdriver className="h-8 w-8 text-indigo-600" />
        )}
        <span className="absolute -top-1 -right-1 h-3 w-3 border-2 border-white bg-amber-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-dash-text">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-dash-muted">{description}</p>
      <div className="mt-8 flex gap-2">
        <span className="h-1.5 w-8 bg-indigo-500" />
        <span className="h-1.5 w-4 bg-indigo-300" />
        <span className="h-1.5 w-2 bg-indigo-200" />
      </div>
    </motion.div>
  );
}
