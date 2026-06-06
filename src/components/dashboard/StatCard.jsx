"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { HiOutlineCurrencyBangladeshi } from "react-icons/hi2";
import { MotionFadeIn, MotionHoverCard } from "@/components/dashboard/MotionFade";
import { StatSparkline } from "@/components/dashboard/RevenueChart";

const accents = {
  indigo: { gradient: "from-indigo-500 to-violet-500", color: "#6366f1" },
  emerald: { gradient: "from-emerald-500 to-teal-500", color: "#10b981" },
  amber: { gradient: "from-amber-500 to-orange-500", color: "#f59e0b" },
  rose: { gradient: "from-rose-500 to-pink-500", color: "#f43f5e" },
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
  change,
  subtitle,
  accent = "indigo",
  delay = 0,
  showCurrencyIcon = false,
}) {
  const isPositive = change?.startsWith("+");
  const { gradient, color } = accents[accent];

  return (
    <MotionFadeIn delay={delay}>
      <MotionHoverCard>
        <div className="dash-card group relative overflow-hidden p-6 transition-shadow hover:shadow-lg">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-dash-muted uppercase">
                {title}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {showCurrencyIcon ? (
                  <HiOutlineCurrencyBangladeshi className="h-6 w-6 text-indigo-500" />
                ) : null}
                <p className="text-3xl font-bold tracking-tight text-dash-text">{value}</p>
              </div>
              {subtitle ? (
                <p className="mt-1 text-xs text-dash-muted">{subtitle}</p>
              ) : null}
            </div>

            {change ? (
              <div
                className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${
                  isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {change}
              </div>
            ) : null}
          </div>

          <StatSparkline data={sparkData[accent]} color={color} />
        </div>
      </MotionHoverCard>
    </MotionFadeIn>
  );
}
