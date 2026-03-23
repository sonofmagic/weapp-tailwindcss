import {
  isIssue33RoundEnabled,
  ISSUE33_ADD_CLASS_TOKENS,
  ISSUE33_MODIFY_CLASS_TOKENS,
} from '../mutations/tokens'

const NON_DIGIT_RE = /\D/g

export function buildHexScriptRoundConfigs() {
  const rounds = [
    {
      name: 'baseline-arbitrary' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(6, '0')
        const hex = numericSeed.slice(0, 6)
        const textPx = Number(numericSeed.slice(0, 2)) + 20
        const heightPx = Number(numericSeed.slice(2, 4)) + 12
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
    {
      name: 'complex-corpus' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(6, '0')
        const hex = numericSeed.slice(0, 4)
        const textPx = Number(numericSeed.slice(0, 2)) + 34
        const heightPx = Number(numericSeed.slice(2, 4)) + 22
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
    {
      name: 'hex-arbitrary' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(8, '0')
        const hex = `${numericSeed.slice(0, 2)}00`
        const textPx = Number(numericSeed.slice(0, 2)) + 46
        const heightPx = Number(numericSeed.slice(2, 4)) + 28
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
  ]

  if (!isIssue33RoundEnabled()) {
    return rounds
  }

  return [
    ...rounds,
    {
      name: 'issue33-arbitrary' as const,
      buildClassTokens() {
        return [...ISSUE33_ADD_CLASS_TOKENS]
      },
    },
  ]
}

export function buildIssue33ScriptRoundConfigs() {
  return [
    {
      name: 'issue33-arbitrary' as const,
      buildClassTokens() {
        return [...ISSUE33_ADD_CLASS_TOKENS]
      },
    },
  ]
}

export function buildIssue33HighRiskRoundConfigs() {
  return [
    {
      name: 'issue33-arbitrary' as const,
      buildClassTokens() {
        return [...ISSUE33_ADD_CLASS_TOKENS]
      },
      buildModifyClassTokens() {
        return [...ISSUE33_MODIFY_CLASS_TOKENS]
      },
    },
  ]
}
