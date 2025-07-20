import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { CyberAppLayout } from '@/components/CyberAppLayout'

import '@/app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s - Running Page 2.0',
    default: 'Running Page 2.0 - Cyberpunk Running Data Visualization',
  },
  description:
    'A cyberpunk-styled running data visualization platform with comprehensive analytics, interactive maps, and beautiful neon charts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx('h-full antialiased dark', inter.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-cyber-950 text-white">
        <Providers>
          <div className="relative w-full min-h-screen">
            {/* 背景效果 */}
            <div className="fixed inset-0 pointer-events-none">
              {/* 渐变背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-950 via-cyber-900 to-cyber-950" />
              
              {/* 网格背景 */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px'
                }}
              />
              
              {/* 扫描线效果 */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(34, 211, 238, 0.1) 2px,
                    rgba(34, 211, 238, 0.1) 4px
                  )`
                }}
              />
              
              {/* 光晕效果 */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-neonCyan-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neonPink-500/10 rounded-full blur-3xl" />
            </div>
            
            {/* 主要内容 */}
            <div className="relative z-10">
              <CyberAppLayout>{children}</CyberAppLayout>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
