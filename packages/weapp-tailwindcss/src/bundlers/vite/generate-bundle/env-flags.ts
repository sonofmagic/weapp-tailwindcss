import process from 'node:process'

export function resolveGenerateBundleEnvFlags() {
  return {
    forceRuntimeRefreshByEnv: process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1',
    disableDirtyOptimization: process.env['WEAPP_TW_VITE_DISABLE_DIRTY'] === '1',
    disableJsPrecheck: process.env['WEAPP_TW_VITE_DISABLE_JS_PRECHECK'] === '1',
    debugCssDiff: process.env['WEAPP_TW_VITE_DEBUG_CSS_DIFF'] === '1',
  }
}
