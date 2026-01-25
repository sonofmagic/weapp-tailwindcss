import type { Transform } from 'node:stream'
import { expectType } from 'tsd'
import { createPlugins } from 'weapp-tailwindcss/gulp'

const gulpPlugins = createPlugins({ appType: 'native' })
expectType<Transform>(gulpPlugins.transformWxss())
expectType<Transform>(gulpPlugins.transformJs({ filename: 'src/app.ts' }))
expectType<Transform>(gulpPlugins.transformWxml())
