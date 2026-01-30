import { expectType } from 'tsd'
import typographyPlugin from '..'

const instance = typographyPlugin()
expectType<{ handler: () => void }>(instance)
expectType<true>(typographyPlugin.__isOptionsFunction)
