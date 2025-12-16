import type { BasePresetOptions } from './shared'
import { createBasePreset } from './shared'

export interface TaroPresetOptions extends BasePresetOptions {}

export function taro(options: TaroPresetOptions = {}) {
  return createBasePreset({
    ...options,
  })
}
