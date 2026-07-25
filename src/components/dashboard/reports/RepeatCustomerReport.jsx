"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OrdersManager from "@/components/dashboard/OrdersManager";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

export default function RepeatCustomerReport() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  return (
    <div className="space-y-5">
      <div className="dash-card p-5 sm:p-6">
        <DashPageHeader
          eyebrow="Reports"
          title="Repeat Customer Report"
          description={
            phone
              ? `Showing all orders for ${phone}.`
              : "Select a repeat customer from Orders to view the report."
          }
          animate={false}
          action={
            <Link
              href="/dashboard/orders"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Back to Orders
            </Link>
          }
        />
      </div>

      <OrdersManager initialSearch={phone} reportMode />
    </div>
  );
}
