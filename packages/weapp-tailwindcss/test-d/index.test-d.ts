import type { Transform } from 'node:stream'
import type { Plugin as VitePlugin } from 'vite'
import type { UserDefinedOptions } from 'weapp-tailwindcss/types'
import { expectType } from 'tsd'
import {
  createPlugins,
  UnifiedWebpackPluginV5,
  WeappTailwindcss,
} from 'weapp-tailwindcss'

const rootOptions: UserDefinedOptions = { appType: 'taro' }

expectType<VitePlugin[] | undefined>(WeappTailwindcss(rootOptions))
expectType<UnifiedWebpackPluginV5>(new UnifiedWebpackPluginV5(rootOptions))

const rootGulpPlugins = createPlugins({ appType: 'native' })
expectType<Transform>(rootGulpPlugins.transformWxss())
expectType<Transform>(rootGulpPlugins.transformJs())
expectType<Transform>(rootGulpPlugins.transformWxml())
