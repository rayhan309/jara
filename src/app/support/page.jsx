import StoreShell from "@/components/layout/StoreShell";
import SupportPageView from "@/components/support/SupportPageView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "সহায়তা ও পলিসি",
  description:
    "Jara-এর যোগাযোগ, শিপিং, রিটার্ন এবং প্রাইভেসি তথ্য — আমরা সাহায্য করতে প্রস্তুত।",
  path: "/support",
  keywords: ["সহায়তা", "যোগাযোগ", "শিপিং পলিসি", "রিটার্ন পলিসি", "হেল্প"],
});

export default function SupportPage() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <SupportPageView />
    </StoreShell>
  );
}
