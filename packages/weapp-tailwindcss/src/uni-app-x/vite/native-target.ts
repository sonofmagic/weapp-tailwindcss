import type { ResolvedConfig } from 'vite'
import { isUniAppXNativeAppOutDir } from '@/uni-app-x/harmony'
import { resolveUniUtsPlatform } from '@/utils'

export function createUniAppXNativeBuildTargetResolver(
  getResolvedConfig: () => ResolvedConfig | undefined,
) {
  let observedNativeAppBuildTarget = false

  return (id?: string) => {
    const config = getResolvedConfig()
    const detected = resolveUniUtsPlatform().isApp
      || isUniAppXNativeAppOutDir(config?.build?.outDir)
      || isUniAppXNativeAppOutDir(config?.root)
      || isUniAppXNativeAppOutDir(id)
    observedNativeAppBuildTarget ||= detected
    return observedNativeAppBuildTarget
  }
}
