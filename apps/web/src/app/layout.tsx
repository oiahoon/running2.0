import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { AppLayout } from '@/components/AppLayout'

import '@/app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s - Running Page 2.0',
    default: 'Running Page 2.0 - Personal Running Data Visualization',
  },
  description:
    'A modern running data visualization platform with comprehensive analytics, interactive maps, and beautiful charts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx('h-full antialiased', inter.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-gray-50 dark:bg-gray-900">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  )
}
