import type { Plugin as VitePlugin } from 'vite'
import { expectType } from 'tsd'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

expectType<VitePlugin[] | undefined>(WeappTailwindcss({ appType: 'uni-app' }))
