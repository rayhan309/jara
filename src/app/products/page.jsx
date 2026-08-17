import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import StoreProductsView from "@/components/products/StoreProductsView";
import { createPageMetadata } from "@/lib/siteMetadata";
import Box from "@mui/material/Box";

export const metadata = createPageMetadata({
  title: "সব পণ্য",
  description:
    "Jara-তে সব পণ্য দেখুন। ক্যাটাগরি ও সার্চ দিয়ে সহজে খুঁজে নিন।",
  path: "/products",
  keywords: ["পণ্য", "শপ", "অনলাইন স্টোর", "ক্যাটালগ"],
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
