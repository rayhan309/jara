import NotFoundPage from "@/components/NotFoundPage";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "৪০৪ — পেজ পাওয়া যায়নি",
  description: "আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি বা সরিয়ে নেওয়া হয়েছে।",
  noIndex: true,
});

export default function NotFound() {
  return <NotFoundPage />;
}
