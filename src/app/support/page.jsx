import StoreShell from "@/components/layout/StoreShell";
import SupportPageView from "@/components/support/SupportPageView";

export const metadata = {
  title: "সহায়তা ও নীতিমালা | Nexa Commerce",
  description: "যোগাযোগ, শিপিং, রিটার্ন ও গোপনীয়তা নীতি — Nexa Commerce",
};

export default function SupportPage() {
  return (
    <StoreShell className="bg-zinc-50">
      <SupportPageView />
    </StoreShell>
  );
}
