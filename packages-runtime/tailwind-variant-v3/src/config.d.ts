import type { TVGeneratedScreens } from './generated'
import type { TVVariants } from './types'

interface MergeConfig {
  [key: string]: any
  cacheSize?: number
  classGroups?: Record<string, any>
  conflictingClassGroupModifiers?: Record<string, any>
  conflictingClassGroups?: Record<string, any>
  extend?: Record<string, any>
  override?: Record<string, any>
  prefix?: string
  separator?: string
  theme?: Record<string, any>
}

interface LegacyMergeConfig {
  extend?: Record<string, any>
}

export interface TailwindMergeAdapter {
  twMerge: (className: string) => string
  extendTailwindMerge?: (config: MergeConfig & LegacyMergeConfig) => (className: string) => string
}

export interface TWMConfig {
  /**
   * Whether to merge the class names with `tailwind-merge` library.
   * It's avoid to have duplicate tailwind classes. (Recommended)
   * @see https://github.com/dcastil/tailwind-merge/blob/v2.2.0/README.md
   * @default true
   */
  twMerge?: boolean
  /**
   * The config object for `tailwind-merge` library.
   * @see https://github.com/dcastil/tailwind-merge/blob/v2.2.0/docs/configuration.md
   */
  twMergeConfig?: MergeConfig & LegacyMergeConfig
  /**
   * Custom merge adapter. Provide this to plug in drop-in replacements
   * (e.g. `@weapp-tailwindcss/merge-v3`) instead of the default `tailwind-merge`.
   */
  twMergeAdapter?: TailwindMergeAdapter
}

export type TVConfig<
  // @ts-expect-error
  V extends TVVariants | undefined = undefined,
  // @ts-expect-error
  EV extends TVVariants | undefined = undefined,
> = {
  /**
   * Whether to enable responsive variant transform.
   * Which variants or screens(breakpoints) for responsive variant transform.
   * @default false
   */
  responsiveVariants?:
    | boolean
    | TVGeneratedScreens[]
    | { [K in keyof V | keyof EV]?: boolean | TVGeneratedScreens[] }
} & TWMConfig
