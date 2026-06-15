import { isRunningInHBuilderX as detectRunningInHBuilderX } from '@/framework'

export interface HBuilderXRuntimeHints {
  cwd?: string
  nodePath?: string | null
}

export function isRunningInHBuilderX(options: HBuilderXRuntimeHints = {}) {
  return detectRunningInHBuilderX(options)
}
