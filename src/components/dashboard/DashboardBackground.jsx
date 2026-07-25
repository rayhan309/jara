"use client";

export default function DashboardBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, black 35%, transparent 100%)",
        }}
      />
      <div className="absolute -top-28 right-[-6%] h-[28rem] w-[28rem] rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute -bottom-36 left-[-8%] h-[22rem] w-[22rem] rounded-full bg-slate-300/20 blur-3xl" />
    </div>
  );
}
