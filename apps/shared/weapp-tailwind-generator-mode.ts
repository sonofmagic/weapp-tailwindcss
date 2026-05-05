import type { UserDefinedOptions } from 'weapp-tailwindcss'
import process from 'node:process'

export type AppGeneratorMode = 'auto' | 'generator' | 'legacy'

export function resolveAppGeneratorMode(
  fallback?: UserDefinedOptions['generator'],
): UserDefinedOptions['generator'] | undefined {
  const mode = process.env.WEAPP_TW_GENERATOR_MODE
  if (mode === 'legacy') {
    return false
  }
  if (mode === 'generator') {
    return {
      mode: 'force',
      target: 'weapp',
    }
  }
  if (mode === 'auto') {
    return {
      mode: 'auto',
      target: 'weapp',
    }
  }
  return fallback
}
