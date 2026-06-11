"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 320);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="উপরে যান"
          title="উপরে যান"
          className="fixed right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-[0_8px_24px_-6px_rgba(79,70,229,0.55)] transition-colors hover:bg-indigo-700 sm:right-6 sm:h-12 sm:w-12"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
