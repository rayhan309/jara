"use client";

import { Package } from "lucide-react";
import PagePlaceholder from "@/components/dashboard/PagePlaceholder";

export default function ProductsPage() {
  return (
    <PagePlaceholder
      title="Product Catalog"
      description="Manage your product listings, pricing, variants, and inventory from a centralized hub."
      icon={Package}
    />
  );
}
