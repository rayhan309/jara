import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: RefreshCw,
    title: "সহজ পরিবর্তনের গ্যারান্টি",
  },
  {
    icon: Truck,
    title: "সারাদেশে ক্যাশ অন হোম ডেলিভারি",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদে পেমেন্ট করার সহজ উপায়",
  },
  {
    icon: Headphones,
    title: "সর্বক্ষণিক ও দ্রুত গ্রাহক সেবা",
  },
];

export default function TrustFeatures() {
  return (
    <section className="bg-white py-4 sm:py-5">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:rounded-full">
          <div className="flex snap-x snap-mandatory divide-x divide-zinc-200 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex min-w-[78%] shrink-0 snap-start items-center gap-3 px-4 py-3.5 sm:min-w-0 sm:px-5 sm:py-4 lg:justify-center lg:px-6"
                >
                  <Icon
                    className="h-6 w-6 shrink-0 text-zinc-900 sm:h-7 sm:w-7"
                    strokeWidth={1.6}
                  />
                  <p className="text-[13px] leading-snug font-bold text-zinc-900 sm:text-sm">
                    {feature.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
