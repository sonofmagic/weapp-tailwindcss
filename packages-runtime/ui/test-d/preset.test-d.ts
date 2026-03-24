/* eslint-disable antfu/no-import-dist */
import type { TailwindConfig } from '../dist/preset.js'
import {
  expectAssignable,
  expectType,
} from 'tsd'
import {
  weappTailwindcssUIPlugin,
  weappTailwindcssUIPreset,
} from '../dist/preset.js'

expectAssignable<TailwindConfig>(weappTailwindcssUIPreset)
expectType<TailwindConfig['theme']>(weappTailwindcssUIPreset.theme)
expectType<TailwindConfig['plugins']>(weappTailwindcssUIPreset.plugins)
expectType<(api: Parameters<typeof weappTailwindcssUIPlugin.handler>[0]) => void>(weappTailwindcssUIPlugin.handler)
