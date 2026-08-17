import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "অর্ডার সফল",
  description: "আপনার Jara অর্ডার সফলভাবে গ্রহণ করা হয়েছে। আমরা শিগগিরই যোগাযোগ করব।",
  path: "/thankyou",
  noIndex: true,
});

export default function ThankYouLayout({ children }) {
  return children;
}
