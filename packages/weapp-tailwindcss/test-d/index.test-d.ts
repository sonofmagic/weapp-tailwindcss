import type { Transform } from 'node:stream'
import type { UserDefinedOptions } from 'weapp-tailwindcss/types'
import type { WeappTailwindcssVitePlugin } from 'weapp-tailwindcss/vite'
import { expectType } from 'tsd'
import {
  createPlugins,
  WeappTailwindcss,
} from 'weapp-tailwindcss'

const rootOptions: UserDefinedOptions = { appType: 'taro' }

expectType<WeappTailwindcssVitePlugin[] | undefined>(WeappTailwindcss(rootOptions))

const rootGulpPlugins = createPlugins({ appType: 'native' })
expectType<Transform>(rootGulpPlugins.transformWxss())
expectType<Transform>(rootGulpPlugins.transformJs())
expectType<Transform>(rootGulpPlugins.transformWxml())
