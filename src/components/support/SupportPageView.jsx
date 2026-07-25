"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Truck } from "lucide-react";

import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";

const navItems = [
  { id: "contact", label: "সাপোর্টে যোগাযোগ" },
  { id: "shipping", label: "শিপিং নীতি" },
  { id: "returns", label: "রিটার্ন নীতি" },
  { id: "privacy", label: "গোপনীয়তা নীতি" },
];

function PolicySection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">{title}</h2>
      <div className="mt-1 h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300/40" />
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function SupportPageView() {
  const settings = useStoreSettings();
  const CONTACT_PHONE = settings.contactPhone || "+8801815131040";
  const CONTACT_EMAIL = settings.contactEmail || "support@raisasglamnest.com";
  const CONTACT_ADDRESS = settings.contactAddress || "ঢাকা, বাংলাদেশ";
  return (
    <div className="store-container py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-600 uppercase">
            সহায়তা
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            সহায়তা ও নীতিমালা
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            যোগাযোগ, ডেলিভারি, রিটার্ন ও গোপনীয়তা সংক্রান্ত তথ্য এক জায়গায়।
          </p>
        </div>

        <nav
          aria-label="সহায়তা বিভাগ"
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-zinc-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:text-[13px]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <PolicySection id="contact" title="সাপোর্টে যোগাযোগ">
            <p>
              যেকোনো প্রশ্ন, অর্ডার সমস্যা বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।
              আমরা যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করব।
            </p>

            <ul className="space-y-3 pt-1">
              <li className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-zinc-500">ফোন</p>
                  <a href={`tel:${CONTACT_PHONE}`} className="font-semibold text-zinc-900 hover:text-indigo-600">
                    {CONTACT_PHONE}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-zinc-500">ইমেইল</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-semibold text-zinc-900 hover:text-indigo-600"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3.5 py-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold text-zinc-500">ঠিকানা</p>
                  <p className="font-semibold text-zinc-900">{CONTACT_ADDRESS}</p>
                </div>
              </li>
            </ul>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/orders-traking"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Truck className="h-4 w-4" />
                অর্ডার ট্র্যাক করুন
              </Link>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-200 hover:text-indigo-700"
              >
                <MessageCircle className="h-4 w-4" />
                কল করুন
              </a>
            </div>
          </PolicySection>

          <PolicySection id="shipping" title="শিপিং নীতি">
            <p>
              আমরা সারাদেশে <strong className="font-semibold text-zinc-800">Cash on Delivery (COD)</strong>{" "}
              পদ্ধতিতে পণ্য পাঠাই। অর্ডার কনফার্ম হওয়ার পর আমাদের টিম আপনার সাথে ফোনে যোগাযোগ
              করে ডেলিভারি নিশ্চিত করবে।
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>ঢাকার ভিতরে সাধারণত ১–৩ কর্মদিবসে ডেলিভারি দেওয়ার চেষ্টা করা হয়।</li>
              <li>ঢাকার বাইরে সাধারণত ৩–৭ কর্মদিবসে ডেলিভারি হতে পারে।</li>
              <li>ডেলিভারি চার্জ অর্ডার/checkout পেজে এলাকা অনুযায়ী দেখানো হয়।</li>
              <li>বিশেষ অবস্থা (ঈদ, ঝড়, পরিবহন সমস্যা) হলে ডেলিভারি সময় একটু বেশি লাগতে পারে।</li>
            </ul>
            <p>
              পণ্য হাতে পেয়ে ভালোভাবে দেখে নিয়ে তারপর পেমেন্ট করুন। কুরিয়ার/ডেলিভারি
              এজেন্টের কাছ থেকে পার্সেল গ্রহণের সময় কোনো সমস্যা থাকলে তৎক্ষণাৎ আমাদের জানান।
            </p>
          </PolicySection>

          <PolicySection id="returns" title="রিটার্ন নীতি">
            <p>
              আপনার সন্তুষ্টিই আমাদের অগ্রাধিকার। পণ্যে ত্রুটি বা ভুল ডেলিভারি হলে রিটার্ন/রিপ্লেসমেন্ট
              সুবিধা দেওয়া হয়।
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>পণ্য গ্রহণের <strong className="font-semibold text-zinc-800">৭ দিনের</strong> মধ্যে সমস্যা জানাতে হবে।</li>
              <li>পণ্য অবশ্যই অব্যবহৃত ও মূল অবস্থায় থাকতে হবে (যেখানে প্রযোজ্য)।</li>
              <li>ভুল পণ্য পাঠানো বা ক্ষতিগ্রস্ত পণ্যের ক্ষেত্রে রিপ্লেসমেন্ট/রিফান্ড বিবেচনা করা হয়।</li>
              <li>কাস্টম/পার্সোনাল আইটেম বা হাইজিন সংবেদনশীল কিছু পণ্যে রিটার্ন সীমিত হতে পারে।</li>
            </ul>
            <p>
              রিটার্ন বা রিপ্লেসমেন্টের জন্য অর্ডার নম্বর সহ{" "}
              <a href={`tel:${CONTACT_PHONE}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                {CONTACT_PHONE}
              </a>{" "}
              এ কল করুন অথবা{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                {CONTACT_EMAIL}
              </a>{" "}
              এ ইমেইল করুন।
            </p>
          </PolicySection>

          <PolicySection id="privacy" title="গোপনীয়তা নীতি">
            <p>
              Raisa's Glam Nest আপনার ব্যক্তিগত তথ্য গোপনীয়ভাবে রাখতে প্রতিশ্রুতিবদ্ধ। অর্ডার
              প্রক্রিয়াকরণের জন্য আমরা শুধু প্রয়োজনীয় তথ্য সংগ্রহ করি।
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>আমরা সংগ্রহ করি: নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও অর্ডার সংক্রান্ত তথ্য।</li>
              <li>এই তথ্য শুধু অর্ডার প্রক্রিয়া, ডেলিভারি ও গ্রাহক সেবার জন্য ব্যবহার করা হয়।</li>
              <li>আপনার অনুমতি ছাড়া তৃতীয় পক্ষের সাথে তথ্য বিক্রি বা শেয়ার করা হয় না।</li>
              <li>পেমেন্ট তথ্য আমাদের সার্ভারে সংরক্ষিত হয় না — COD পদ্ধতিতে লেনদেন হয়।</li>
              <li>প্রয়োজন অনুযায়ী আমরা নিরাপত্তা উন্নত করতে এই নীতি আপডেট করতে পারি।</li>
            </ul>
            <p>
              আপনার তথ্য সংক্রান্ত যেকোনো প্রশ্নে{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                {CONTACT_EMAIL}
              </a>{" "}
              এ যোগাযোগ করুন।
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
}
