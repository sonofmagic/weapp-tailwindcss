export interface PresetEnvOptions {
  stage?: false | 0 | 1 | 2 | 3 | 4
  minimumVendorImplementations?: number
  browsers?: string | string[]
  features?: Record<string, boolean | Record<string, unknown>>
  insertBefore?: Record<string, unknown>
  insertAfter?: Record<string, unknown>
  debug?: boolean
  logical?: {
    inlineDirection?: 'top-to-bottom' | 'bottom-to-top' | 'right-to-left' | 'left-to-right'
    blockDirection?: 'top-to-bottom' | 'bottom-to-top' | 'right-to-left' | 'left-to-right'
  }
  [key: string]: unknown
}
