import type { NextConfig } from "next"
import path from 'path'
// Importer dynamiquement webpack pour éviter les types en build local
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackAny: any = require('webpack')

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    swcPlugins: [
      [
        // Neutraliser les templates emails durant le build pour éviter le pre-render
        require.resolve('./scripts/swc-null-email-plugin'),
        {}
      ]
    ]
  },
  serverExternalPackages: ['@prisma/client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Remplacer toute importation des templates emails par un stub
      // On match la requête telle qu'écrite dans le code: '@/components/emails/...'
      const emailsRequest = /^@\/components\/emails\/.+$/
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpackAny.NormalModuleReplacementPlugin(
          emailsRequest as any,
          path.resolve(__dirname, 'src/components/emails/__stub__.tsx')
        )
      )
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
