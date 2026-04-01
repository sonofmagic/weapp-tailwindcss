import { expectAssignable } from 'tsd'
import type { IOptions as HtmlTransformOptions } from 'weapp-tailwindcss/postcss-html-transform'

expectAssignable<HtmlTransformOptions>({ platform: 'h5', removeUniversal: true })
