import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Order successful",
  description: "Your Jara order has been received successfully. We will contact you shortly.",
  path: "/thankyou",
  noIndex: true,
});

export default function ThankYouLayout({ children }) {
  return children;
}
