export function isUniAppXHarmonyOutDir(outDir: string | undefined) {
  return typeof outDir === 'string' && /(?:^|[/\\])\.?app-harmony(?:[/\\]|$)/.test(outDir)
}
