import { twMerge as mergeWeappV3 } from '@weapp-tailwindcss/merge-v3'

import { tv as tvWeappV3 } from '@weapp-tailwindcss/variants-v3'
import { twMerge as mergeV2 } from 'tailwind-merge'
import { tv as tvV3 } from 'tailwind-variant-v3'
import { tv as tvLegacy } from 'tailwind-variants'
import { bench, describe } from 'vitest'

type MergeFn = (...classLists: string[]) => string

const SAMPLE_CLASSES: string[] = [
  'flex flex-row items-center gap-2 px-3 py-2',
  'text-sm font-medium text-gray-900 dark:text-gray-50',
  'bg-white/80 dark:bg-black/20 border border-gray-200/80 dark:border-white/10',
  'shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-sky-500',
  'rounded-lg md:rounded-xl transition-colors duration-200',
]

function benchTwMerge(fn: MergeFn) {
  for (const sample of SAMPLE_CLASSES) {
    fn(sample, 'text-sky-600', 'md:text-sky-700', 'hover:underline')
  }
}

const badgeOptions = {
  base: 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
  variants: {
    tone: {
      neutral: 'bg-gray-100 text-gray-800',
      info: 'bg-sky-100 text-sky-800',
      success: 'bg-emerald-100 text-emerald-800',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
} as const

const badgeLegacy = tvLegacy(badgeOptions)
const badgeV3 = tvV3(badgeOptions)
const badgeWeappV3 = tvWeappV3(badgeOptions)
const benchOptions = { time: 300 }

describe('tailwindcss v3 merge benchmarks', () => {
  bench('tailwind-merge v2', () => benchTwMerge(mergeV2), benchOptions)
  bench('@weapp-tailwindcss/merge-v3', () => benchTwMerge(mergeWeappV3), benchOptions)
})

describe('tailwindcss v3 variants benchmarks', () => {
  bench(
    'tailwind-variants 0.x',
    () => {
      badgeLegacy({ tone: 'info' })
    },
    benchOptions,
  )
  bench(
    'tailwind-variant-v3 (upstream compat)',
    () => {
      badgeV3({ tone: 'info' })
    },
    benchOptions,
  )
  bench(
    '@weapp-tailwindcss/variants-v3',
    () => {
      badgeWeappV3({ tone: 'info' })
    },
    benchOptions,
  )
})
