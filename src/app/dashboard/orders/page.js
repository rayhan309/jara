"use client";

import { ShoppingBag } from "lucide-react";
import PagePlaceholder from "@/components/dashboard/PagePlaceholder";

export default function OrdersPage() {
  return (
    <PagePlaceholder
      title="Orders Management"
      description="Track, filter, and fulfill customer orders from this module. Full order pipeline coming soon."
      icon={ShoppingBag}
    />
  );
}
