export type { DisabledOptions } from './types/disabled-options'
export type { UserDefinedOptions } from './types/user-defined-options'
export type {
  ApplyOptions,
  CacheOptions,
  ExtractOptions,
  TailwindCssOptions,
  TailwindCssPatchOptions,
  TailwindV2Options,
  TailwindV3Options,
  TailwindV4Options,
} from 'tailwindcss-patch'

/**
 * @deprecated 请改用 `TailwindCssPatchOptions`
 */
export type TailwindcssPatchOptions = import('tailwindcss-patch').TailwindCssPatchOptions
