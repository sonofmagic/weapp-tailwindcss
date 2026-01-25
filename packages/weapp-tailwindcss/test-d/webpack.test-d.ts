import { expectType } from 'tsd'
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack'

const webpackPlugin = new UnifiedWebpackPluginV5({ appType: 'taro' })
expectType<UnifiedWebpackPluginV5>(webpackPlugin)
