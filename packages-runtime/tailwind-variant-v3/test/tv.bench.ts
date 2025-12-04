import { bench, describe } from 'vitest'

import { cn, defaultConfig, tv } from '../src/index'

const button = tv(
  {
    base: 'inline-flex items-center justify-center gap-2 font-medium transition-colors',
    slots: {
      icon: 'size-4 shrink-0',
      label: 'truncate',
    },
    variants: {
      tone: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
        ghost: 'bg-transparent text-zinc-900 hover:bg-zinc-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: {
          base: 'h-8 px-3 text-xs',
          icon: 'size-3.5',
        },
        md: {
          base: 'h-10 px-4 text-sm',
          icon: 'size-4',
        },
        lg: {
          base: 'h-12 px-6 text-base',
          icon: 'size-5',
        },
      },
      radius: {
        sharp: 'rounded-none',
        md: 'rounded-md',
        full: 'rounded-full',
      },
      state: {
        neutral: null,
        loading: 'pointer-events-none opacity-60',
        disabled: 'pointer-events-none opacity-40',
      },
    },
    defaultVariants: {
      radius: 'md',
      size: 'md',
      tone: 'primary',
      state: 'neutral',
    },
    compoundVariants: [
      {
        tone: 'ghost',
        state: 'disabled',
        class: 'opacity-70',
      },
      {
        tone: 'primary',
        state: 'loading',
        class: 'shadow-inner shadow-blue-900/40',
      },
      {
        tone: 'secondary',
        state: 'loading',
        class: 'shadow-inner shadow-zinc-950/50',
      },
    ],
    compoundSlots: [
      {
        slots: ['icon', 'label'],
        size: 'lg',
        class: 'tracking-tight',
      },
    ],
  },
  {
    responsiveVariants: ['sm', 'md', 'lg'],
  },
)

const cnRunner = cn(
  'flex items-center px-4 py-2 text-sm',
  ['text-base text-blue-500', undefined, 'md:text-lg'],
  ['hover:text-blue-600', 'active:scale-95', ['sm:text-xs', 'lg:text-lg']],
)

describe('tailwind-variant benchmarks', () => {
  bench(
    'tv base render',
    () => {
      button()
    },
    { time: 500 },
  )

  bench(
    'tv variants render',
    () => {
      button({
        tone: {
          initial: 'primary',
          sm: 'secondary',
          md: 'ghost',
        },
        radius: 'full',
        size: { initial: 'md', lg: 'lg' },
        state: 'loading',
      })
    },
    { time: 500 },
  )

  bench(
    'tv slots render',
    () => {
      const slots = button({ size: 'lg' })

      slots.base()
      slots.icon({ class: 'text-xl' })
      slots.label({ class: 'font-semibold' })
    },
    { time: 500 },
  )

  bench(
    'cn tailwind merge',
    () => {
      cnRunner(defaultConfig)
    },
    { time: 500 },
  )
})
