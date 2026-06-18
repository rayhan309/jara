"use client";

import Image from "next/image";
import { RiStore2Fill } from "react-icons/ri";

const SIZE_MAP = {
  xs: { box: "h-8 w-8", icon: "h-3.5 w-3.5", image: 32 },
  sm: { box: "h-9 w-9", icon: "h-4 w-4", image: 36 },
  md: { box: "h-10 w-10 sm:h-11 sm:w-11", icon: "h-5 w-5", image: 44 },
};

export default function ShopLogo({
  logoUrl,
  size = "md",
  className = "",
  fallbackClassName = "bg-indigo-600 shadow-md shadow-indigo-200",
}) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  if (logoUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-md ${sizeConfig.box} ${className}`}
      >
        <Image
          src={logoUrl}
          alt="Shop logo"
          fill
          sizes={`${sizeConfig.image}px`}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md ${sizeConfig.box} ${fallbackClassName} ${className}`}
    >
      <RiStore2Fill className={`${sizeConfig.icon} text-white`} />
    </div>
  );
}
