import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nklxmrbjcjlzgsanwzxz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
