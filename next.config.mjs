import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 90, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
  // MUI v9 dropped system props on Stack; route imports through a compat wrapper.
  turbopack: {
    resolveAlias: {
      "@mui/material/Stack": "./src/components/mui/Stack.jsx",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mui/material/Stack": path.resolve(__dirname, "src/components/mui/Stack.jsx"),
    };
    return config;
  },
};

export default nextConfig;
