import type { AcceptedPlugin } from 'postcss'
import type { UserDefinedOptions as Rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { IStyleHandlerOptions } from '../types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcssRem2rpx from 'postcss-rem-to-responsive-pixel'

const defaultRemOptions: Rem2rpxOptions = {
  rootValue: 32,
  propList: ['*'],
  transformUnit: 'rpx',
}

const defaultStage: Pick<Rem2rpxOptions, 'processorStage'> = {
  processorStage: 'OnceExit',
}

export function getRemTransformPlugin(options: IStyleHandlerOptions): AcceptedPlugin | null {
  if (!options.rem2rpx) {
    return null
  }

  const userOptions = typeof options.rem2rpx === 'object'
    ? options.rem2rpx
    : defaultRemOptions

  const merged = defuOverrideArray<Rem2rpxOptions, Rem2rpxOptions[]>(
    userOptions,
    defaultStage,
  )

  return postcssRem2rpx(merged)
}
