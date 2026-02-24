import type { ClassMutationPayload, StyleMutationPayload } from './types'
import { promises as fs } from 'node:fs'
import { sleep } from './session'

function isRetryableFsError(error: unknown) {
  const code = (error as NodeJS.ErrnoException | undefined)?.code
  return code === 'ENOENT' || code === 'EPERM' || code === 'EBUSY' || code === 'EACCES'
}

function resolvePreferredEol(source: string) {
  const crlfCount = (source.match(/\r\n/g) ?? []).length
  const lfCount = (source.match(/(?<!\r)\n/g) ?? []).length
  if (crlfCount > 0 && crlfCount >= lfCount) {
    return '\r\n'
  }
  return '\n'
}

export function alignContentEol(content: string, source: string) {
  const eol = resolvePreferredEol(source)
  return content.replace(/\r?\n/g, eol)
}

export async function readFileWithRetry(
  file: string,
  options: {
    retries?: number
    retryDelayMs?: number
  } = {},
) {
  const retries = options.retries ?? 6
  const retryDelayMs = options.retryDelayMs ?? 40
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fs.readFile(file, 'utf8')
    }
    catch (error) {
      lastError = error
      if (!isRetryableFsError(error) || attempt >= retries) {
        throw error
      }
      await sleep(retryDelayMs)
    }
  }

  throw lastError
}

export async function readFileIfExists(file: string) {
  try {
    return await readFileWithRetry(file)
  }
  catch {
    return undefined
  }
}

export async function getMtime(file: string) {
  const retries = 6
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const stats = await fs.stat(file)
      return stats.mtimeMs
    }
    catch (error) {
      if (!isRetryableFsError(error) || attempt >= retries) {
        return 0
      }
      await sleep(40)
    }
  }
  return 0
}

export async function writeFilePreserveEol(
  file: string,
  content: string,
  source: string,
  options: {
    retries?: number
    retryDelayMs?: number
  } = {},
) {
  const retries = options.retries ?? 6
  const retryDelayMs = options.retryDelayMs ?? 40
  const alignedContent = alignContentEol(content, source)

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await fs.writeFile(file, alignedContent, 'utf8')
      return
    }
    catch (error) {
      if (!isRetryableFsError(error) || attempt >= retries) {
        throw error
      }
      await sleep(retryDelayMs)
    }
  }
}

export async function waitFor(
  predicate: () => Promise<boolean> | boolean,
  options: {
    timeoutMs: number
    pollMs: number
    message: string
    onTick?: () => void
  },
  startedAt = Date.now(),
) {
  while (Date.now() - startedAt <= options.timeoutMs) {
    if (await predicate()) {
      return Date.now() - startedAt
    }
    options.onTick?.()
    await sleep(options.pollMs)
  }
  throw new Error(options.message)
}

export function assertContains(source: string, expected: string, hint: string) {
  if (!source.includes(expected)) {
    throw new Error(`${hint}: expected to contain ${expected}`)
  }
}

export function assertNotContains(source: string, unexpected: string, hint: string) {
  if (source.includes(unexpected)) {
    throw new Error(`${hint}: expected to not contain ${unexpected}`)
  }
}

export function assertContainsOneOf(source: string, expected: string[], hint: string) {
  for (const value of expected) {
    if (source.includes(value)) {
      return
    }
  }
  throw new Error(`${hint}: expected to contain one of ${expected.join(' | ')}`)
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function findCssRuleBody(source: string, selector: string) {
  const pattern = new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`, 'i')
  const matched = source.match(pattern)
  return matched?.[1]
}

export function normalizeCssDeclaration(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

export function insertBeforeClosingTag(source: string, closingTag: string, snippet: string) {
  const index = source.lastIndexOf(closingTag)
  if (index === -1) {
    throw new Error(`closing tag ${closingTag} not found`)
  }
  return `${source.slice(0, index)}\n${snippet}\n${source.slice(index)}`
}

export function insertBeforeAnchor(source: string, anchor: string, snippet: string) {
  const index = source.indexOf(anchor)
  if (index === -1) {
    throw new Error(`anchor ${anchor} not found`)
  }
  return `${source.slice(0, index)}${snippet}${source.slice(index)}`
}

export function appendTrailingSnippet(source: string, snippet: string) {
  if (source.endsWith('\n')) {
    return `${source}${snippet}\n`
  }
  return `${source}\n${snippet}\n`
}

export function createStyleRuleSnippet(payload: StyleMutationPayload) {
  const numericSeed = payload.marker.replace(/\D/g, '')
  const colorSeed = (numericSeed.slice(-6) || '123456').padStart(6, '0').slice(0, 6)
  const applySnippet = payload.applyUtilities.length > 0
    ? ` @apply ${payload.applyUtilities.join(' ')};`
    : ''
  return `${payload.styleNeedle} {${applySnippet} color: #${colorSeed}; }`
}

export function mutateScriptByDataAnchor(source: string, dataAnchor: string, payload: ClassMutationPayload, indent = '    ') {
  if (!source.includes(dataAnchor)) {
    throw new Error(`script data anchor not found: ${dataAnchor}`)
  }
  return source.replace(
    dataAnchor,
    `${dataAnchor}\n${indent}${payload.classVariableName}: '${payload.classLiteral}',\n${indent}__twWatchScriptMarker: '${payload.marker}',`,
  )
}

export function mutateTsxScriptByReturnAnchor(source: string, payload: ClassMutationPayload, returnAnchor = '  return (') {
  const snippet = [
    `  const ${payload.classVariableName} = '${payload.classLiteral}'`,
    `  const __twWatchScriptMarker = '${payload.marker}'`,
    '',
  ].join('\n')
  const withScriptConst = insertBeforeAnchor(source, returnAnchor, snippet)
  const viewSnippet = `      <View className={${payload.classVariableName}}>${payload.marker}-script</View>`

  const closingCandidates = [
    '    </>',
    '  </>',
    '    </View>',
    '  </View>',
  ]

  for (const closingTag of closingCandidates) {
    if (withScriptConst.includes(closingTag)) {
      return insertBeforeClosingTag(withScriptConst, closingTag, viewSnippet)
    }
  }

  throw new Error('tsx closing tag not found for script mutation')
}

export function mutateVueScriptSetupArrayByAnchor(
  source: string,
  arrayAnchor: string,
  payload: ClassMutationPayload,
) {
  if (!source.includes(arrayAnchor)) {
    throw new Error(`vue script setup array anchor not found: ${arrayAnchor}`)
  }

  return source.replace(
    arrayAnchor,
    `${arrayAnchor}\n  '${payload.classLiteral}',\n  '${payload.marker}',`,
  )
}

export function mutateVueRefStringLiteral(
  source: string,
  refName: string,
  payload: ClassMutationPayload,
) {
  const pattern = new RegExp(`(const\\s+${refName}\\s*=\\s*ref\\(')([^']*)('\\))`)
  if (!pattern.test(source)) {
    throw new Error(`vue ref string literal not found: ${refName}`)
  }

  return source.replace(
    pattern,
    (_match, head: string, value: string, tail: string) => {
      return `${head}${value} ${payload.classLiteral} ${payload.marker}${tail}`
    },
  )
}

export function mutateSfcStyleBlock(source: string, payload: StyleMutationPayload) {
  if (!source.includes('</style>')) {
    throw new Error('style closing tag </style> not found')
  }
  return insertBeforeClosingTag(source, '</style>', createStyleRuleSnippet(payload))
}

export function insertIntoVueTemplateRoot(source: string, snippet: string) {
  const templateStart = source.indexOf('<template>')
  const templateEnd = source.lastIndexOf('</template>')
  if (templateStart === -1 || templateEnd === -1) {
    throw new Error('template block not found')
  }

  const templateBlock = source.slice(templateStart, templateEnd + '</template>'.length)
  const rootClosingTagMatches = [...templateBlock.matchAll(/\n {2}<\/[a-zA-Z][\w-]*>\s*\n<\/template>/g)]
  const rootClosingTagMatch = rootClosingTagMatches.at(-1)
  if (rootClosingTagMatch?.index == null) {
    throw new Error('vue template root closing tag not found')
  }

  const insertIndex = templateStart + rootClosingTagMatch.index
  return `${source.slice(0, insertIndex)}\n${snippet}${source.slice(insertIndex)}`
}
