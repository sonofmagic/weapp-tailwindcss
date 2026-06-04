export function hasOmittedKnownBundleFiles(
  currentBundleFiles: string[],
  previousBundleFiles: Iterable<string>,
) {
  const currentFileSet = new Set(currentBundleFiles)
  for (const file of previousBundleFiles) {
    if (!currentFileSet.has(file)) {
      return true
    }
  }
  return false
}
