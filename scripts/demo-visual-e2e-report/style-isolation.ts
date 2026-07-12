import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { readUtf8 } from '../../e2e/hbuilderx-local/process.ts'

export interface StyleIsolationVariant {
  key?: string
  styleIsolationVersion?: '2'
}

export function resolveStyleIsolationVariants(projectDir: string): StyleIsolationVariant[] {
  if (!projectDir.includes('uni-app-x-')) {
    return [{}]
  }
  const variants = [
    { key: 'style-isolation-default' },
    { key: 'style-isolation-v2', styleIsolationVersion: '2' },
  ] satisfies StyleIsolationVariant[]
  const selectedVariant = process.env['DEMO_VISUAL_STYLE_ISOLATION_VARIANT']
  return selectedVariant ? variants.filter(item => item.key === selectedVariant) : variants
}

export async function readManifest(projectRoot: string) {
  return await readUtf8(path.resolve(projectRoot, 'manifest.json'))
}

export async function writeManifest(projectRoot: string, source: string) {
  await fs.writeFile(path.resolve(projectRoot, 'manifest.json'), source, 'utf8')
}

export async function writeStyleIsolationVariantManifest(projectRoot: string, variant: StyleIsolationVariant) {
  const source = await readManifest(projectRoot)
  const next = variant.styleIsolationVersion
    ? setStyleIsolationVersion(source, variant.styleIsolationVersion)
    : removeStyleIsolationVersion(source)
  await writeManifest(projectRoot, next)
}

function setStyleIsolationVersion(source: string, version: '2') {
  const property = findUniAppXObject(source)
  if (!property) {
    return source
  }
  const body = removeStyleIsolationVersion(source.slice(property.openBraceIndex + 1, property.closeBraceIndex)).replace(/^\s*,\s*$/m, '')
  const lineStart = source.lastIndexOf('\n', property.keyIndex)
  const indent = source.slice(lineStart + 1, property.keyIndex).replace(/[^\t ]/g, '') || '\t'
  const childIndent = `${indent}\t`
  const trimmedBody = body.trim()
  const separator = trimmedBody.length > 0 && !trimmedBody.endsWith(',') ? ',' : ''
  const nextBody = trimmedBody.length > 0
    ? `\n${body.trimEnd()}${separator}\n${childIndent}"styleIsolationVersion": "${version}"\n${indent}`
    : `\n${childIndent}"styleIsolationVersion": "${version}"\n${indent}`
  return `${source.slice(0, property.openBraceIndex + 1)}${nextBody}${source.slice(property.closeBraceIndex)}`
}

function removeStyleIsolationVersion(source: string) {
  return source
    .replace(/\n[ \t]*"styleIsolationVersion"\s*:\s*"2"\s*,?/g, '')
    .replace(/,\s*(\n[ \t]*\})/g, '$1')
}

function findUniAppXObject(source: string) {
  const key = '"uni-app-x"'
  const keyIndex = source.indexOf(key)
  if (keyIndex < 0) {
    return undefined
  }
  const colonIndex = source.indexOf(':', keyIndex + key.length)
  if (colonIndex < 0) {
    return undefined
  }
  const openBraceIndex = source.indexOf('{', colonIndex + 1)
  if (openBraceIndex < 0) {
    return undefined
  }
  const closeBraceIndex = findMatchingBrace(source, openBraceIndex)
  if (closeBraceIndex < 0) {
    return undefined
  }
  return {
    closeBraceIndex,
    keyIndex,
    openBraceIndex,
  }
}

function findMatchingBrace(source: string, openBraceIndex: number) {
  let depth = 0
  let quote: '"' | '\'' | undefined
  let inLineComment = false
  let inBlockComment = false

  for (let i = openBraceIndex; i < source.length; i++) {
    const char = source[i]
    const next = source[i + 1]

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
      }
      continue
    }
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }
    if (quote) {
      if (char === '\\') {
        i++
        continue
      }
      if (char === quote) {
        quote = undefined
      }
      continue
    }
    if (char === '/' && next === '/') {
      inLineComment = true
      i++
      continue
    }
    if (char === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }
    if (char === '"' || char === '\'') {
      quote = char
      continue
    }
    if (char === '{') {
      depth++
      continue
    }
    if (char === '}') {
      depth--
      if (depth === 0) {
        return i
      }
    }
  }

  return -1
}
