import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Placeholder imagery only, so the site can be reviewed as a
        // finished design rather than a page full of REPLACE_ME.
        //
        // Every one of these is requested with `?grayscale` on purpose:
        // arbitrary colour photography would fight the strict five-colour
        // palette, whereas monochrome reads as cinematic stills against the
        // ivory and gold.
        //
        // Delete this entry once real assets live in /public — nothing on a
        // launched site should depend on a third-party placeholder service.
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
