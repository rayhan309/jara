import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "অর্ডার সফল",
  description: "আপনার Raisa's Glam Nest অর্ডার সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।",
  path: "/thankyou",
  noIndex: true,
});

export default function ThankYouLayout({ children }) {
  return children;
}
