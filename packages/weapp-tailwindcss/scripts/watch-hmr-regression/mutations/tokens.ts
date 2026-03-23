import type { MutationRoundConfig } from '../types'
import process from 'node:process'

export const ISSUE33_ADD_CLASS_TOKENS = [
  'bg-[#000]',
  'px-[432.43px]',
  'w-[calc(100%_-_12px)]',
  'bg-[rgb(12,34,56)]',
  'bg-[var(--primary-color-hex)]',
  'text-[14px]',
] as const
export const ISSUE33_MODIFY_CLASS_TOKENS = [
  'bg-[#0f0]',
  'px-[256.25px]',
  'w-[calc(100%_-_24px)]',
  'bg-[rgb(98,12,45)]',
  'bg-[var(--primary-color-bg)]',
  'text-[22px]',
] as const

export function buildBaselineArbitraryClassTokens(seed: string) {
  const opacitySeed = seed.slice(0, 2)
  const decimalSeed = seed.slice(-1)

  return [
    `text-[23.${seed}px]`,
    'space-y-2.5',
    `w-[calc(100%_-_${seed}px)]`,
    `grid-cols-[200rpx_minmax(900rpx,_1fr)_${seed}px]`,
    `after:ml-[0.${seed}px]`,
    `text-black/[0.${opacitySeed}]`,
    `ring-[1.${decimalSeed}px]`,
  ]
}

export function buildComplexCorpusClassTokens(seed: string) {
  return [
    ...buildBaselineArbitraryClassTokens(seed),
    '!mt-2',
    '-translate-y-1',
    'max-[712px]:p-[13px]',
    'bg-[rgb(12,34,56)]',
    'grid-rows-[auto_minmax(0,_1fr)]',
    'group-[:nth-of-type(3)_&]:block',
    '[@supports(display:grid)]:grid',
    'supports-[backdrop-filter:blur(2px)]:backdrop-blur-[2px]',
    '[@media(any-hover:hover){&:hover}]:opacity-100',
    'data-[state=open]:opacity-100',
    'supports-[display:grid]:grid',
    '[mask-type:luminance]',
    `[--watch-hmr-offset:${seed}px]`,
  ]
}

const NON_DIGIT_RE = /\D/g

export function buildHexArbitraryClassTokens(seed: string) {
  const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(8, '0')
  const hex6 = numericSeed.slice(0, 6)
  const hex4 = `${numericSeed.slice(0, 2)}00`
  const ringPx = Number(numericSeed.slice(2, 4)) + 1
  const spacePx = Number(numericSeed.slice(4, 6)) + 8

  return [
    `bg-[#${hex4}]`,
    `text-[${Number(numericSeed.slice(0, 2)) + 28}px]`,
    `h-[${Number(numericSeed.slice(2, 4)) + 16}px]`,
    `ring-[${ringPx}.5px]`,
    `shadow-[0_${spacePx}px_${spacePx + 2}px_#${hex6}]`,
  ]
}

export function buildIssue33ArbitraryClassTokens() {
  return [...ISSUE33_ADD_CLASS_TOKENS]
}

export function isIssue33RoundEnabled() {
  return process.env.E2E_WATCH_ROUND_PROFILE === 'issue33'
}

export function appendIssue33RoundConfig(rounds: MutationRoundConfig[]) {
  if (!isIssue33RoundEnabled()) {
    return rounds
  }
  return [
    ...rounds,
    {
      name: 'issue33-arbitrary',
      buildClassTokens: buildIssue33ArbitraryClassTokens,
    },
  ]
}

export function resolveMutationRoundConfigs(): MutationRoundConfig[] {
  return appendIssue33RoundConfig([
    {
      name: 'baseline-arbitrary',
      buildClassTokens: buildBaselineArbitraryClassTokens,
    },
    {
      name: 'complex-corpus',
      buildClassTokens: buildComplexCorpusClassTokens,
    },
    {
      name: 'hex-arbitrary',
      buildClassTokens: buildHexArbitraryClassTokens,
    },
  ])
}
