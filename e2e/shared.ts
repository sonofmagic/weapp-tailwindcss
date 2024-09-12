import type Page from 'miniprogram-automator/out/Page'
import fs from 'node:fs/promises'
import { execa } from 'execa'
import prettier from 'prettier'
import { removeWxmlId } from '../packages/weapp-tailwindcss/test/util'

export {
  removeWxmlId,
}

export async function loadCss(p: string) {
  const css = await fs.readFile(p, 'utf8')
  const code = await prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
  return code
}

export interface ProjectEntry {
  name: string
  projectPath: string
  testMethod: (page: Page | null, b: string) => void
  url?: string
  skipOpenAutomator?: boolean
}

export function wait(ts = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ts)
  })
}

export function projectFilter(x: ProjectEntry[]) {
  return x
}

export function formatWxml(wxml: string) {
  return prettier.format(wxml, {
    parser: 'html',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

export function twExtract(root: string) {
  return execa('npx', ['tw-patch', 'extract'], {
    cwd: root,
  })
}
