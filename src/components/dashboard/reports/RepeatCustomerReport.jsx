"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OrdersManager from "@/components/dashboard/OrdersManager";

export default function RepeatCustomerReport() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  return (
    <div className="space-y-5">
      <div className="dash-card p-5 sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
          Reports
        </p>
        <h1 className="text-2xl font-bold text-dash-text">Repeat Customer Report</h1>
        <p className="mt-1 text-sm text-dash-muted">
          {phone
            ? `Showing all orders for ${phone}.`
            : "Select a repeat customer from Orders to view the report."}
        </p>
        <div className="mt-3">
          <Link href="/dashboard/orders" className="text-sm font-semibold text-indigo-600">
            Back to Orders
          </Link>
        </div>
      </div>

      <OrdersManager initialSearch={phone} reportMode />
    </div>
  );
}
