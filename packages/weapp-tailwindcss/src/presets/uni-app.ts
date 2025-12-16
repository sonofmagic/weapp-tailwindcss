import type { BasePresetOptions } from './shared'
import process from 'node:process'
import { createBasePreset } from './shared'

export interface UniAppPresetOptions extends BasePresetOptions {}

export function uniApp(options: UniAppPresetOptions = {}) {
  const uniPlatform = process.env.UNI_PLATFORM
  const disableInH5OrApp = uniPlatform === 'h5' || uniPlatform === 'app' || uniPlatform === 'app-plus'

  return createBasePreset({
    disabled: disableInH5OrApp ? true : undefined,
    ...options,
  })
}
