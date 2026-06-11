"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductsManager from "@/components/dashboard/ProductsManager";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab") === "categories") {
      router.replace("/dashboard/categories");
    }
  }, [router, searchParams]);

  return <ProductsManager />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
