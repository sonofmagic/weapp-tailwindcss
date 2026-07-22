export function isUniAppXHarmonyOutDir(outDir: string | undefined) {
  return typeof outDir === 'string' && /(?:^|[/\\])\.?app-harmony(?:[/\\]|$)/.test(outDir)
}

export function isUniAppXNativeAppOutDir(outDir: string | undefined) {
  return typeof outDir === 'string'
    && /(?:^|[/\\-])(?:\.uvue[/\\])?app-(?:android|ios|harmony)(?:[/\\-]|$)/.test(outDir)
}
