import { expectType } from 'tsd'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'
import {
  WeappTailwindcss as RspackWeappTailwindcss,
  patchRspackConfig,
  type RspackConfigLike,
} from 'weapp-tailwindcss/rspack'

const webpackPlugin = new WeappTailwindcss({ appType: 'taro' })
expectType<WeappTailwindcss>(webpackPlugin)
expectType<typeof WeappTailwindcss>(RspackWeappTailwindcss)
expectType<RspackConfigLike>(patchRspackConfig({ module: { rules: [] } }))
