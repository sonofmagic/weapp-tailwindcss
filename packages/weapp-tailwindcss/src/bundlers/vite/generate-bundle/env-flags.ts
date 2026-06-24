import process from 'node:process'

export function resolveGenerateBundleEnvFlags() {
  const slowJsAstWarnMs = Number(process.env['WEAPP_TW_VITE_SLOW_JS_AST_WARN_MS'] ?? 1000)
  return {
    forceRuntimeRefreshByEnv: process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1',
    disableDirtyOptimization: process.env['WEAPP_TW_VITE_DISABLE_DIRTY'] === '1',
    disableJsPrecheck: process.env['WEAPP_TW_VITE_DISABLE_JS_PRECHECK'] === '1',
    debugCssDiff: process.env['WEAPP_TW_VITE_DEBUG_CSS_DIFF'] === '1',
    slowJsAstWarnMs: Number.isFinite(slowJsAstWarnMs) && slowJsAstWarnMs >= 0
      ? slowJsAstWarnMs
      : 1000,
  }
}
