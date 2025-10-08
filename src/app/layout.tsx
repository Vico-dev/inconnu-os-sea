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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  return (
    <html lang="fr">
      <head>
        {/* Consent Mode v2 - valeurs par défaut (denied) avant chargement GTM */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent','default',{
                'ad_storage':'denied',
                'analytics_storage':'denied',
                'ad_user_data':'denied',
                'ad_personalization':'denied'
              });
            `
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#1E293B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Agence Inconnu" />
        {/* Google Tag Manager */}
        {gtmId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(
                function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');`
            }}
          />
        ) : null}
      </head>
      <body className={inter.className}>
        {/* Klaro CMP (open-source) */}
        <link rel="stylesheet" href="/vendor/klaro/klaro.min.css" />
        {/* Important: passer le nom de config à Klaro pour initialiser la bannière */}
        <script src="/klaro-config.js" defer />
        <script src="/vendor/klaro/klaro.min.js" defer data-klaro-config="klaroConfig" />
        {/* Forcer l'ouverture de la bannière une fois Klaro chargé */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(
              function waitKlaro(){
                try{
                  if (window.klaro && typeof window.klaro.show === 'function') {
                    window.klaro.show();
                    return;
                  }
                }catch(e){}
                setTimeout(waitKlaro, 400);
              }
              )( );`
          }}
        />
        {/* Google Tag Manager (noscript) */}
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
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
