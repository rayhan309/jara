import { notFound } from "next/navigation";
import StoreShell from "@/components/layout/StoreShell";
import StoreProductDetailView from "@/components/products/StoreProductDetailView";
import { getProductByIdOrSlug, getRelatedProducts } from "@/lib/productsServer";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return { title: "পণ্য পাওয়া যায়নি | Nexa Commerce" };
  }

  const title = product.title_bn || product.title_en;

  return {
    title: `${title} | Nexa Commerce`,
    description: product.description?.slice(0, 160) || `${title} — Nexa Commerce-এ কিনুন`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);

  return (
    <StoreShell className="bg-zinc-50">
      <StoreProductDetailView product={product} relatedProducts={relatedProducts} />
    </StoreShell>
  );
}
