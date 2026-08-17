import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import StoreCategoriesView from "@/components/categories/StoreCategoriesView";
import { createPageMetadata } from "@/lib/siteMetadata";
import Box from "@mui/material/Box";

export const metadata = createPageMetadata({
  title: "ক্যাটাগরি",
  description:
    "Jara-তে সব ক্যাটাগরি দেখুন এবং পছন্দের পণ্য সহজে খুঁজে নিন।",
  path: "/categories",
  keywords: ["ক্যাটাগরি", "ক্যাটালগ", "পণ্যের ধরন", "শপ"],
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
