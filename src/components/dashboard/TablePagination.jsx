"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const btnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-dash-border bg-white text-dash-text transition-colors hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-dash-border bg-slate-50/50 px-4 py-3 sm:flex-row">
      <p className="text-center text-xs text-dash-muted sm:text-left">
        Showing <span className="font-semibold text-dash-text">{start}</span>–
        <span className="font-semibold text-dash-text">{end}</span> of{" "}
        <span className="font-semibold text-dash-text">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={btnClass}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[88px] text-center text-xs font-semibold text-dash-text">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={btnClass}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
