interface ViteConfigWithWeapp {
  weapp?: {
    srcRoot?: unknown
  } | undefined
}

export function resolveWeappViteSourceRoot(config: unknown) {
  const srcRoot = (config as ViteConfigWithWeapp | undefined)?.weapp?.srcRoot
  return typeof srcRoot === 'string' && srcRoot.trim().length > 0
    ? srcRoot
    : undefined
}
