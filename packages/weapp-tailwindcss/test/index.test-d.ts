import { postcssWeappTailwindcssPostPlugin, postcssWeappTailwindcssPrePlugin } from '@/postcss/plugins'
import { replaceCss, replaceJs } from '@/replace'
import { expectType } from 'tsd'
import type { IStyleHandlerOptions } from '@/types'
// import vitePlugin from '../vite'
import type { PluginCreator } from 'postcss'
// import type { Plugin as VitePlugin } from 'vite'
// expectType<VitePlugin | undefined>(vitePlugin())
expectType<PluginCreator<IStyleHandlerOptions>>(postcssWeappTailwindcssPrePlugin)
expectType<PluginCreator<IStyleHandlerOptions>>(postcssWeappTailwindcssPostPlugin)
expectType<(x: string) => string>(replaceCss)
expectType<(x: string) => string>(replaceJs)
