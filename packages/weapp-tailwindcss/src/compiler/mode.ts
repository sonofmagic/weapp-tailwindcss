import type { CompilerMode } from './types'
import process from 'node:process'

export const COMPILER_MODE_ENV = 'WEAPP_TAILWINDCSS_COMPILER'

export function resolveCompilerMode(env: NodeJS.ProcessEnv = process.env): CompilerMode {
  const value = env[COMPILER_MODE_ENV]
  return value === 'legacy' || value === 'shadow' || value === 'graph'
    ? value
    : 'graph'
}
