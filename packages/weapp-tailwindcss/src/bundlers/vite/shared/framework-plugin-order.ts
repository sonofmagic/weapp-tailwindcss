import type { Plugin } from 'vite'

export function orderFrameworkSourceCandidatePlugins(
  extraPlugins: Plugin[],
  rewritePlugins: Plugin[],
  sourceCandidatesPlugin: Plugin,
  beforeExtraPlugin?: (plugin: Plugin) => boolean,
) {
  const anchor = beforeExtraPlugin ? extraPlugins.findIndex(beforeExtraPlugin) : -1
  if (anchor < 0) {
    return [...extraPlugins, ...rewritePlugins, sourceCandidatesPlugin]
  }
  return [
    ...extraPlugins.slice(0, anchor),
    ...rewritePlugins,
    sourceCandidatesPlugin,
    ...extraPlugins.slice(anchor),
  ]
}
