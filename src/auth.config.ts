import type { NextAuthConfig } from 'next-auth';

/**
 * Config Auth.js edge-safe, utilisée par le middleware. Ne contient AUCUN
 * accès base/bcrypt (le provider Credentials est ajouté dans auth.ts, Node).
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/login';
      if (isOnAdmin) return isLoggedIn;
      if (isOnLogin && isLoggedIn) return Response.redirect(new URL('/admin', nextUrl));
      return true;
    },
  },
} satisfies NextAuthConfig;
