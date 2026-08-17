export const SITE_NAME = "Jara";
export const SITE_NAME_SHORT = "Jara";
export const ADMIN_NAME = "Jara Admin";

export const DEFAULT_DESCRIPTION =
  "Jara — বাংলাদেশের বিশ্বস্ত অনলাইন শপ। মানসম্মত পণ্য, দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি এবং সহজ অর্ডার ট্র্যাকিং।";

export const DEFAULT_KEYWORDS = [
  "Jara",
  "জারা",
  "অনলাইন শপিং বাংলাদেশ",
  "ই-কমার্স",
  "অনলাইন শপিং",
  "ক্যাশ অন ডেলিভারি",
  "COD",
  "অর্ডার ট্র্যাকিং",
  "বাংলাদেশ",
];

const DEFAULT_OG_IMAGE = "/images/banner-1.jpg";
const DEFAULT_ICON = "/images/favIcon.png";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

function resolveOgImage(image) {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE);
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  keywords = DEFAULT_KEYWORDS,
  image,
  noIndex = false,
  type = "website",
  absoluteTitle = false,
}) {
  const pageTitle = absoluteTitle
    ? title
    : title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const ogImage = resolveOgImage(image);

  return {
    title: pageTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "bn_BD",
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

export function createAdminPageMetadata(title, description) {
  return {
    title,
    description:
      description || `${title} — ${SITE_NAME} admin dashboard management panel.`,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export const rootMetadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — অনলাইন শপিং`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME_SHORT, url: getSiteUrl() }],
  creator: SITE_NAME_SHORT,
  publisher: SITE_NAME_SHORT,
  category: "shopping",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: getSiteUrl(),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — অনলাইন শপিং`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — অনলাইন শপিং`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: DEFAULT_ICON, type: "image/png" }],
    apple: [{ url: DEFAULT_ICON, type: "image/png" }],
    shortcut: [{ url: DEFAULT_ICON, type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const adminRootMetadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `Dashboard | ${ADMIN_NAME}`,
    template: `%s | ${ADMIN_NAME}`,
  },
  description: `${SITE_NAME} admin dashboard — manage orders, products, customers and store settings.`,
  applicationName: ADMIN_NAME,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [{ url: DEFAULT_ICON, type: "image/png" }],
    apple: [{ url: DEFAULT_ICON, type: "image/png" }],
  },
};
