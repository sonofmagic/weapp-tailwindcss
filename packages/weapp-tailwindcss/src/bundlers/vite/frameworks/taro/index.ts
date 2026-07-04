import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

export function createTaroVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'taro',
  })
}
