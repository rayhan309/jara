"use client";

import { motion } from "motion/react";
import { useCategories } from "@/hooks/useCategories";
import { CategoryTile, CategoryTileSkeleton } from "@/components/categories/CategoryTile";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

export default function HomeCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isError || (!isLoading && categories.length === 0)) {
    return null;
  }

  const preview = categories.slice(0, 8);

  return (
    <section className="border-t border-zinc-100 bg-zinc-50 py-8 sm:py-12 lg:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionHeader
          eyebrow="ক্যাটাগরি"
          title="জনপ্রিয় ক্যাটাগরি"
          subtitle="আপনার পছন্দের ক্যাটাগরি বেছে নিয়ে দ্রুত কেনাকাটা শুরু করুন"
          href="/categories"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CategoryTileSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-y-7 md:grid-cols-4 lg:grid-cols-6">
            {preview.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="min-w-0"
              >
                <CategoryTile category={category} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
