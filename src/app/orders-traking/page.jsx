import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import OrdersTrackingView from "@/components/orders/OrdersTrackingView";

function TrackingFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );
}

export default function OrdersTrackingPage() {
  return (
    <Suspense fallback={<TrackingFallback />}>
      <OrdersTrackingView />
    </Suspense>
  );
}
