import type { AcceptedPlugin } from 'postcss'
import type { PxtransformOptions } from 'postcss-pxtransform'
import type { IStyleHandlerOptions } from '../types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcssPxtransform from 'postcss-pxtransform'

const defaultPxTransformOptions: PxtransformOptions = {
  platform: 'weapp',
  unitPrecision: 5,
  propList: ['*'],
  selectorBlackList: [],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  designWidth: 750,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
}

export function getPxTransformPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.px2rpx) {
    return null
  }

  const userOptions = typeof options.px2rpx === 'object'
    ? options.px2rpx
    : {}

  return postcssPxtransform(
    defuOverrideArray<PxtransformOptions, PxtransformOptions[]>(
      userOptions,
      defaultPxTransformOptions,
    ),
  )
}
