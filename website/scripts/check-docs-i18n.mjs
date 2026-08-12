import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const websiteRoot = path.resolve(currentDir, '..')
const chineseRoot = path.join(websiteRoot, 'docs')
const englishRoot = path.join(websiteRoot, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current')
const markdownExtension = /\.mdx?$/i
const hanCharacter = /[\u3400-\u9FFF\uF900-\uFAFF]/

function collectMarkdownFiles(root, current = root) {
  const files = []
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolutePath = path.join(current, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(root, absolutePath))
    }
    else if (markdownExtension.test(entry.name)) {
      files.push(path.relative(root, absolutePath).split(path.sep).join('/'))
    }
  }
  return files.sort()
}

const chineseFiles = collectMarkdownFiles(chineseRoot)
const englishFiles = collectMarkdownFiles(englishRoot)
const chineseSet = new Set(chineseFiles)
const englishSet = new Set(englishFiles)
const missing = chineseFiles.filter(file => !englishSet.has(file))
const extra = englishFiles.filter(file => !chineseSet.has(file))
function visibleContent(value) {
  return value
    .replace(/^---\n(?:.*\n)*?---\s*/m, '')
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/https?:\/\/[^\s)>]+/g, '')
}

const untranslated = englishFiles.filter((file) => {
  return hanCharacter.test(visibleContent(fs.readFileSync(path.join(englishRoot, file), 'utf8')))
})

if (missing.length || extra.length || untranslated.length) {
  if (missing.length) {
    console.error(`Missing English docs:\n${missing.join('\n')}`)
  }
  if (extra.length) {
    console.error(`English docs without a Chinese source:\n${extra.join('\n')}`)
  }
  if (untranslated.length) {
    console.error(`English docs containing Han characters:\n${untranslated.join('\n')}`)
  }
  process.exitCode = 1
}
else {
  console.log(`Docs localization is complete: ${chineseFiles.length} Chinese/English file pairs.`)
}
