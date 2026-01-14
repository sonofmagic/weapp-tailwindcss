import type { NormalizedResetRule } from './normalize'
import type { ResetOptions } from './types'
import plugin from 'tailwindcss/plugin'
import { createResetRule } from './normalize'

const DEFAULT_BUTTON_RESET_SELECTORS = ['button'] as const
const DEFAULT_BUTTON_DECLARATIONS = {
  padding: '0',
  backgroundColor: 'transparent',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  borderWidth: '0',
} as const
const BUTTON_RESET_PSEUDO_DECLARATIONS = {
  border: 'none',
} as const

const DEFAULT_IMAGE_RESET_SELECTORS = ['image', 'img'] as const
const DEFAULT_IMAGE_DECLARATIONS = {
  display: 'block',
  borderWidth: '0',
  backgroundColor: 'transparent',
  maxWidth: '100%',
  height: 'auto',
} as const

export const reset = plugin.withOptions<ResetOptions>(
  (options?: ResetOptions) => {
    const rules: NormalizedResetRule[] = []
    const buttonRule = createResetRule(options?.buttonReset, {
      selectors: DEFAULT_BUTTON_RESET_SELECTORS,
      declarations: DEFAULT_BUTTON_DECLARATIONS,
      pseudo: BUTTON_RESET_PSEUDO_DECLARATIONS,
    })
    if (buttonRule) {
      rules.push(buttonRule)
    }
    const imageRule = createResetRule(options?.imageReset, {
      selectors: DEFAULT_IMAGE_RESET_SELECTORS,
      declarations: DEFAULT_IMAGE_DECLARATIONS,
    })
    if (imageRule) {
      rules.push(imageRule)
    }
    for (const extra of options?.extraResets ?? []) {
      const normalized = createResetRule(extra, {
        selectors: extra.selectors ?? [],
        declarations: {},
      })
      if (normalized) {
        rules.push(normalized)
      }
    }

    return ({ addBase }) => {
      if (!rules.length) {
        return
      }
      const baseRules: Record<string, Record<string, string>> = {}
      for (const rule of rules) {
        baseRules[rule.selectors.join(',')] = rule.declarations
        if (rule.pseudo) {
          const pseudoSelectors = rule.selectors.map(selector => `${selector}::after`).join(',')
          baseRules[pseudoSelectors] = rule.pseudo
        }
      }
      addBase(baseRules)
    }
  },
  () => {
    return {}
  },
)

export default reset
