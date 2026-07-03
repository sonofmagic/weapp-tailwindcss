import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { expect, it } from 'vitest'
import { ensureProjectBuilt } from './projectTest'

function compactCss(css: string) {
  return css.replace(/\s+/g, '')
}

function collectCssRuleBlocks(css: string, selector: string) {
  const blocks: string[] = []
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g
  for (const match of css.matchAll(rulePattern)) {
    const selectorText = match[1]?.trim() ?? ''
    if (selectorText.startsWith('@')) {
      continue
    }
    const selectorList = selectorText.split(',').map(item => item.trim())
    if (selectorList.includes(selector)) {
      blocks.push(`${selectorText}{${match[2]}}`)
    }
  }
  return blocks.join('\n')
}

async function readCssWithLocalImports(projectPath: string, file: string, seen = new Set<string>()) {
  const filePath = path.resolve(projectPath, file)
  if (seen.has(filePath)) {
    return ''
  }
  seen.add(filePath)
  const css = await fs.readFile(filePath, 'utf8')
  const imports = [...css.matchAll(/@import\s+(?:"([^"]+)"|'([^']+)')/g)]
    .map(match => match[1] ?? match[2])
    .filter((request): request is string => Boolean(request) && !/^(?:[a-z]+:|\/|tailwindcss\b)/i.test(request))
  if (imports.length === 0) {
    return css
  }
  const importedCss = await Promise.all(imports.map(request =>
    readCssWithLocalImports(path.dirname(filePath), request, seen),
  ))
  return `${css}\n${importedCss.join('\n')}`
}

export function defineTaroBareSelectorRegression(project: ProjectEntry) {
  it('keeps bare element selectors from app css user layers', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const css = await readCssWithLocalImports(projectPath, 'dist/app.wxss')
    const normalizedCss = compactCss(css)
    const buttonAfterBlocks = compactCss(collectCssRuleBlocks(css, 'wx-button::after'))

    expect(buttonAfterBlocks).toContain('wx-button::after')
    expect(buttonAfterBlocks).toContain('display:none')
    expect(buttonAfterBlocks).toContain('border:none')
    expect(buttonAfterBlocks).toContain('content:""')
    expect(normalizedCss).toContain('wx-button{background:#000}')
    expect(normalizedCss).toContain('wx-button{background:#444}')
    expect(normalizedCss).toContain('abc{background:#222}')
  })
}
