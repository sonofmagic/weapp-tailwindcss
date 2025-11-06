import type { Input, PluginCreator } from 'postcss'
import type { Config } from 'tailwindcss'
import type { Options } from './types'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { loadConfig } from 'tailwindcss-config'
import { getConfig } from './config'
import { postcssPlugin } from './constants'
import { regExpTest, removeFileExtension } from './utils'
import { getDepFiles } from './wxml'

const configCache = new Map<string, Promise<Config | undefined>>()

async function loadTailwindConfigOnce(cwd: string, configPath: string) {
  const cacheKey = `${cwd}::${configPath}`
  let cached = configCache.get(cacheKey)
  if (!cached) {
    cached = loadConfig({
      cwd,
      config: configPath,
    }).then(result => result?.config as Config | undefined)
    configCache.set(cacheKey, cached)
  }
  return cached
}

function cloneConfig(config: Config | undefined): Config | undefined {
  if (!config) {
    return config
  }

  return {
    ...config,
  }
}

async function resolveTailwindConfig(config: Options['config'], cwd: string, sourceInput: Input | undefined) {
  if (!config) {
    return undefined
  }

  const resolved = typeof config === 'function' ? config(sourceInput) : config

  if (typeof resolved === 'string') {
    const loaded = await loadTailwindConfigOnce(cwd, resolved)
    return cloneConfig(loaded)
  }

  return cloneConfig(resolved as Config)
}

// 辅助函数 isObject（当前未启用）:
// function isObject(obj: any): obj is object {
//   return typeof obj === 'object' && obj !== null
// }
export type {
  Options,
}

const creator: PluginCreator<Partial<Options>> = (options) => {
  const { config, filter, directiveParams, cwd, extensions, insertAfterAtRulesNames, insertAfterComments } = getConfig(options)

  const extensionsGlob = `{${extensions.join(',')}}`

  return {
    postcssPlugin,
    plugins: [
      {
        postcssPlugin: `${postcssPlugin}:post`,
        async Once(root, helpers) {
          const sourceInput = root.source?.input
          if (filter(sourceInput)) {
            const nodes = root.nodes ?? []
            let atruleAnchorIndex = -1
            let commentAnchorIndex = -1
            const directivePresence = new Set<string>()

            nodes.forEach((node, index) => {
              if (node.type === 'atrule') {
                const nameMatches = insertAfterAtRulesNames.includes(node.name)
                if (nameMatches) {
                  atruleAnchorIndex = Math.max(atruleAnchorIndex, index)
                }
                if (typeof node.params === 'string') {
                  directivePresence.add(node.params)
                }
              }
              else if (node.type === 'comment' && regExpTest(insertAfterComments, node.text)) {
                commentAnchorIndex = Math.max(commentAnchorIndex, index)
              }
            })

            const anchorIndex = Math.max(atruleAnchorIndex, commentAnchorIndex)
            const anchorNode = anchorIndex >= 0 ? nodes[anchorIndex] : undefined
            let lastInserted = anchorNode

            for (const params of directiveParams) {
              if (!directivePresence.has(params)) {
                const atRule = helpers.atRule({ name: 'tailwind', params })
                if (lastInserted) {
                  root.insertAfter(lastInserted, atRule)
                }
                else {
                  root.prepend(atRule)
                }
                lastInserted = atRule
                directivePresence.add(params)
              }
            }

            if (sourceInput?.file) {
              const tailwindcssConfig = (await resolveTailwindConfig(config, cwd, sourceInput)) ?? { content: [] }

              const basename = removeFileExtension(sourceInput.file)
              const contentEntries = [`${basename}.${extensionsGlob}`]

              const deps = await getDepFiles(`${basename}.wxml`)
              for (const dep of deps) {
                contentEntries.push(`${removeFileExtension(dep)}.${extensionsGlob}`)
              }

              const uniqueEntries = Array.from(new Set(contentEntries))
              const { content: existingContent } = tailwindcssConfig as { content?: Config['content'] }

              if (!existingContent || Array.isArray(existingContent)) {
                tailwindcssConfig.content = uniqueEntries
              }
              else if (typeof existingContent === 'object' && existingContent !== null) {
                const normalizedContent = { ...existingContent }
                const currentFiles = normalizedContent.files
                const normalizedFiles = Array.isArray(currentFiles)
                  ? currentFiles
                  : typeof currentFiles === 'string'
                    ? [currentFiles]
                    : []
                normalizedContent.files = Array.from(new Set([...normalizedFiles, ...uniqueEntries]))
                tailwindcssConfig.content = normalizedContent
              }
              else {
                tailwindcssConfig.content = uniqueEntries
              }

              await postcss([
                tailwindcss(tailwindcssConfig),
              ]).process(root, {
                from: sourceInput.file,
              }).async()
            }
          }
        },
      },
    ],
  }
}
creator.postcss = true

export default creator
