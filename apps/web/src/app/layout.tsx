import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { CatalystAppLayout } from '@/components/CatalystAppLayout'

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
      <body className="flex min-h-full bg-white dark:bg-zinc-900">
        <Providers>
          <CatalystAppLayout>{children}</CatalystAppLayout>
        </Providers>
      </body>
    </html>
  )
}
