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
  title: {
    template: '%s - Running Page 2.0',
    default: 'Running Page 2.0',
  },
  description:
    'A premium running intelligence workspace with analytics, maps, and training operations.',
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
      <body className="min-h-full bg-[#070d1a] text-gray-100">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  )
}
