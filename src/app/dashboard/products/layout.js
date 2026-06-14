import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Products",
  "Create, edit and manage product listings, pricing and inventory."
);

export default function ProductsLayout({ children }) {
  return children;
}
