import type { MutationRoundConfig } from '../types'

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

export function buildHexArbitraryClassTokens(seed: string) {
  const numericSeed = seed.replace(/\D/g, '').padEnd(8, '0')
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

export function resolveMutationRoundConfigs(): MutationRoundConfig[] {
  return [
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
  ]
}
