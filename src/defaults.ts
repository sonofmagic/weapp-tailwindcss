import defu from 'defu'
import type { UserDefinedOptions } from './types'

export const defaultOptions: Required<UserDefinedOptions> = {
  cssMatcher: (file) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file),
  htmlMatcher: (file) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file),
  jsMatcher: (file) => /.+\.js$/.test(file),
  mainCssChunkMatcher: (file) => {
    return file === 'main' || file === 'app'
  }
}

export function getOptions (options: UserDefinedOptions) {
  return defu<UserDefinedOptions, Required<UserDefinedOptions>>(
    options,
    defaultOptions
  )
}
