"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerClassName="font-store"
      toastOptions={{
        duration: 2600,
        className: "rounded-md",
        style: {
          borderRadius: "0.375rem",
          background: "#ffffff",
          color: "#18181b",
          border: "1px solid #e4e4e7",
          boxShadow: "0 8px 24px -12px rgba(15, 23, 42, 0.18)",
          fontSize: "13px",
          fontWeight: 500,
          padding: "10px 14px",
        },
        success: {
          iconTheme: {
            primary: "#4f46e5",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#e11d48",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
