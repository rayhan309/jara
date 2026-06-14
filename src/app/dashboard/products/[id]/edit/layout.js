import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Edit Product",
  "Update product details, pricing, inventory and images."
);

export default function EditProductLayout({ children }) {
  return children;
}
