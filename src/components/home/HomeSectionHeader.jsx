import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "সবগুলো দেখুন",
  align = "left",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-7 border-b border-zinc-200/80 pb-5 sm:mb-8 sm:pb-6 ${
        isCenter
          ? "text-center"
          : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div
        className={`relative ${
          isCenter
            ? "mx-auto flex max-w-2xl flex-col items-center"
            : "max-w-2xl border-l-[3px] border-indigo-600 pl-4 sm:pl-5"
        }`}
      >
        {eyebrow ? (
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.22em] text-indigo-600 uppercase sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.35rem] leading-tight font-bold tracking-tight text-zinc-900 sm:text-[1.65rem] lg:text-[1.85rem]">
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`mt-2 text-[13px] leading-relaxed text-zinc-500 sm:text-sm ${
              isCenter ? "max-w-lg" : "max-w-xl"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className={`group inline-flex shrink-0 items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-[13px] font-semibold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 sm:text-sm ${
            isCenter ? "mx-auto mt-4" : "self-start sm:self-auto"
          }`}
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
