import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protège l'admin et intercepte /login ; ignore assets/_next.
  matcher: ['/admin/:path*', '/login'],
};
