import type { UserDefinedOptions } from '@/types'
import { createNativeGulpPlugins } from '../../shared/create-native-framework-plugins'

export function createNativeGulpFrameworkPlugins(options: UserDefinedOptions = {}) {
  return createNativeGulpPlugins(options)
}
