import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import StoreProductsView from "@/components/products/StoreProductsView";
import { createPageMetadata } from "@/lib/siteMetadata";
import Box from "@mui/material/Box";

export const metadata = createPageMetadata({
  title: "All products",
  description:
    "Browse the full product catalog at Raisa's Glam Nest. Find what you need with categories and search.",
  path: "/products",
  keywords: ["products", "shop", "online store", "catalog"],
});

export default function ProductsPage() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <Box component="section" sx={{ py: { xs: 3, sm: 4, lg: 5 } }}>
        <StoreContainer>
          <StoreProductsView />
        </StoreContainer>
      </Box>
    </StoreShell>
  );
}
