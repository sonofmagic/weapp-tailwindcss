import process from 'node:process'

export type DemoGeneratorMode = 'auto' | 'generator' | 'legacy'
export type DemoGeneratorOptions = boolean | {
  mode?: 'auto' | 'force' | 'off'
  target?: 'weapp' | 'web' | 'tailwind'
  styleOptions?: Record<string, unknown>
}

export function resolveDemoGeneratorMode(
  fallback?: DemoGeneratorOptions,
): DemoGeneratorOptions | undefined {
  const mode = process.env.WEAPP_TW_GENERATOR_MODE
  const fallbackObject = typeof fallback === 'object' && fallback !== null ? fallback : {}
  if (mode === 'legacy') {
    return false
  }
  if (mode === 'generator') {
    return {
      ...fallbackObject,
      mode: 'force',
      target: 'weapp',
    }
  }
  if (mode === 'auto') {
    return {
      ...fallbackObject,
      mode: 'auto',
      target: 'weapp',
    }
  }
  return fallback
}
