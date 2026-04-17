import type { NormalizedResetRule } from './normalize'
import type { ResetOptions, ResetPreset } from './types'
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

const DEFAULT_INPUT_RESET_SELECTORS = ['input'] as const
const DEFAULT_INPUT_DECLARATIONS = {
  padding: '0',
  fontSize: '100%',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  backgroundColor: 'transparent',
  borderWidth: '0',
} as const

const DEFAULT_TEXTAREA_RESET_SELECTORS = ['textarea'] as const
const DEFAULT_TEXTAREA_DECLARATIONS = {
  padding: '0',
  fontSize: '100%',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
  backgroundColor: 'transparent',
  borderWidth: '0',
  resize: 'vertical',
} as const

const DEFAULT_LIST_RESET_SELECTORS = ['ul', 'ol'] as const
const DEFAULT_LIST_DECLARATIONS = {
  listStyle: 'none',
  margin: '0',
  padding: '0',
} as const

const DEFAULT_NAVIGATOR_RESET_SELECTORS = ['navigator', 'a'] as const
const DEFAULT_NAVIGATOR_DECLARATIONS = {
  color: 'inherit',
  textDecoration: 'inherit',
} as const

const DEFAULT_VIDEO_RESET_SELECTORS = ['video'] as const
const DEFAULT_VIDEO_DECLARATIONS = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
} as const

const presetMap: Record<ResetPreset, Array<keyof PresetResolvedFlags>> = {
  minimal: ['buttonReset', 'imageReset'],
  form: ['buttonReset', 'imageReset', 'inputReset', 'textareaReset'],
  content: ['buttonReset', 'imageReset', 'listReset', 'navigatorReset'],
  media: ['buttonReset', 'imageReset', 'videoReset'],
  all: [
    'buttonReset',
    'imageReset',
    'inputReset',
    'textareaReset',
    'listReset',
    'navigatorReset',
    'videoReset',
  ],
}

interface PresetResolvedFlags {
  buttonReset: boolean
  imageReset: boolean
  inputReset: boolean
  textareaReset: boolean
  listReset: boolean
  navigatorReset: boolean
  videoReset: boolean
}

function resolvePresetFlags(options?: ResetOptions): PresetResolvedFlags {
  const resolved: PresetResolvedFlags = {
    buttonReset: true,
    imageReset: true,
    inputReset: false,
    textareaReset: false,
    listReset: false,
    navigatorReset: false,
    videoReset: false,
  }

  const presets = options?.preset
  if (!presets) {
    return resolved
  }

  const normalizedPresets = Array.isArray(presets) ? presets : [presets]
  for (const preset of normalizedPresets) {
    for (const key of presetMap[preset]) {
      resolved[key] = true
    }
  }
  return resolved
}

export const reset = plugin.withOptions<ResetOptions>(
  (options?: ResetOptions) => {
    const rules: NormalizedResetRule[] = []
    const enabledFlags = resolvePresetFlags(options)

    const builtInRules = [
      enabledFlags.buttonReset
        ? createResetRule(options?.buttonReset, {
            selectors: DEFAULT_BUTTON_RESET_SELECTORS,
            declarations: DEFAULT_BUTTON_DECLARATIONS,
            pseudo: BUTTON_RESET_PSEUDO_DECLARATIONS,
          })
        : undefined,
      enabledFlags.imageReset
        ? createResetRule(options?.imageReset, {
            selectors: DEFAULT_IMAGE_RESET_SELECTORS,
            declarations: DEFAULT_IMAGE_DECLARATIONS,
          })
        : undefined,
      enabledFlags.inputReset
        ? createResetRule(options?.inputReset, {
            selectors: DEFAULT_INPUT_RESET_SELECTORS,
            declarations: DEFAULT_INPUT_DECLARATIONS,
          })
        : undefined,
      enabledFlags.textareaReset
        ? createResetRule(options?.textareaReset, {
            selectors: DEFAULT_TEXTAREA_RESET_SELECTORS,
            declarations: DEFAULT_TEXTAREA_DECLARATIONS,
          })
        : undefined,
      enabledFlags.listReset
        ? createResetRule(options?.listReset, {
            selectors: DEFAULT_LIST_RESET_SELECTORS,
            declarations: DEFAULT_LIST_DECLARATIONS,
          })
        : undefined,
      enabledFlags.navigatorReset
        ? createResetRule(options?.navigatorReset, {
            selectors: DEFAULT_NAVIGATOR_RESET_SELECTORS,
            declarations: DEFAULT_NAVIGATOR_DECLARATIONS,
          })
        : undefined,
      enabledFlags.videoReset
        ? createResetRule(options?.videoReset, {
            selectors: DEFAULT_VIDEO_RESET_SELECTORS,
            declarations: DEFAULT_VIDEO_DECLARATIONS,
          })
        : undefined,
    ]

    for (const rule of builtInRules) {
      if (rule) {
        rules.push(rule)
      }
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

export type { ResetConfig, ResetOptions, ResetPreset } from './types'
export default reset
