import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss'
import type { Selector, SelectorComponent, TransformOptions, Warning } from 'lightningcss'
import { Buffer } from 'node:buffer'
import { createInjectPreflight, internalCssSelectorReplacer } from '@weapp-tailwindcss/postcss'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { transform } from 'lightningcss'

type CustomAtRules = Record<string, never>

type SelectorListTransformer = (
  selectors: Selector[],
  ctx: SelectorTransformContext,
) => Selector[]

const textDecoder = new TextDecoder()
const defaultLightningFilename = 'inline.css'

export interface LightningcssStyleHandlerResult {
  code: string
  map?: string
  warnings: Warning[]
}

export interface LightningcssTransformConfig {
  filename?: string
  transformOptions?: Omit<TransformOptions<CustomAtRules>, 'filename' | 'code' | 'visitor'>
}

interface LightningcssStyleHandler {
  (rawSource: string, overrideOptions?: Partial<IStyleHandlerOptions>): Promise<LightningcssStyleHandlerResult>
}

interface SelectorTransformContext {
  options: IStyleHandlerOptions
  childCombinatorReplacement?: SelectorComponent[]
}

function getLightningDefaultOptions(options?: Partial<IStyleHandlerOptions>): Partial<IStyleHandlerOptions> {
  const customPropertiesFeature = options?.cssPresetEnv?.features?.['custom-properties']
  const shouldPreserveCustomProperties = customPropertiesFeature !== undefined
    ? customPropertiesFeature
    : options?.cssCalc
      ? { preserve: true }
      : false

  return {
    cssPresetEnv: {
      features: {
        'cascade-layers': true,
        'is-pseudo-class': {
          specificityMatchingName: 'weapp-tw-ig',
        },
        'oklab-function': true,
        'color-mix': true,
        'custom-properties': shouldPreserveCustomProperties,
      },
      autoprefixer: {
        add: false,
      },
    },
    cssRemoveProperty: true,
    cssRemoveHoverPseudoClass: true,
    cssChildCombinatorReplaceValue: ['view', 'text'],
    cssSelectorReplacement: {
      root: 'page',
      universal: ['view', 'text'],
    },
  }
}

function prepareStyleOptions(options?: Partial<IStyleHandlerOptions>): IStyleHandlerOptions {
  const merged = defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(
    options as IStyleHandlerOptions,
    getLightningDefaultOptions(options),
  )
  merged.cssInjectPreflight = createInjectPreflight(merged.cssPreflight)
  return merged
}

function createTypeSelector(name: string): SelectorComponent {
  return {
    type: 'type',
    name,
  }
}

function cloneComponent<T>(value: T): T {
  const structured = (globalThis as typeof globalThis & {
    structuredClone?: <U>(input: U) => U
  }).structuredClone
  if (typeof structured === 'function') {
    return structured(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function cloneComponents(list: SelectorComponent[]): SelectorComponent[] {
  return list.map(cloneComponent)
}

function normalizeNestedSelectors(
  selectors: Selector[] | Selector | null | undefined,
): Selector[] | undefined {
  if (!selectors) {
    return undefined
  }

  if (Array.isArray(selectors)) {
    if (selectors.length === 0) {
      return []
    }

    const first = selectors[0]
    if (Array.isArray(first)) {
      return selectors as Selector[]
    }

    return [selectors as Selector]
  }

  return [selectors]
}

function assignNestedSelectors(
  target: SelectorComponent & { selectors?: Selector[] | Selector | null },
  value: Selector[] | undefined,
) {
  if (!('selectors' in target)) {
    return
  }

  if (Array.isArray(target.selectors)) {
    target.selectors = value ?? []
  }
  else if (target.selectors && !Array.isArray(target.selectors)) {
    target.selectors = value?.[0] ?? target.selectors
  }
}

function trimCombinators(components: SelectorComponent[]): SelectorComponent[] {
  let start = 0
  let end = components.length
  while (start < end && components[start].type === 'combinator') {
    start++
  }
  while (end > start && components[end - 1].type === 'combinator') {
    end--
  }
  return components.slice(start, end)
}

function matchesHiddenNot(component: SelectorComponent | undefined): boolean {
  if (!component || component.type !== 'pseudo-class' || component.kind !== 'not') {
    return false
  }
  const selectors = normalizeNestedSelectors(component.selectors)
  if (!selectors || selectors.length !== 1) {
    return false
  }
  const [nestedSelector] = selectors
  if (nestedSelector.length !== 1) {
    return false
  }
  const [node] = nestedSelector
  return (
    (node.type === 'attribute' && node.name === 'hidden')
    || (node.type === 'type' && node.name === 'template')
  )
}

function buildSelectorReplacement(value: string | string[] | false | undefined): SelectorComponent[] | null {
  if (!value) {
    return null
  }

  const targets = Array.isArray(value) ? value : [value]
  if (!targets.length) {
    return null
  }

  if (targets.length === 1) {
    return [createTypeSelector(targets[0]!)]
  }

  return [
    {
      type: 'pseudo-class',
      kind: 'is',
      selectors: targets.map(name => [createTypeSelector(name)]),
    },
  ]
}

function buildChildCombinatorReplacement(options: IStyleHandlerOptions): SelectorComponent[] | undefined {
  const { cssChildCombinatorReplaceValue } = options
  if (!cssChildCombinatorReplaceValue) {
    return undefined
  }

  const normalized = Array.isArray(cssChildCombinatorReplaceValue)
    ? cssChildCombinatorReplaceValue
    : [cssChildCombinatorReplaceValue]

  if (!normalized.length) {
    return undefined
  }

  const baseComponents = buildSelectorReplacement(normalized) ?? [createTypeSelector('view')]
  const left = cloneComponents(baseComponents)
  const right = cloneComponents(baseComponents)

  return [
    ...left,
    {
      type: 'combinator',
      value: 'next-sibling',
    },
    ...right,
  ]
}

function transformSelectorComponent(
  component: SelectorComponent,
  ctx: SelectorTransformContext,
  transformList: SelectorListTransformer,
): SelectorComponent[] | null {
  const { options } = ctx

  if (component.type === 'class') {
    const cloned = cloneComponent(component)
    cloned.name = internalCssSelectorReplacer(component.name, {
      escapeMap: options.escapeMap,
      mangleContext: options.mangleContext,
    })
    return [cloned]
  }

  if (component.type === 'universal') {
    const replacement = buildSelectorReplacement(options.cssSelectorReplacement?.universal)
    if (replacement) {
      return cloneComponents(replacement)
    }
    return [cloneComponent(component)]
  }

  if (component.type === 'type') {
    if (options.uniAppX) {
      return []
    }
    return [cloneComponent(component)]
  }

  if (component.type === 'attribute') {
    if (options.uniAppX) {
      return []
    }
    return [cloneComponent(component)]
  }

  if (component.type === 'combinator') {
    return [cloneComponent(component)]
  }

  if (component.type === 'pseudo-element') {
    return [cloneComponent(component)]
  }

  if (component.type === 'pseudo-class') {
    if (component.kind === 'hover' && options.cssRemoveHoverPseudoClass) {
      return null
    }

    if (component.kind === 'root') {
      const replacement = buildSelectorReplacement(options.cssSelectorReplacement?.root)
      if (replacement) {
        return cloneComponents(replacement)
      }
      return [cloneComponent(component)]
    }

    const cloned = cloneComponent(component)

    if ('selectors' in cloned) {
      const nestedSelectors = normalizeNestedSelectors(cloned.selectors)
      if (nestedSelectors) {
        const transformedNested = transformList(nestedSelectors, ctx)
        assignNestedSelectors(cloned, transformedNested)
      }
    }

    if (cloned.kind === 'where' && options.uniAppX) {
      (cloned as SelectorComponent & { kind: typeof cloned.kind | 'is' }).kind = 'is'
    }

    return [cloned]
  }

  return [cloneComponent(component)]
}

function transformSelector(
  selector: Selector,
  ctx: SelectorTransformContext,
  transformList: SelectorListTransformer,
): Selector | null {
  const { childCombinatorReplacement } = ctx
  const output: SelectorComponent[] = []

  for (let index = 0; index < selector.length; index++) {
    const component = selector[index]

    if (component.type === 'combinator' && component.value === 'child' && childCombinatorReplacement) {
      const next = selector[index + 1]
      const combinator = selector[index + 2]
      const third = selector[index + 3]
      if (
        matchesHiddenNot(next)
        && combinator?.type === 'combinator'
        && (combinator.value === 'next-sibling' || combinator.value === 'later-sibling')
        && matchesHiddenNot(third)
      ) {
        output.push(cloneComponent(component))
        output.push(...cloneComponents(childCombinatorReplacement))
        index += 3
        continue
      }
    }

    const replaced = transformSelectorComponent(component, ctx, transformList)
    if (replaced === null) {
      return null
    }
    output.push(...replaced)
  }

  const trimmed = trimCombinators(output)
  return trimmed.length > 0 ? trimmed : null
}

function transformSelectorList(selectors: Selector[], ctx: SelectorTransformContext): Selector[] {
  const result: Selector[] = []
  for (const selector of selectors) {
    const transformed = transformSelector(selector, ctx, transformSelectorList)
    if (transformed && transformed.length > 0) {
      result.push(transformed)
    }
  }
  return result
}

function createVisitor(ctx: SelectorTransformContext) {
  const visitor: TransformOptions<CustomAtRules>['visitor'] = {
    Rule(rule) {
      if (rule.type === 'property' && ctx.options.cssRemoveProperty) {
        return []
      }

      if (rule.type !== 'style') {
        return rule
      }

      const styleRule = rule.value
      if (!styleRule.selectors) {
        return rule
      }

      const selectors = transformSelectorList(styleRule.selectors, ctx)
      if (!selectors.length) {
        return []
      }
      styleRule.selectors = selectors
      return rule
    },
    RuleExit(rule) {
      if (rule.type !== 'style') {
        return rule
      }
      const styleRule = rule.value

      const selectors = styleRule.selectors ?? []
      const hasValidSelectors = selectors.some(selector => selector.length > 0)

      const declarationCount = styleRule.declarations?.declarations?.length ?? 0
      if (!hasValidSelectors || (ctx.options.uniAppX && declarationCount === 0)) {
        return []
      }
      return rule
    },
  }

  return visitor
}

export function createLightningcssStyleHandler(
  options?: Partial<IStyleHandlerOptions>,
  config: LightningcssTransformConfig = {},
): LightningcssStyleHandler {
  const cachedOptions = prepareStyleOptions(options)
  const { transformOptions, filename } = config
  const transformOverrides = transformOptions ?? {}

  return async (rawSource, overrideOptions) => {
    const resolvedOptions = prepareStyleOptions(
      defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(
        overrideOptions as IStyleHandlerOptions,
        cachedOptions,
      ),
    )

    const ctx: SelectorTransformContext = {
      options: resolvedOptions,
      childCombinatorReplacement: buildChildCombinatorReplacement(resolvedOptions),
    }

    const visitor = createVisitor(ctx)
    const lightningResult = transform({
      filename: filename ?? defaultLightningFilename,
      code: Buffer.from(rawSource),
      visitor,
      minify: false,
      ...transformOverrides,
    })

    return {
      code: textDecoder.decode(lightningResult.code),
      map: lightningResult.map ? textDecoder.decode(lightningResult.map) : undefined,
      warnings: lightningResult.warnings,
    }
  }
}
