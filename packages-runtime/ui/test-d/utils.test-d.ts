/* eslint-disable antfu/no-import-dist */
import type {
  AriaAttributes,
  ClassValue,
  Platform,
} from '../dist/utils/index.js'
import {
  expectAssignable,
  expectType,
} from 'tsd'
import {
  clsx,
  cn,
  detectPlatform,
  getAriaProps,
  getButtonAriaProps,
  platformSwitch,
} from '../dist/utils/index.js'

expectType<string>(cn('px-2', false, undefined, 'px-4'))
expectType<string>(clsx('wt-button', { 'is-disabled': true }))
expectAssignable<ClassValue>('wt-button')
expectAssignable<Record<string, any>>(getAriaProps({ role: 'button' }))
expectAssignable<AriaAttributes>(getButtonAriaProps({ disabled: true }))
expectAssignable<Platform>(detectPlatform())
expectType<string | undefined>(platformSwitch<string>({ default: () => 'fallback' }))
