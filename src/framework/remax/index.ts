import { BaseJsxUnplugin } from '@/base'
import type { UserDefinedOptions } from '@/types'

// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/4

export function RemaxUnpluginWebpack(options: UserDefinedOptions = {}) {
  return BaseJsxUnplugin(
    {
      ...options,
      framework: 'react'
    },
    'remax'
  )
}
