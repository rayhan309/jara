import StoreShell from "@/components/layout/StoreShell";
import HomeView from "@/components/home/HomeView";

export default function Home() {
  return (
    <StoreShell className="bg-zinc-50">
      <HomeView />
    </StoreShell>
  );
}
