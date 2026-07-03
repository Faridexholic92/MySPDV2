/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "i.postimg.cc" },
			{ protocol: "https", hostname: "i.ibb.co" },
			{ protocol: "https", hostname: "ui-avatars.com" },
			{ protocol: "https", hostname: "*.supabase.co" },
		],
	},
};

export default nextConfig;
