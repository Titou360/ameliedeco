/**
 * Configuration Next.js — Amélie Déco
 * App Router, optimisation images, en-têtes de sécurité (Best Practices Lighthouse).
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Autoriser d'éventuelles sources distantes (CMS/CDN) à ajouter ultérieurement.
    remotePatterns: [],
  },
  // Transpile les paquets 3D si besoin (React Three Fiber / Drei) à l'étape Three.js.
  transpilePackages: [],
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
