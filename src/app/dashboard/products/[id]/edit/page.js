"use client";

import { Loader2 } from "lucide-react";
import ProductForm from "@/components/dashboard/ProductForm";
import { useProduct } from "@/hooks/useProducts";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const { data: product, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="dash-card flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error?.message || "Product not found."}</p>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
