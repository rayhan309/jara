import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Categories",
  "Organize your product catalog with categories and display order."
);

export default function CategoriesLayout({ children }) {
  return children;
}
