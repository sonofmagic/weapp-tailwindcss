import { expectType } from 'tsd'
// import vitePlugin from '../vite'
import type { PluginCreator } from 'postcss'
import { postcssWeappTailwindcssPostPlugin, postcssWeappTailwindcssPrePlugin } from '@/postcss/plugins'
import type { IStyleHandlerOptions } from '@/types'
import { replaceCss, replaceJs } from '@/replace'
// import type { Plugin as VitePlugin } from 'vite'
// expectType<VitePlugin | undefined>(vitePlugin())
expectType<PluginCreator<IStyleHandlerOptions>>(postcssWeappTailwindcssPrePlugin)
expectType<PluginCreator<IStyleHandlerOptions>>(postcssWeappTailwindcssPostPlugin)
expectType<(x: string) => string>(replaceCss)
expectType<(x: string) => string>(replaceJs)
