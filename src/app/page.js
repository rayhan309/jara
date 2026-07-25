import StoreShell from "@/components/layout/StoreShell";
import HomeView from "@/components/home/HomeView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "হোম",
  description:
    "Raisa's Glam Nest-এ সেরা দামে পণ্য কিনুন। দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি ও নিরাপদ অনলাইন শপিং অভিজ্ঞতা।",
  path: "/",
});

export default function Home() {
  return (
    <StoreShell className="bg-zinc-50">
      <HomeView />
    </StoreShell>
  );
}
