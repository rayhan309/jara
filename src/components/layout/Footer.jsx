"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { RiStore2Fill } from "react-icons/ri";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { getActiveSocialLinks, getSocialIcon } from "@/lib/socialLinks";

const quickLinks = [
  { href: "/", label: "হোম" },
  { href: "/orders-traking", label: "অর্ডার ট্র্যাক" },
  { href: "/thankyou", label: "ধন্যবাদ" },
  { href: "/admin/login", label: "অ্যাডমিন লগইন" },
];

const supportLinks = [
  { href: "/support#contact", label: "সাপোর্টে যোগাযোগ" },
  { href: "/support#shipping", label: "শিপিং নীতি" },
  { href: "/support#returns", label: "রিটার্ন নীতি" },
  { href: "/support#privacy", label: "গোপনীয়তা নীতি" },
];

export default function Footer() {
  const settings = useStoreSettings();
  const socialLinks = getActiveSocialLinks(settings);

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="store-container py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="rounded-md flex h-10 w-10 items-center justify-center bg-indigo-600">
                <RiStore2Fill className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900">Nexa Commerce</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য। মানসম্মত পণ্য, দ্রুত ডেলিভারি
              এবং সহজ অর্ডার ট্র্যাকিং।
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      whileHover={{ y: -3, scale: 1.05 }}
                      className="rounded-md flex h-9 w-9 items-center justify-center border border-zinc-200 text-zinc-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.a>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-400">Social links admin settings theke add korun.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <h3 className="text-sm font-bold text-zinc-900">দ্রুত লিংক</h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-indigo-600"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            <h3 className="text-sm font-bold text-zinc-900">সহায়তা</h3>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-indigo-600"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <h3 className="text-sm font-bold text-zinc-900">যোগাযোগ</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-zinc-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                ঢাকা, বাংলাদেশ
              </li>
              <li className="flex items-center gap-2.5 text-sm text-zinc-500">
                <Phone className="h-4 w-4 shrink-0 text-indigo-500" />
                +8801815131040
              </li>
              <li className="flex items-center gap-2.5 text-sm text-zinc-500">
                <Mail className="h-4 w-4 shrink-0 text-indigo-500" />
                support@nexa.com
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50">
        <div className="store-container flex flex-col items-center justify-between gap-3 py-5 text-center sm:flex-row sm:text-left">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-zinc-400"
          >
            © {new Date().getFullYear()} Nexa Commerce. সর্বস্বত্ব সংরক্ষিত।
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xs text-zinc-400"
          >
            আধুনিক ই-কমার্সের জন্য তৈরি
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
