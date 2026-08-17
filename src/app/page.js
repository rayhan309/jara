import StoreShell from "@/components/layout/StoreShell";
import HomeView from "@/components/home/HomeView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "হোম",
  description:
    "Jara থেকে মানসম্মত পণ্য কিনুন। দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি এবং নিরাপদ অনলাইন শপিং।",
  path: "/",
});

export default function Home() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <HomeView />
    </StoreShell>
  );
}
