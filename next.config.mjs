const trustedImageRemotePatterns = [
  { protocol: 'https', hostname: 'eryawanagung.my.id' },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const { hostname, protocol } = new URL(supabaseUrl);

    if (protocol === 'https:' && hostname) {
      trustedImageRemotePatterns.push({
        protocol: 'https',
        hostname,
        pathname: '/storage/v1/object/public/**',
      });
    }
  } catch {
    // Ignore invalid Supabase URLs so local builds can continue without broad image access.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: trustedImageRemotePatterns,
  },
};

export default nextConfig;
