import type { Plugin as VitePlugin } from 'vite'
import { expectType } from 'tsd'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

expectType<VitePlugin[] | undefined>(UnifiedViteWeappTailwindcssPlugin({ appType: 'uni-app' }))
