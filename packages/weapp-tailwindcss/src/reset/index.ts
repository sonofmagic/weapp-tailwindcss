import plugin from 'tailwindcss/plugin'

export interface ResetOptions {
  /**
   * 控制 `button` reset 的注入与选择器，传入 `false` 可跳过该规则。
   */
  buttonReset?: false | ResetConfig
  /**
   * 控制 `image` reset（同时覆盖 `<image>` 与 `<img>`）。
   */
  imageReset?: false | ResetConfig
  /**
   * 额外的 reset 规则，可根据业务自定义。
   */
  extraResets?: ResetConfig[]
}

export interface ResetConfig {
  selectors?: string[]
  declarations?: Record<string, string | number | false | null | undefined>
  pseudo?: Record<string, string | number | false | null | undefined>
}

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

type DeclValue = string | number | false | null | undefined

function normalizeResetSelectors(option: ResetConfig | undefined, defaults: readonly string[]) {
  const resolved = option?.selectors?.length ? option.selectors : defaults
  const normalized: string[] = []
  for (const selector of resolved) {
    const trimmed = selector.trim()
    if (!trimmed || normalized.includes(trimmed)) {
      continue
    }
    normalized.push(trimmed)
  }
  return normalized.length ? normalized : undefined
}

function convertSelectorForBase(selector: string) {
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    if (className.length > 0) {
      return `[class~="${className}"]`
    }
  }
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    if (id.length > 0) {
      return `[id="${id}"]`
    }
  }
  return selector
}

function normalizeDeclarations(
  option: ResetConfig | undefined,
  defaults: Record<string, string>,
) {
  const normalized: Record<string, string> = { ...defaults }
  const overrides = option?.declarations
  if (!overrides) {
    return normalized
  }

  const entries = Object.entries(overrides)
  for (const [prop, value] of entries) {
    const resolved = normalizeDeclarationValue(value)
    if (resolved === undefined) {
      delete normalized[prop]
    }
    else {
      normalized[prop] = resolved
    }
  }

  return normalized
}

function normalizePseudo(option: ResetConfig | undefined, defaults?: Record<string, string>) {
  const normalized: Record<string, string> = defaults ? { ...defaults } : {}
  const overrides = option?.pseudo
  if (!overrides) {
    return Object.keys(normalized).length ? normalized : undefined
  }

  const entries = Object.entries(overrides)
  for (const [prop, value] of entries) {
    const resolved = normalizeDeclarationValue(value)
    if (resolved === undefined) {
      delete normalized[prop]
    }
    else {
      normalized[prop] = resolved
    }
  }
  return Object.keys(normalized).length ? normalized : undefined
}

function normalizeDeclarationValue(value: DeclValue) {
  if (value === false || value === null || value === undefined) {
    return undefined
  }
  return typeof value === 'number' ? value.toString() : value
}

interface NormalizedResetRule {
  selectors: string[]
  declarations: Record<string, string>
  pseudo?: Record<string, string>
}

function createResetRule(
  option: ResetConfig | undefined | false,
  defaults: {
    selectors: readonly string[]
    declarations: Record<string, string>
    pseudo?: Record<string, string>
  },
): NormalizedResetRule | undefined {
  if (option === false) {
    return undefined
  }
  const selectors = normalizeResetSelectors(option, defaults.selectors)
  if (!selectors) {
    return undefined
  }
  const declarations = normalizeDeclarations(option ?? {}, defaults.declarations)
  if (Object.keys(declarations).length === 0) {
    return undefined
  }
  const pseudo = normalizePseudo(option ?? {}, defaults.pseudo)
  return {
    selectors: selectors.map(convertSelectorForBase),
    declarations,
    pseudo,
  }
}

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
