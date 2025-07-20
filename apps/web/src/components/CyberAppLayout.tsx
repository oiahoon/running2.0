'use client'

import React from 'react'
import { CyberNavigationLayout } from './ui/CyberNavigation'

export function CyberAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CyberNavigationLayout>
      {children}
    </CyberNavigationLayout>
  )
}
