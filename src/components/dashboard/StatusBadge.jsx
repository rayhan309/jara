import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";

const styles = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Pending: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const icons = {
  Delivered: CheckCircle2,
  Processing: Clock,
  Shipped: Truck,
  Pending: Package,
  Cancelled: XCircle,
};

export default function StatusBadge({ status }) {
  const Icon = icons[status] || Package;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
        styles[status] || styles.Pending
      }`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
