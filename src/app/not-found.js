import NotFoundPage from "@/components/NotFoundPage";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "404 — Page not found",
  description: "The page you are looking for could not be found or has been moved.",
  noIndex: true,
});

export default function NotFound() {
  return <NotFoundPage />;
}
