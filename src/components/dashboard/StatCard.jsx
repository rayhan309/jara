"use client";

import { MotionFadeIn } from "@/components/dashboard/MotionFade";
import { StatSparkline } from "@/components/dashboard/RevenueChart";

const accents = {
  indigo: { icon: "bg-indigo-50 text-indigo-600", spark: "#6366f1" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", spark: "#10b981" },
  amber: { icon: "bg-amber-50 text-amber-600", spark: "#f59e0b" },
  rose: { icon: "bg-rose-50 text-rose-600", spark: "#f43f5e" },
};

const sparkData = {
  indigo: [
    { value: 30 }, { value: 45 }, { value: 38 }, { value: 52 }, { value: 48 }, { value: 65 }, { value: 58 },
  ],
  emerald: [
    { value: 20 }, { value: 35 }, { value: 42 }, { value: 38 }, { value: 55 }, { value: 50 }, { value: 62 },
  ],
  amber: [
    { value: 40 }, { value: 32 }, { value: 48 }, { value: 44 }, { value: 36 }, { value: 52 }, { value: 47 },
  ],
  rose: [
    { value: 25 }, { value: 38 }, { value: 42 }, { value: 50 }, { value: 46 }, { value: 58 }, { value: 54 },
  ],
};

export default function StatCard({
  title,
  value,
  subtitle,
  accent = "indigo",
  delay = 0,
  icon: Icon,
}) {
  const { icon: iconClass, spark } = accents[accent];

  return (
    <MotionFadeIn delay={delay}>
      <div className="dash-card flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-500 uppercase">
              {title}
            </p>
            <p className="mt-2 truncate text-xl font-bold tabular-nums tracking-tight text-dash-text sm:text-2xl">
              {value}
            </p>
            {subtitle ? (
              <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {Icon ? (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
          ) : null}
        </div>
        <div className="mt-3 hidden h-9 w-full sm:block">
          <StatSparkline data={sparkData[accent]} color={spark} />
        </div>
      </div>
    </MotionFadeIn>
  );
}
