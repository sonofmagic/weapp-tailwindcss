import type { EscapeOptions, UnescapeOptions } from '@weapp-core/escape'
import type { ClassValue } from 'clsx'

export type EscapeConfig = false | EscapeOptions

export type UnescapeConfig = false | UnescapeOptions

export interface CreateOptions {
  escape?: EscapeConfig
  unescape?: UnescapeConfig
}

export interface Transformers {
  escape: (value: string) => string
  unescape: (value: string) => string
}

export type TailwindMergeLibraryFn = (...inputs: any[]) => string

export type TailwindMergeRuntime = (...inputs: ClassValue[]) => string

export type TailwindMergeFactory<TFactory extends (...args: any[]) => TailwindMergeLibraryFn>
  = (...args: Parameters<TFactory>) => TailwindMergeRuntime

export type TailwindMergeVersion = 2 | 3
