import StoreShell from "@/components/layout/StoreShell";
import HomeView from "@/components/home/HomeView";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Home",
  description:
    "Shop quality products at Raisa's Glam Nest. Fast delivery, cash on delivery, and a secure online shopping experience.",
  path: "/",
});

export default function Home() {
  return (
    <StoreShell sx={{ bgcolor: "grey.50" }}>
      <HomeView />
    </StoreShell>
  );
}
