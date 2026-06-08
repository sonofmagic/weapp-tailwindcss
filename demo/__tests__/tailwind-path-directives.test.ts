import { existsSync } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const demoRoot = fileURLToPath(new URL('..', import.meta.url))
const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const websiteRoot = path.resolve(repositoryRoot, 'website')
const ignoredDirectories = new Set([
  '.compare-dev-weapp',
  '.debug',
  '.turbo',
  '__tests__',
  'dist',
  'node_modules',
  'unpackage',
])

const styleFileRE = /\.(?:css|scss|less|mpx|vue|uvue)$/
const tailwindEntryRE = /@(tailwind\s+(?:base|components|utilities)|import\s+["']tailwindcss(?:\/|["']))/
const directiveRE = /@(config|source)\s+(not\s+)?["']([^"']+)["']/g

function stripCssComments(source: string) {
  let output = ''
  let index = 0
  let quote: '"' | '\'' | undefined

  while (index < source.length) {
    const character = source[index]
    const nextCharacter = source[index + 1]

    if (quote) {
      output += character

      if (character === '\\') {
        output += nextCharacter ?? ''
        index += 2
        continue
      }

      if (character === quote) {
        quote = undefined
      }

      index++
      continue
    }

    if (character === '"' || character === '\'') {
      quote = character
      output += character
      index++
      continue
    }

    if (character === '/' && nextCharacter === '*') {
      const commentEnd = source.indexOf('*/', index + 2)
      index = commentEnd === -1 ? source.length : commentEnd + 2
      continue
    }

    if (character === '/' && nextCharacter === '/') {
      const lineEnd = source.indexOf('\n', index + 2)
      index = lineEnd === -1 ? source.length : lineEnd
      continue
    }

    output += character
    index++
  }

  return output
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory)
  const files: string[] = []

  for (const entry of entries) {
    if (ignoredDirectories.has(entry)) {
      continue
    }

    const absolutePath = path.join(directory, entry)
    const fileStat = await stat(absolutePath)

    if (fileStat.isDirectory()) {
      files.push(...await collectFiles(absolutePath))
    }
    else {
      files.push(absolutePath)
    }
  }

  return files
}

function getDemoProject(relativePath: string) {
  const parts = relativePath.split(path.sep)
  return parts[1] === 'web' ? parts.slice(0, 3).join('/') : parts.slice(0, 2).join('/')
}

function resolveDirectiveBase(file: string, specifier: string) {
  const absolutePath = path.resolve(path.dirname(file), specifier)

  if (!/[*{[]/.test(specifier)) {
    return absolutePath
  }

  const staticBase = absolutePath.split(/[*{[]/)[0] ?? absolutePath
  return staticBase.endsWith(path.sep) ? staticBase.slice(0, -1) : staticBase
}

function getPositiveSourceSpecifiers(source: string) {
  const specifiers: string[] = []

  for (const match of source.matchAll(directiveRE)) {
    const [, kind, negativePrefix, specifier] = match

    if (kind === 'source' && !negativePrefix) {
      specifiers.push(specifier)
    }
  }

  return specifiers
}

describe('demo Tailwind path directives', () => {
  it('keeps every Tailwind CSS entry using resolvable @config and @source directives', async () => {
    const files = await collectFiles(demoRoot)
    const entries: Array<{
      file: string
      project: string
      source: string
    }> = []

    for (const file of files.filter(file => styleFileRE.test(file))) {
      const rawSource = await readFile(file, 'utf8')
      const source = stripCssComments(rawSource)

      if (!tailwindEntryRE.test(source)) {
        continue
      }

      const relativePath = path.relative(path.dirname(demoRoot), file)

      entries.push({
        file,
        project: getDemoProject(relativePath),
        source,
      })
    }

    expect(entries.length).toBeGreaterThan(0)

    for (const entry of entries) {
      const relativePath = path.relative(path.dirname(demoRoot), entry.file)
      const isV4Demo = entry.project.includes('tailwindcss-v4')

      expect.soft(entry.source, `${relativePath} should use explicit @config`).toMatch(/@config\s+["']/)

      if (isV4Demo) {
        expect.soft(entry.source, `${relativePath} should use explicit @source`).toMatch(/@source\s+(?:not\s+)?["']/)
      }

      for (const match of entry.source.matchAll(directiveRE)) {
        const [, kind, negativePrefix, specifier] = match

        if (kind === 'source' && negativePrefix) {
          continue
        }

        const resolvedBase = resolveDirectiveBase(entry.file, specifier)

        expect.soft(
          existsSync(resolvedBase),
          `${relativePath} @${kind} "${specifier}" should resolve from the CSS entry directory`,
        ).toBe(true)
      }
    }
  })

  it('keeps subpackage Tailwind entries scoped to their own config and source roots', async () => {
    const files = await collectFiles(demoRoot)
    const subpackageEntries: Array<{
      relativePath: string
      source: string
    }> = []

    for (const file of files.filter(file => styleFileRE.test(file))) {
      const relativePath = path.relative(demoRoot, file)

      if (!/(?:^|\/)(sub-normal|sub-independent|moduleA|moduleB|moduleC)\/pages\//.test(relativePath)) {
        continue
      }

      const source = stripCssComments(await readFile(file, 'utf8'))

      if (tailwindEntryRE.test(source)) {
        subpackageEntries.push({ relativePath, source })
      }
    }

    expect(subpackageEntries.length).toBeGreaterThan(0)

    for (const entry of subpackageEntries) {
      expect.soft(entry.source, `${entry.relativePath} should use an independent subpackage config`)
        .toMatch(/@config\s+["'][^"']*tailwind\.config\.(?:sub-|module-)/)

      if (entry.relativePath.includes('tailwindcss-v4/')) {
        expect.soft(entry.source, `${entry.relativePath} should use source(none)`)
          .toContain('source(none)')
        expect.soft(entry.source, `${entry.relativePath} should only source the current subpackage`)
          .toMatch(/@source\s+["']\.\.\/\*\*/)

        const positiveSources = getPositiveSourceSpecifiers(entry.source)

        expect.soft(positiveSources, `${entry.relativePath} should include the Tailwind CSS entry in source scanning`)
          .toSatisfy((specifiers: string[]) => specifiers.some(specifier => specifier.includes('css')))
      }
    }
  })
})

describe('website Tailwind path directives', () => {
  it('keeps website Tailwind CSS entry using resolvable @config and @source directives', async () => {
    const files = await collectFiles(websiteRoot)
    const entries = []

    for (const file of files.filter(file => styleFileRE.test(file))) {
      const source = stripCssComments(await readFile(file, 'utf8'))

      if (tailwindEntryRE.test(source)) {
        entries.push({ file, source })
      }
    }

    expect(entries.length).toBeGreaterThan(0)

    for (const entry of entries) {
      const relativePath = path.relative(repositoryRoot, entry.file)

      expect.soft(entry.source, `${relativePath} should use explicit @config`).toMatch(/@config\s+["']/)
      expect.soft(entry.source, `${relativePath} should use explicit @source`).toMatch(/@source\s+(?:not\s+)?["']/)

      for (const match of entry.source.matchAll(directiveRE)) {
        const [, kind, negativePrefix, specifier] = match

        if (kind === 'source' && negativePrefix) {
          continue
        }

        const resolvedBase = resolveDirectiveBase(entry.file, specifier)

        expect.soft(
          existsSync(resolvedBase),
          `${relativePath} @${kind} "${specifier}" should resolve from the CSS entry directory`,
        ).toBe(true)
      }
    }
  })
})
