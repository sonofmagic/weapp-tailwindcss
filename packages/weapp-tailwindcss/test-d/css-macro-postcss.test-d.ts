import type { PluginCreator } from 'postcss'
import type { Options as PostcssCssMacroOptions } from 'weapp-tailwindcss/css-macro/postcss'
import { expectAssignable } from 'tsd'
import postcssCssMacro from 'weapp-tailwindcss/css-macro/postcss'

expectAssignable<PostcssCssMacroOptions>({})
expectAssignable<PluginCreator<PostcssCssMacroOptions>>(postcssCssMacro)
