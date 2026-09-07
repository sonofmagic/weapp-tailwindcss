import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import { JSDOM } from 'jsdom'
import postcss from 'postcss'
import { expect, it } from 'vitest'
import { runPnpm } from './hbuilderx-local/process'

const project = 'uni-app-x-vdom-tailwindcss-v4'
const filter = process.env['E2E_PROJECT_FILTER']
const enabled = process.env['E2E_ISSUE_1160_MINI'] === '1' && (!filter || new RegExp(filter).test(project))
const selectorParser = createRequire(path.resolve(__dirname, '../packages/postcss/package.json'))('postcss-selector-parser')

it.skipIf(!enabled)('issue #1160 preserves component border defaults in HBuilderX mini output', async () => {
  const projectRoot = path.resolve(__dirname, '../demo', project)
  await runPnpm(path.resolve(__dirname, '..'), ['exec', 'hbuilderx', 'launch', 'mp-weixin', '--project', projectRoot, '--compile', 'true'], 120_000)
  const output = path.join(projectRoot, 'unpackage/dist/dev/mp-weixin')
  const files = await fg('**/*.wxml', { cwd: output, absolute: true })
  const evidence: Record<string, string[]> = {}
  for (const file of files.sort()) {
    const wxml = await readFile(file, 'utf8')
    if (!wxml.includes('id="issue-1160-original"')) {
      continue
    }
    const css = postcss.parse(await readFile(path.join(path.dirname(file), `${path.parse(file).name}.wxss`), 'utf8'))
    const fragment = JSDOM.fragment(wxml)
    for (const element of fragment.querySelectorAll('[id^="issue-1160-"]')) {
      const classes = new Set(element.classList)
      expect(classes).toContain('weapp-tw-border')
      const declarations: string[] = []
      css.walkRules((rule) => {
        let matched = false
        selectorParser((selectors: any) => {
          selectors.each((selector: any) => {
            if (selector.nodes.every((part: any) => part.type === 'class' && classes.has(part.value))) {
              matched = true
            }
          })
        }).processSync(rule.selector)
        if (matched) {
          rule.walkDecls((decl) => {
            if (decl.prop.startsWith('border') || decl.prop === '--tw-border-style') {
              declarations.push(`${decl.prop}:${decl.value}`)
            }
          })
        }
      })
      expect(declarations[0]).toBe('border-width:0')
      evidence[element.id] = declarations
    }
  }
  expect(Object.keys(evidence)).toHaveLength(12)
  for (const id of ['original', 'native', 'top', 'apply']) {
    expect(evidence[`issue-1160-${id}`]).toContain('border-top-width:1px')
  }
  expect(evidence['issue-1160-pair']).toContain('border-left-width:2px')
  expect(evidence['issue-1160-override']).toContain('border-top-width:0px')
  await expect(`${JSON.stringify(evidence, null, 2)}\n`).toMatchFileSnapshot('__snapshots__/issue-1160/mini-borders.json')
}, 150_000)
