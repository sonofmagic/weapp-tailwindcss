import type { Options as CssMacroOptions } from 'weapp-tailwindcss/css-macro'
import { expectAssignable, expectError, expectType } from 'tsd'
import cssMacro from 'weapp-tailwindcss/css-macro'

expectAssignable<CssMacroOptions>({
  dynamic: false,
  variantsMap: {
    ios: 'ios',
    android: { value: 'android', negative: true },
  },
})
expectType<ReturnType<typeof cssMacro>>(cssMacro({ dynamic: true }))
expectError(cssMacro({ variantsMap: { bad: { value: 123 } } }))
