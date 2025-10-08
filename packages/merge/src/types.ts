import type { ClassValue } from 'clsx'

export type EscapeFn = (value: string) => string

export interface CreateOptions {
  disableEscape?: boolean
  escapeFn?: EscapeFn
}

export type TailwindMergeLibraryFn = (...inputs: any[]) => string

export type TailwindMergeRuntime = (...inputs: ClassValue[]) => string

export type TailwindMergeFactory<TFactory extends (...args: any[]) => TailwindMergeLibraryFn>
  = (...args: Parameters<TFactory>) => TailwindMergeRuntime

export type TailwindMergeVersion = 2 | 3
