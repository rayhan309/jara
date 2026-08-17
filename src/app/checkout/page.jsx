import StoreContainer from "@/components/container/StoreContainer";
import StoreShell from "@/components/layout/StoreShell";
import CheckoutView from "@/components/checkout/CheckoutView";
import { createPageMetadata } from "@/lib/siteMetadata";
import Box from "@mui/material/Box";

export const metadata = createPageMetadata({
  title: "চেকআউট",
  description: "Jara-তে অর্ডার সম্পন্ন করুন — দ্রুত, নিরাপদ এবং সহজ চেকআউট।",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <StoreContainer>
        <Box sx={{ py: { xs: 3, sm: 5 }, pb: { xs: 12, sm: 5 } }}>
          <CheckoutView />
        </Box>
      </StoreContainer>
    </StoreShell>
  );
}
