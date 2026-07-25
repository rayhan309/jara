import StoreShell from "@/components/layout/StoreShell";
import SupportPageView from "@/components/support/SupportPageView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "সহায়তা ও নীতিমালা",
  description:
    "Raisa's Glam Nest যোগাযোগ, শিপিং নীতি, রিটার্ন ও গোপনীয়তা সংক্রান্ত তথ্য — আমরা সাহায্যের জন্য আছি।",
  path: "/support",
  keywords: ["support", "contact", "shipping policy", "return policy", "সহায়তা", "যোগাযোগ"],
});

export default function SupportPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <SupportPageView />
    </StoreShell>
  );
}
