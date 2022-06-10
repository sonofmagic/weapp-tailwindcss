import { expectType } from 'tsd'
import vitePlugin from '../vite'
import postcssPlugin from '../postcss'
import { replaceCss, replaceJs } from 'replace'
import type { Plugin as VitePlugin } from 'vite'
import type { Plugin as PostcssPlugin } from 'postcss'
expectType<VitePlugin>(vitePlugin())
expectType<PostcssPlugin>(postcssPlugin)
expectType<(x: string) => string>(replaceCss)
expectType<(x: string) => string>(replaceJs)
