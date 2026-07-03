import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'pathe'
import { expect, it } from 'vitest'
import { ensureProjectBuilt } from './projectTest'
import { getProjectCssFiles } from './shared'

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

export function defineBareSelectorRegression(project: ProjectEntry) {
  it('keeps bare element selectors from app css user layers', async () => {
    const projectBase = path.resolve(__dirname, '../demo')
    const root = path.resolve(projectBase, project.name)
    const projectPath = path.resolve(projectBase, project.projectPath)

    if (process.env.E2E_SKIP_BUILD !== '1') {
      await ensureProjectBuilt(root)
    }

    const cssOutputs = await Promise.all(getProjectCssFiles(project).map(async (cssFile) => {
      const css = await readCssWithLocalImports(projectPath, cssFile)
      const buttonAfterBlocks = compactCss(collectCssRuleBlocks(css, 'wx-button::after'))
      const wxButtonBlocks = compactCss(collectCssRuleBlocks(css, 'wx-button'))
      const customElementBlocks = compactCss(collectCssRuleBlocks(css, 'abc'))
      return {
        cssFile,
        buttonAfterBlocks,
        wxButtonBlocks,
        customElementBlocks,
      }
    }))

    const matched = cssOutputs.find(({ buttonAfterBlocks, wxButtonBlocks, customElementBlocks }) => {
      return buttonAfterBlocks.includes('wx-button::after')
        && buttonAfterBlocks.includes('display:none')
        && buttonAfterBlocks.includes('border:none')
        && buttonAfterBlocks.includes('content:""')
        && wxButtonBlocks.includes('background:#000')
        && wxButtonBlocks.includes('background:#444')
        && customElementBlocks.includes('background:#222')
    })

    expect(
      matched,
      `Expected ${project.name} to keep bare selector user CSS in one of: ${cssOutputs.map(item => item.cssFile).join(', ')}`,
    ).toBeTruthy()
  })
}

export const defineTaroBareSelectorRegression = defineBareSelectorRegression
