import { notFound } from "next/navigation";
import StoreShell from "@/components/layout/StoreShell";
import StoreProductDetailView from "@/components/products/StoreProductDetailView";
import { getProductByIdOrSlug, getRelatedProducts } from "@/lib/productsServer";
import { createPageMetadata } from "@/lib/siteMetadata";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return createPageMetadata({
      title: "Product not found",
      description: "The product you are looking for could not be found.",
      path: `/products/${id}`,
      noIndex: true,
    });
  }

  const title = product.title_bn || product.title_en;
  const description =
    product.description?.slice(0, 160) ||
    `${title} — buy at Jara. Fast delivery and cash on delivery available.`;

  return createPageMetadata({
    title,
    description,
    path: `/products/${product.slug || id}`,
    image: product.images?.[0]?.url,
    keywords: [
      title,
      product.category,
      product.brand_or_vendor,
      "buy online",
      "buy online",
    ].filter(Boolean),
  });
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);

  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <StoreProductDetailView product={product} relatedProducts={relatedProducts} />
    </StoreShell>
  );
}
