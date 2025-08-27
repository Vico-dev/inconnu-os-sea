import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { Toaster } from "react-hot-toast"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Agence Inconnu - Expert Google Ads & SEA",
    template: "%s | Agence Inconnu"
  },
  description: "Agence spécialisée en Google Ads et SEA. Optimisation de campagnes, gestion de comptes publicitaires et accompagnement personnalisé pour maximiser votre ROI.",
  keywords: [
    "Google Ads",
    "SEA",
    "Publicité en ligne",
    "Marketing digital",
    "Optimisation de campagnes",
    "Gestion de comptes publicitaires",
    "ROI",
    "Agence marketing",
    "Publicité Google",
    "Campagnes publicitaires"
  ],
  authors: [{ name: "Agence Inconnu" }],
  creator: "Agence Inconnu",
  publisher: "Agence Inconnu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://agence-inconnu.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://agence-inconnu.fr',
    title: 'Agence Inconnu - Expert Google Ads & SEA',
    description: 'Agence spécialisée en Google Ads et SEA. Optimisation de campagnes, gestion de comptes publicitaires et accompagnement personnalisé.',
    siteName: 'Agence Inconnu',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Agence Inconnu - Expert Google Ads & SEA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agence Inconnu - Expert Google Ads & SEA',
    description: 'Agence spécialisée en Google Ads et SEA. Optimisation de campagnes et accompagnement personnalisé.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'votre-code-verification-google',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#1E293B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Agence Inconnu" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
