// https://github.com/dcastil/tailwind-merge/blob/main/src/lib/validators.ts
// https://github.com/dcastil/tailwind-merge/blob/main/src/lib/default-config.ts

import type { Config } from 'tailwind-merge'
import { mergeConfigs } from 'tailwind-merge'
import { getDefaultConfig } from './default-config'

// https://github.com/vltansky/tailwind-merge-rtl-plugin
// https://github.com/kaelansmith/tailwind-extended-shadows-merge
export function withWeapp(config: Config<string, string>): Config<string, string> {
  return mergeConfigs(config, {
    extend: getDefaultConfig(),
  })
}
