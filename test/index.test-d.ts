import { expectType } from 'tsd'
// import vitePlugin from '../vite'
import type { PluginCreator } from 'postcss'
import { postcssWeappTailwindcss } from '@/postcss/plugin'
import type { IStyleHandlerOptions } from '@/types'
import { replaceCss, replaceJs } from '@/replace'
// import type { Plugin as VitePlugin } from 'vite'
// expectType<VitePlugin | undefined>(vitePlugin())
expectType<PluginCreator<IStyleHandlerOptions>>(postcssWeappTailwindcss)
expectType<(x: string) => string>(replaceCss)
expectType<(x: string) => string>(replaceJs)
