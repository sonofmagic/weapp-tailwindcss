import type { PluginCreator } from 'postcss'
import { expectAssignable } from 'tsd'
import postcssHtmlTransform from 'weapp-tailwindcss/postcss-html-transform'
// import postcssHtmlTransform = require('weapp-tailwindcss/postcss-html-transform')

type HtmlTransformOptions = Parameters<typeof postcssHtmlTransform>[0]
expectAssignable<HtmlTransformOptions>({ platform: 'h5', removeUniversal: true })
expectAssignable<PluginCreator<HtmlTransformOptions>>(postcssHtmlTransform)
