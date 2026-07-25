"use client";

import { motion } from "motion/react";

export default function DashPageHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
  animate = true,
}) {
  const content = (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-bold tracking-tight text-dash-text sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dash-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      {content}
    </motion.div>
  );
}
