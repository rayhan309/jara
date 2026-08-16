import StoreShell from "@/components/layout/StoreShell";
import SupportPageView from "@/components/support/SupportPageView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Help & policies",
  description:
    "Contact, shipping, returns, and privacy information for Jara — we're here to help.",
  path: "/support",
  keywords: ["support", "contact", "shipping policy", "return policy", "help"],
});

export default function SupportPage() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <SupportPageView />
    </StoreShell>
  );
}
