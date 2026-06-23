import localFont from 'next/font/local';
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import { SITE_URL } from '@/lib/siteConfig';
import { Analytics } from "@vercel/analytics/next";
import profile from '@/data/profile.json';

const pageTitle = `${profile.name.full} | ${profile.roles.short}`;
const socialUrls = profile.socials.map(({ href }) => href);

const geistSans = localFont({
  src: '../public/fonts/geist-latin.woff2',
  variable: "--font-geist-sans",
  display: 'swap',
  weight: '100 900',
});

const geistMono = localFont({
  src: '../public/fonts/geist-mono-latin.woff2',
  variable: "--font-geist-mono",
  display: 'swap',
  weight: '100 900',
});

const baloo = localFont({
  src: '../public/fonts/baloo-2-latin.woff2',
  variable: "--font-baloo",
  display: 'swap',
  weight: '400 800',
});

const dancing = localFont({
  src: '../public/fonts/dancing-script-latin.woff2',
  variable: "--font-dancing",
  display: 'swap',
  weight: '400 700',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: pageTitle,
    template: `%s | ${profile.name.full}`,
  },
  description: profile.description,
  keywords: [
    profile.name.full,
    'AI/ML Engineer',
    'Agentic AI',
    'Multi-Agent RAG',
    'LangGraph',
    'Machine Learning Engineer',
    'AI Systems',
    'Portfolio',
    'Texas',
  ],
  authors: [{ name: profile.name.full, url: SITE_URL }],
  creator: profile.name.full,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: profile.name.full,
    title: pageTitle,
    description: profile.description,
    images: [
      {
        url: profile.images.portrait,
        alt: `${profile.name.full} — ${profile.roles.short} portfolio`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: profile.description,
    images: [profile.images.portrait],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicons/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png' },
      { url: '/favicons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicons/manifest.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: profile.name.full,
              url: SITE_URL,
              email: profile.email,
              jobTitle: profile.roles.short,
              description: profile.description,
              sameAs: socialUrls,
              address: {
                '@type': 'PostalAddress',
                addressLocality: profile.location.based,
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
        <Cursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
