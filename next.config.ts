import { config } from "dotenv";
import type { NextConfig } from "next";

config({ path: "optimizelyconfig.env" });

const nextConfig: NextConfig = {
	distDir: process.env.NEXT_DIST_DIR || ".next",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.cms.optimizely.com",
			},
		],
	},
};

export default nextConfig;
