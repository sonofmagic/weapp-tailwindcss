import type { BasePresetOptions, UniAppPresetOptions, UniAppXOptions } from 'weapp-tailwindcss/presets'
import type { UserDefinedOptions } from 'weapp-tailwindcss/types'
import { expectAssignable, expectType } from 'tsd'
import { createBasePreset, normalizeCssEntries, uniApp, uniAppX } from 'weapp-tailwindcss/presets'

const basePresetOptions: BasePresetOptions = { base: '.', cssEntries: 'src/app.css' }
expectAssignable<BasePresetOptions>(basePresetOptions)
expectAssignable<Partial<UserDefinedOptions>>(createBasePreset(basePresetOptions))
expectType<string[] | undefined>(normalizeCssEntries('src/app.css'))

const uniAppPresetOptions: UniAppPresetOptions = {}
expectAssignable<UniAppPresetOptions>(uniAppPresetOptions)
expectAssignable<Partial<UserDefinedOptions>>(uniApp())

const uniAppXOptions: UniAppXOptions = { base: '.', cssEntries: ['src/app.css'] }
expectAssignable<UniAppXOptions>(uniAppXOptions)
expectAssignable<Partial<UserDefinedOptions>>(uniAppX(uniAppXOptions))
