import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: RefreshCw,
    title: "৭ দিনের মধ্যে পরিবর্তন",
    desc: "নির্দিষ্ট পণ্যে বিনামূল্যে রিপ্লেসমেন্ট",
  },
  {
    icon: Truck,
    title: "ফ্রি হোম ডেলিভারি",
    desc: "ঢাকার মধ্যে নির্বাচিত অর্ডারে",
  },
  {
    icon: ShieldCheck,
    title: "নিরাপদ পেমেন্ট",
    desc: "ক্যাশ অন ডেলিভারি সহজ ও নিরাপদ",
  },
  {
    icon: Headphones,
    title: "গ্রাহক সেবা",
    desc: "সর্বক্ষণিক দ্রুত সহায়তা",
  },
];

export default function TrustFeatures() {
  return (
    <section className="border-b border-zinc-100 bg-white py-4 sm:py-5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-4 [&::-webkit-scrollbar]:hidden">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex min-w-[82%] shrink-0 snap-start items-center gap-3 rounded-md border border-zinc-100 bg-zinc-50/90 p-3.5 sm:min-w-0 sm:p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-snug text-zinc-900 sm:text-sm">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-xs">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
