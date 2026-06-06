"use client";

import { Users } from "lucide-react";
import PagePlaceholder from "@/components/dashboard/PagePlaceholder";

export default function CustomersPage() {
  return (
    <PagePlaceholder
      title="Customer Directory"
      description="View customer profiles, purchase history, and engagement metrics in one place."
      icon={Users}
    />
  );
}
