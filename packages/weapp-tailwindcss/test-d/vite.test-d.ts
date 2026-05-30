import type { WeappTailwindcssVitePlugin } from 'weapp-tailwindcss/vite'
import { expectType } from 'tsd'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

expectType<WeappTailwindcssVitePlugin[] | undefined>(WeappTailwindcss({ appType: 'uni-app' }))
