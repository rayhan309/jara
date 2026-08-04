import ReviewsManager from "@/components/dashboard/ReviewsManager";
import { createAdminPageMetadata } from "@/lib/siteMetadata";

export const metadata = createAdminPageMetadata(
  "Client Reviews",
  "Manage customer testimonials shown on the homepage."
);

export default function ClientReviewsPage() {
  return <ReviewsManager />;
}
