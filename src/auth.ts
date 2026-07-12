import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { getUserByEmail } from '@/lib/auth/users';
import { verifyPassword } from '@/lib/auth/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').toLowerCase().trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;
        try {
          const user = await getUserByEmail(email);
          if (!user) return null;
          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
          console.error('[auth] authorize a échoué :', err);
          return null;
        }
      },
    }),
  ],
});
