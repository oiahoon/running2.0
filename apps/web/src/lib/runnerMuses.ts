export const runnerMuses = {
  seiraFuwa: {
    name: 'Seira Fuwa',
    sourceName: '不破聖衣来',
    src: '/assets/runners/seira-fuwa-runner.png',
    variants: {
      run: {
        id: 'seira-fuwa-run',
        src: '/assets/runners/seira-fuwa-runner.png',
        role: 'hero-running-cameo',
      },
      stride: {
        id: 'seira-fuwa-stride',
        src: '/assets/runners/seira-fuwa-stride.png',
        role: 'hero-floating-stride',
      },
    },
  },
  shieriDrury: {
    name: 'Shieri Drury',
    sourceName: 'ドルーリー朱瑛里',
    src: '/assets/runners/shieri-drury-stretch.png',
    variants: {
      stretch: {
        id: 'shieri-drury-stretch',
        src: '/assets/runners/shieri-drury-stretch.png',
        role: 'sidebar-warmup-cameo',
      },
    },
  },
  sayakaSato: {
    name: 'Sayaka Sato',
    sourceName: '佐藤早也伽',
    src: '/assets/runners/sayaka-sato-watch.png',
    variants: {
      watch: {
        id: 'sayaka-sato-watch',
        src: '/assets/runners/sayaka-sato-watch.png',
        role: 'poster-lab-cameo',
      },
    },
  },
  nozomiTanaka: {
    name: 'Nozomi Tanaka',
    sourceName: '田中希実',
    src: '/assets/runners/nozomi-tanaka-wave.png',
    variants: {
      wave: {
        id: 'nozomi-tanaka-wave',
        src: '/assets/runners/nozomi-tanaka-wave.png',
        role: 'poster-signature-cameo',
      },
    },
  },
} as const

export const runnerMuseCameos = {
  dashboardHero: runnerMuses.seiraFuwa.variants.stride,
  dashboardShortcutLead: runnerMuses.shieriDrury.variants.stretch,
  posterLab: runnerMuses.sayakaSato.variants.watch,
  posterSignature: runnerMuses.nozomiTanaka.variants.wave,
  shortcutStrip: [
    runnerMuses.sayakaSato.variants.watch,
    runnerMuses.nozomiTanaka.variants.wave,
    runnerMuses.seiraFuwa.variants.run,
  ],
} as const

export const runnerPosterBackgrounds = {
  run: [
    runnerMuses.seiraFuwa.variants.stride,
    runnerMuses.seiraFuwa.variants.run,
    runnerMuses.sayakaSato.variants.watch,
  ],
  walk: [
    runnerMuses.nozomiTanaka.variants.wave,
    runnerMuses.shieriDrury.variants.stretch,
    runnerMuses.sayakaSato.variants.watch,
  ],
} as const
