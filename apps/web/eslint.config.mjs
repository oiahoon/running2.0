import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/app/activities/CyberActivities.tsx',
      'src/components/CatalystAppLayout.tsx',
      'src/components/CyberAppLayout.tsx',
      'src/components/DocsLayout.tsx',
      'src/components/Layout.tsx',
      'src/components/MobileNavigation.tsx',
      'src/components/TableOfContents.tsx',
      'src/components/charts/**',
      'src/components/catalyst/**',
      'src/components/ui/**',
      'src/lib/sections.ts',
    ],
  },
]

export default config
