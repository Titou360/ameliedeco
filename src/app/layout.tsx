import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { siteConfig } from '@/lib/site';
import { AppProviders } from '@/components/providers/AppProviders';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SiteChrome } from '@/components/layout/SiteChrome';
import '@/styles/globals.css';

/**
 * Typographies auto-hébergées via next/font (aucune requête réseau tierce,
 * pas de CLS). Titre : Cormorant Garamond (serif éditoriale premium).
 * Texte : Manrope (sans-serif contemporaine).
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#f6f5f1',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.legalName} — Décoratrice d'intérieur à Bordeaux`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  keywords: [
    "décoratrice d'intérieur Bordeaux",
    'décoration intérieure Bordeaux',
    "architecte d'intérieur Bordeaux",
    'décoratrice Gironde',
    'décoration maison Bordeaux',
    'aménagement intérieur Bordeaux',
    'décoratrice 33',
    'home staging Bordeaux',
    'conseil décoration Bordeaux',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.legalName} — Décoratrice d'intérieur à Bordeaux`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.legalName} — Décoratrice d'intérieur à Bordeaux`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream"
        >
          Aller au contenu
        </a>
        <AppProviders>
          <SiteChrome header={<Header />} footer={<Footer />}>
            <main id="contenu">{children}</main>
          </SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
