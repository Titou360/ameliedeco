import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-svh bg-sand-50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="font-display text-lg">Amélie Déco — Administration</Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-sans text-sm text-muted sm:inline">{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-sand-50"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
