import type { BasePresetOptions } from './shared'
import { createBasePreset } from './shared'

export interface HBuilderXOptions extends BasePresetOptions {}

export function hbuilderx(options: HBuilderXOptions = {}) {
  return createBasePreset({
    ...options,
  })
}
