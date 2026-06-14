import ProductForm from "@/components/dashboard/ProductForm";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Add Product",
  "Create a new product with pricing, inventory, images and attributes."
);

export default function NewProductPage() {
  return <ProductForm />;
}
