import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import StoreCategoriesView from "@/components/categories/StoreCategoriesView";
import { createPageMetadata } from "@/lib/siteMetadata";
import Box from "@mui/material/Box";

export const metadata = createPageMetadata({
  title: "Categories",
  description:
    "Browse all categories at Raisa's Glam Nest and find your favorite products easily.",
  path: "/categories",
  keywords: ["categories", "catalog", "product types", "shop"],
});

export default function CategoriesPage() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <Box component="section" sx={{ py: { xs: 3, sm: 4, lg: 5 } }}>
        <StoreContainer>
          <StoreCategoriesView />
        </StoreContainer>
      </Box>
    </StoreShell>
  );
}
