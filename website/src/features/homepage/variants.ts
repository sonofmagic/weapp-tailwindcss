import { tv } from 'tailwind-variants'

export const ctaButton = tv({
  base: [
    'relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3',
    'font-semibold text-slate-900 dark:text-slate-900',
    'bg-[linear-gradient(120deg,#7dd3fc_0%,#34d399_100%)]',
    'shadow-[0_16px_30px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]',
    'transition-all duration-[400ms] ease-out',
    'hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(14,165,233,0.4),inset_0_1px_0_rgba(255,255,255,0.45)]',
    'no-underline hover:no-underline focus-visible:no-underline visited:text-slate-900 dark:visited:text-slate-900',
    'hover:text-slate-900 dark:hover:text-slate-900',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
  ].join(' '),
})

export const interactionPill = tv({
  base: [
    'inline-flex w-full rounded-full sm:w-auto',
    'bg-[linear-gradient(120deg,rgba(255,255,255,0.75),rgba(226,232,240,0.5))]',
    'shadow-[0_18px_40px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.55)]',
    'backdrop-blur-[12px]',
    'transition-all duration-[400ms] ease-out',
    'hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(14,165,233,0.18),inset_0_1px_0_rgba(255,255,255,0.6)]',
    'dark:bg-[linear-gradient(120deg,rgba(15,23,42,0.7),rgba(30,41,59,0.55))]',
    'dark:shadow-[0_18px_40px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]',
    'dark:hover:shadow-[0_22px_45px_rgba(14,165,233,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]',
  ].join(' '),
})

export const interactionPillLink = tv({
  base: [
    'group inline-flex w-full items-center justify-between gap-2.5 px-3 py-2 sm:w-auto sm:justify-start',
    'text-[0.95rem] font-semibold tracking-[0.01em]',
    'text-slate-600 transition-colors duration-300',
    'hover:text-slate-900',
    'dark:text-slate-200 dark:hover:text-slate-50',
  ].join(' '),
})

export const interactionPillIcon = tv({
  base: [
    'inline-flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-full',
    'bg-sky-500/15 text-sky-500',
    'transition-[background,color] duration-300',
    'group-hover:bg-sky-500/35 group-hover:text-white',
    'dark:bg-sky-500/20 dark:text-sky-200',
    'dark:group-hover:bg-sky-400/35 dark:group-hover:text-white',
  ].join(' '),
})

export const interactionPillLabel = tv({
  base: 'whitespace-nowrap',
})

export const featureCard = tv({
  base: [
    'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/35',
    'bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(241,245,249,0.66))]',
    'p-[clamp(1.25rem,2.2vw,2rem)]',
    'shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur-[18px]',
    'transition-all duration-[600ms] ease-[cubic-bezier(0.21,0.72,0.28,0.99)]',
    'hover:-translate-y-1.5 hover:scale-[1.01]',
    'hover:shadow-[0_30px_80px_rgba(14,165,233,0.25),0_20px_40px_rgba(15,23,42,0.18)]',
    'dark:border-slate-600/25',
    'dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.84),rgba(30,41,59,0.7))]',
  ].join(' '),
  variants: {
    variant: {
      tools: 'items-center gap-5 text-center',
      versions: 'justify-between gap-4',
      frameworks: 'gap-5',
    },
  },
})

export const featureCardHeader = tv({
  base: 'mb-5 flex flex-col gap-1.5 text-left',
  variants: {
    variant: {
      centered: 'mb-5 items-center text-center',
    },
  },
})

export const featureCardEyebrow = tv({
  base: `
    text-xs font-semibold uppercase tracking-[0.3em] text-sky-400
    dark:text-sky-300
  `,
})

export const featureCardTitle = tv({
  base: `
    text-[clamp(1.2rem,1.4vw,1.45rem)] font-semibold text-slate-800
    dark:text-slate-100
  `,
})

export const featureCardSubtitle = tv({
  base: `
    text-sm text-slate-600
    dark:text-slate-300
  `,
})

export const toolOrbit = tv({
  base: [
    'relative grid place-items-center text-slate-700',
    'w-[clamp(170px,22vw,200px)] h-[clamp(170px,22vw,200px)]',
    'md:w-[clamp(190px,25vw,220px)] md:h-[clamp(190px,25vw,220px)]',
    'my-1 md:my-2',
  ].join(' '),
})

export const toolOrbitRing = tv({
  base: `
    absolute inset-0 rounded-full border border-dashed border-slate-300/35
    shadow-[inset_0_0_30px_rgba(148,163,184,0.12)]
  `,
  variants: {
    variant: {
      inner: `
        inset-[30%] border-solid border-sky-300/35
        shadow-[inset_0_0_40px_rgba(14,165,233,0.14)]
        md:inset-[24%]
      `,
    },
  },
})

export const toolOrbitCore = tv({
  base: [
    'relative z-10 grid place-items-center rounded-full text-[0.8rem] font-semibold uppercase tracking-[0.15em]',
    'w-[clamp(68px,9vw,86px)] h-[clamp(68px,9vw,86px)]',
    'md:w-[clamp(94px,12vw,110px)] md:h-[clamp(94px,12vw,110px)]',
    'bg-[linear-gradient(145deg,rgba(14,165,233,0.18),rgba(14,165,233,0.32))]',
    'shadow-[0_15px_45px_rgba(14,165,233,0.25),inset_0_1px_0_rgba(255,255,255,0.45)]',
    'text-slate-800 dark:text-slate-100',
    'dark:bg-[linear-gradient(145deg,rgba(14,165,233,0.28),rgba(14,165,233,0.45))]',
  ].join(' '),
})

export const toolOrbitItem = tv({
  base: [
    'absolute z-10 flex flex-col items-center gap-1 rounded-2xl px-2.5 py-2 text-center',
    'w-[clamp(60px,9vw,78px)] md:w-[clamp(66px,8vw,82px)] md:px-3 md:py-2.5',
    'bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.45)]',
    'backdrop-blur-[16px]',
    'dark:bg-slate-800/70 dark:shadow-[0_12px_30px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]',
  ].join(' '),
  variants: {
    placement: {
      webpack: `
        left-1/2 top-0 -translate-x-1/2 -translate-y-[58%]
        sm:-translate-y-[52%]
      `,
      vite: `
        right-[-4%] top-1/2 -translate-y-1/2 translate-x-[52%]
        sm:right-[-2%] sm:translate-x-[48%]
      `,
      gulp: `
        bottom-[-4%] left-1/2 -translate-x-1/2 translate-y-[50%]
        sm:bottom-[-2%] sm:translate-y-[44%]
      `,
      node: `
        left-[-4%] top-1/2 -translate-x-[52%] -translate-y-1/2
        sm:left-[-2%] sm:-translate-x-[48%]
      `,
    },
  },
})

export const toolOrbitLabel = tv({
  base: `
    text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-700
    dark:text-slate-200
  `,
})

export const versionsStack = tv({
  base: 'relative flex flex-col items-center gap-5',
})

export const versionsStackHalo = tv({
  base: [
    'pointer-events-none absolute left-[-10%] right-[-10%] top-[-8%] bottom-[58%] -z-10',
    'bg-[radial-gradient(circle,rgba(14,165,233,0.22),transparent_65%)]',
    'opacity-50 blur-[42px]',
    'dark:bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_65%)]',
  ].join(' '),
})

export const versionsStackLogo = tv({
  base: `
    w-[clamp(180px,26vw,220px)] drop-shadow-[0_16px_32px_rgba(56,189,248,0.18)]
  `,
})

export const versionsStackTimeline = tv({
  base: 'relative flex w-full flex-col gap-3.5',
})

export const versionsPill = tv({
  base: [
    'flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky-300/25 px-4 py-3 sm:flex-nowrap sm:gap-6',
    'bg-[linear-gradient(135deg,rgba(244,250,255,0.75),rgba(186,230,253,0.4))]',
    'shadow-[0_12px_26px_rgba(14,165,233,0.12),inset_0_1px_0_rgba(255,255,255,0.5)]',
    'backdrop-blur-[12px]',
    'transition-all duration-[400ms] ease-out',
    'hover:-translate-y-0.5 hover:border-sky-300/45',
    'hover:shadow-[0_16px_32px_rgba(14,165,233,0.18),inset_0_1px_0_rgba(255,255,255,0.6)]',
    'dark:border-slate-500/30',
    'dark:bg-[linear-gradient(135deg,rgba(30,41,59,0.8),rgba(51,65,85,0.65))]',
    'dark:hover:border-sky-300/45',
    'dark:hover:shadow-[0_16px_32px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.16)]',
  ].join(' '),
})

export const versionsPillLabel = tv({
  base: `
    flex-1 text-left text-[0.95rem] font-semibold text-slate-800
    sm:text-base
    dark:text-slate-100
  `,
})

export const versionsPillCta = tv({
  base: `
    text-[0.8rem] font-medium uppercase tracking-[0.12em] text-sky-400
    sm:text-xs
    dark:text-sky-300
  `,
})

export const frameworkGrid = tv({
  base: `
    grid grid-cols-1 gap-3
    sm:grid-cols-2 sm:gap-4
    lg:grid-cols-2 lg:gap-6
  `,
})

export const frameworkCard = tv({
  base: [
    'group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/40',
    'bg-white/65 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.45)]',
    'backdrop-blur-[12px] transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(14,165,233,0.18)]',
    'dark:border-slate-600/25 dark:bg-slate-800/65 dark:shadow-[0_12px_28px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]',
  ].join(' '),
})

export const frameworkIcon = tv({
  base: [
    'flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14',
    'bg-white shadow-[0_10px_20px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.65)]',
    'dark:bg-slate-900/80 dark:shadow-[0_10px_20px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]',
  ].join(' '),
})

export const frameworkIconImage = tv({
  base: `
    size-8 object-contain
    sm:size-10
  `,
})

export const frameworkLabel = tv({
  base: `
    text-sm font-semibold uppercase tracking-[0.08em] text-slate-800
    dark:text-slate-100
  `,
})

export const frameworkDescription = tv({
  base: `
    text-xs text-slate-500
    dark:text-slate-300
  `,
})
