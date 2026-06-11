"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, Loader2, Package } from "lucide-react";
import ProductsManager from "@/components/dashboard/ProductsManager";
import CategoriesManager from "@/components/dashboard/CategoriesManager";

function CatalogTabs({ activeTab, onChange }) {
  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Layers },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-dash-border pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-dash-border bg-white text-dash-muted hover:border-indigo-200 hover:text-indigo-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "categories" ? "categories" : "products";

  function handleTabChange(tab) {
    router.push(
      tab === "categories" ? "/dashboard/products?tab=categories" : "/dashboard/products"
    );
  }

  return (
    <div className="space-y-6">
      <CatalogTabs activeTab={activeTab} onChange={handleTabChange} />
      {activeTab === "categories" ? <CategoriesManager /> : <ProductsManager />}
    </div>
  );
}

function CatalogFallback() {
  return (
    <div className="dash-card flex min-h-[280px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
}

export default function CatalogManager() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent />
    </Suspense>
  );
}
