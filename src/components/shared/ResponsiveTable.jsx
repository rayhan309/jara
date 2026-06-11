export function DesktopTable({ children, className = "" }) {
  return (
    <div className={`hidden overflow-x-auto lg:block ${className}`}>{children}</div>
  );
}

export function MobileCardList({ children, className = "" }) {
  return <div className={`space-y-3 lg:hidden ${className}`}>{children}</div>;
}

export function MobileDataCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-md border border-zinc-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileDashCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-md border border-dash-border bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileDataRow({ label, value, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-sm ${className}`}>
      <span className="shrink-0 text-zinc-500">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-zinc-900">{value}</span>
    </div>
  );
}

export function MobileDashRow({ label, value, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-sm ${className}`}>
      <span className="shrink-0 text-dash-muted">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-dash-text">{value}</span>
    </div>
  );
}

/** Full-screen bottom sheet on mobile, viewport-centered dialog on sm+ (mx-auto avoids transform clash with motion) */
export const mobileModalClass =
  "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-xl sm:inset-x-auto sm:bottom-auto sm:left-0 sm:right-0 sm:top-[4vh] sm:mx-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-md md:max-w-2xl lg:max-w-4xl";

export const mobileDashModalClass =
  "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-dash-border bg-white shadow-xl sm:inset-x-auto sm:bottom-auto sm:left-0 sm:right-0 sm:top-[5vh] sm:mx-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-md md:max-w-2xl lg:max-w-4xl";
