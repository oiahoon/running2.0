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
      stretch: {
        id: 'seira-fuwa-stretch',
        src: '/assets/runners/seira-fuwa-stretch.png',
        role: 'recovery-stretch-cameo',
      },
      lifestyle: {
        id: 'seira-fuwa-lifestyle',
        src: '/assets/runners/seira-fuwa-lifestyle.png',
        role: 'recovery-walk-cameo',
      },
      pose: {
        id: 'seira-fuwa-pose',
        src: '/assets/runners/seira-fuwa-pose.png',
        role: 'finish-pose-cameo',
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
      run: {
        id: 'shieri-drury-run',
        src: '/assets/runners/shieri-drury-run.png',
        role: 'high-knee-cameo',
      },
      lifestyle: {
        id: 'shieri-drury-lifestyle',
        src: '/assets/runners/shieri-drury-lifestyle.png',
        role: 'shoelace-cameo',
      },
      pose: {
        id: 'shieri-drury-pose',
        src: '/assets/runners/shieri-drury-pose.png',
        role: 'route-presenter-cameo',
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
      run: {
        id: 'sayaka-sato-run',
        src: '/assets/runners/sayaka-sato-run.png',
        role: 'steady-run-cameo',
      },
      stretch: {
        id: 'sayaka-sato-stretch',
        src: '/assets/runners/sayaka-sato-stretch.png',
        role: 'calf-stretch-cameo',
      },
      pose: {
        id: 'sayaka-sato-pose',
        src: '/assets/runners/sayaka-sato-pose.png',
        role: 'pre-race-pose-cameo',
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
      run: {
        id: 'nozomi-tanaka-run',
        src: '/assets/runners/nozomi-tanaka-run.png',
        role: 'finish-kick-cameo',
      },
      stretch: {
        id: 'nozomi-tanaka-stretch',
        src: '/assets/runners/nozomi-tanaka-stretch.png',
        role: 'lunge-stretch-cameo',
      },
      lifestyle: {
        id: 'nozomi-tanaka-lifestyle',
        src: '/assets/runners/nozomi-tanaka-lifestyle.png',
        role: 'water-bottle-cameo',
      },
    },
  },
} as const

export const runnerMuseCameos = {
  dashboardHero: runnerMuses.seiraFuwa.variants.stride,
  dashboardShortcutLead: runnerMuses.shieriDrury.variants.lifestyle,
  posterLab: runnerMuses.sayakaSato.variants.pose,
  posterSignature: runnerMuses.nozomiTanaka.variants.wave,
  shortcutStrip: [
    runnerMuses.shieriDrury.variants.pose,
    runnerMuses.sayakaSato.variants.watch,
    runnerMuses.nozomiTanaka.variants.lifestyle,
    runnerMuses.seiraFuwa.variants.pose,
  ],
} as const

export const runnerPosterBackgrounds = {
  run: [
    runnerMuses.seiraFuwa.variants.stride,
    runnerMuses.seiraFuwa.variants.run,
    runnerMuses.shieriDrury.variants.run,
    runnerMuses.sayakaSato.variants.run,
    runnerMuses.nozomiTanaka.variants.run,
  ],
  walk: [
    runnerMuses.seiraFuwa.variants.stretch,
    runnerMuses.seiraFuwa.variants.lifestyle,
    runnerMuses.seiraFuwa.variants.pose,
    runnerMuses.nozomiTanaka.variants.wave,
    runnerMuses.nozomiTanaka.variants.stretch,
    runnerMuses.nozomiTanaka.variants.lifestyle,
    runnerMuses.shieriDrury.variants.stretch,
    runnerMuses.shieriDrury.variants.lifestyle,
    runnerMuses.shieriDrury.variants.pose,
    runnerMuses.sayakaSato.variants.watch,
    runnerMuses.sayakaSato.variants.stretch,
    runnerMuses.sayakaSato.variants.pose,
  ],
} as const
