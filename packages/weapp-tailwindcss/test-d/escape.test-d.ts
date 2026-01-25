import { expectType } from 'tsd'
import { escape, isAllowedClassName, unescape, weappTwIgnore } from 'weapp-tailwindcss/escape'

const ignored = weappTwIgnore`foo${'bar'}`
expectType<string>(ignored)
expectType<string>(escape('<view class="foo"></view>'))
expectType<boolean>(isAllowedClassName('text-sm'))
expectType<string>(unescape('text-sm'))
