/* eslint-disable antfu/no-import-dist */
import type {
  PlatformAdapter,
  PlatformCapabilities,
  PlatformEventMap,
} from '../dist/adapters/index.js'
import {
  expectAssignable,
  expectType,
} from 'tsd'
import {
  adapter,
  createEventHandlers,
  createPlatformAdapter,
  getCurrentAdapter,
  nativeAdapter,
  taroAdapter,
  uniAppAdapter,
} from '../dist/adapters/index.js'

expectAssignable<PlatformAdapter>(adapter)
expectAssignable<PlatformAdapter>(getCurrentAdapter())
expectAssignable<PlatformAdapter>(nativeAdapter)
expectAssignable<PlatformAdapter>(taroAdapter)
expectAssignable<PlatformAdapter>(uniAppAdapter)
expectType<string>(nativeAdapter.getEventPropName('click'))

const events: PlatformEventMap = {
  click: 'bindtap',
  longPress: 'bindlongpress',
  input: 'bindinput',
  focus: 'bindfocus',
  blur: 'bindblur',
  change: 'bindchange',
  touchStart: 'bindtouchstart',
  touchMove: 'bindtouchmove',
  touchEnd: 'bindtouchend',
  confirm: 'bindconfirm',
}

const capabilities: PlatformCapabilities = {
  cssFeatures: {
    cssVariables: true,
  },
}

const customAdapter = createPlatformAdapter('native', events, undefined, undefined, capabilities)
expectAssignable<PlatformAdapter>(customAdapter)
expectType<Record<string, (event: any) => void>>(
  createEventHandlers(customAdapter, ['click'], {
    click: (event: unknown) => event,
  }),
)
