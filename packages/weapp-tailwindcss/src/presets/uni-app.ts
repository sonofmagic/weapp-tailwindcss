import type { BasePresetOptions } from './shared'
import process from 'node:process'
import { createBasePreset, withWebCompatGeneratorDefaults } from './shared'

export interface UniAppPresetOptions extends BasePresetOptions {}

export function uniApp(options: UniAppPresetOptions = {}) {
  const uniPlatform = process.env['UNI_PLATFORM']
  const disableInApp = uniPlatform === 'app' || uniPlatform === 'app-plus'

  return createBasePreset(withWebCompatGeneratorDefaults({
    disabled: disableInApp ? true : undefined,
    ...options,
  }))
}
