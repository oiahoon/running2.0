import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { AppLayout } from '@/components/AppLayout'

import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import '@fontsource-variable/noto-sans-sc/wght.css'
import '@fontsource-variable/noto-sans-jp/wght.css'
import '@/app/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://run2.miaowu.org'),
  title: {
    template: '%s - RUN2 Atlas',
    default: 'RUN2 Atlas',
  },
  description:
    'A route-first running intelligence workspace with analytics, maps, sync operations, and share-ready training artifacts.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'RUN2 Atlas',
    description: 'Routes, effort, pace, and training memory in one data-first running atlas.',
    url: 'https://run2.miaowu.org',
    siteName: 'RUN2 Atlas',
    images: [
      {
        url: '/brand/run2-social-card.png',
        width: 1200,
        height: 630,
        alt: 'RUN2 Atlas route intelligence social card',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RUN2 Atlas',
    description: 'Routes, effort, pace, and training memory in one data-first running atlas.',
    images: ['/brand/run2-social-card.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  )
}
