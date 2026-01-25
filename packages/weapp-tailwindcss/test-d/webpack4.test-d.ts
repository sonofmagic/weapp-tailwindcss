import { expectType } from 'tsd'
import { UnifiedWebpackPluginV4 } from 'weapp-tailwindcss/webpack4'

const webpack4Plugin = new UnifiedWebpackPluginV4()
expectType<UnifiedWebpackPluginV4>(webpack4Plugin)
