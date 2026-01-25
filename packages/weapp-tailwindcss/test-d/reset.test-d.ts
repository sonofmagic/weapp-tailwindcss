import { expectAssignable, expectError, expectType } from 'tsd'
import reset, { reset as resetPlugin } from 'weapp-tailwindcss/reset'

const resetOptions: Parameters<typeof resetPlugin>[0] = { imageReset: false }
expectAssignable<Parameters<typeof resetPlugin>[0]>(resetOptions)
expectType<ReturnType<typeof resetPlugin>>(resetPlugin({ buttonReset: false }))
expectType<ReturnType<typeof reset>>(reset({ imageReset: false }))
expectError(resetPlugin({ buttonReset: { declarations: { padding: true } } }))
