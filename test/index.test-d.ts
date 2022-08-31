import { expectType } from 'tsd'
import vitePlugin from '../vite'
import postcssPlugin from '../postcss'
import type { InternalPostcssOptions } from '@/types'
import { replaceCss, replaceJs } from 'replace'
import type { Plugin as VitePlugin } from 'vite'
import type { PluginCreator } from 'postcss'
expectType<VitePlugin>(vitePlugin())
expectType<PluginCreator<InternalPostcssOptions>>(postcssPlugin)
expectType<(x: string) => string>(replaceCss)
expectType<(x: string) => string>(replaceJs)
