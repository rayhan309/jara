import Link from "next/link";
import { Play } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

export default function HomeVideoSection() {
  return (
    <section className="border-t border-zinc-100 bg-white py-8 sm:py-12 lg:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeader
          eyebrow="রিভিউ"
          title="প্রডাক্ট রিভিউ ভিডিও"
          subtitle="কেনার আগে রিয়েল ইউজার রিভিউ ও প্রডাক্ট ডেমো দেখে সঠিক সিদ্ধান্ত নিন"
          align="left"
        />

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
          <div className="relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-900 shadow-sm">
            <div className="aspect-video bg-gradient-to-br from-indigo-950 via-indigo-900 to-zinc-900" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center text-white sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-900/40 sm:h-14 sm:w-14">
                <Play className="ml-0.5 h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
              </div>
              <h3 className="max-w-md text-base font-bold leading-snug sm:text-lg lg:text-xl">
                আমাদের সর্বশেষ প্রডাক্টের রিভিউ ভিডিও দেখুন
              </h3>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/75 sm:text-sm">
                রিয়েল ইউজার রিভিউ ও প্রডাক্ট ডেমো — কেনার আগে নিশ্চিত হন
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-md border border-zinc-200 bg-indigo-50/50 p-5 shadow-sm sm:p-7 lg:p-8">
            <p className="text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
              এছাড়াও আমাদের অফিশিয়াল ইউটিউব চ্যানেলে পাবেন সকল প্রডাক্টের রিভিউ,
              আনবক্সিং এবং ব্যবহারের টিপস।
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <Link
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-indigo-700 sm:text-sm"
              >
                <Play className="h-4 w-4" />
                ভিডিও দেখুন
              </Link>
              <Link
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 sm:text-sm"
              >
                <FaYoutube className="h-4 w-4" />
                ইউটিউব চ্যানেল
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
