import type { UserDefinedOptions } from 'weapp-tailwindcss/types'
import { expectAssignable } from 'tsd'
import { getDefaultOptions } from 'weapp-tailwindcss/defaults'

const defaults = getDefaultOptions()
expectAssignable<UserDefinedOptions>(defaults)
