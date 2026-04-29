import { type Metadata } from 'next'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { AppLayout } from '@/components/AppLayout'

import '@/app/globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

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
      className={clsx('h-full antialiased', manrope.variable, jetbrainsMono.variable)}
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
