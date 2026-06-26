import type { BasePresetOptions } from './shared'
import { createBasePreset, withWebCompatGeneratorDefaults } from './shared'

export interface TaroPresetOptions extends BasePresetOptions {}

export function taro(options: TaroPresetOptions = {}) {
  return createBasePreset(withWebCompatGeneratorDefaults({
    ...options,
  }))
}
