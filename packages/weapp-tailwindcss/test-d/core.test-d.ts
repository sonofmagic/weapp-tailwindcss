import type { Document, Result as PostcssResult, Root } from 'postcss'
import type { JsHandlerResult, UserDefinedOptions } from 'weapp-tailwindcss/types'
import { expectType } from 'tsd'
import { createContext } from 'weapp-tailwindcss/core'

const context = createContext({ appType: 'taro' })
expectType<Promise<PostcssResult<Root | Document>>>(context.transformWxss(''))
expectType<Promise<JsHandlerResult>>(context.transformJs('const foo = 1'))
expectType<Promise<string>>(context.transformWxml('<view class="foo"></view>'))

const customOptions: UserDefinedOptions = {
  appType: 'native',
  cssMatcher: name => name.endsWith('.wxss'),
}
const customContext = createContext(customOptions)
expectType<Promise<PostcssResult<Root | Document>>>(customContext.transformWxss(''))
