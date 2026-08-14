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
const unsupportedTailwindVersion = /Tailwind\s*CSS\s*(?:@|v)?[23]\b/i
const retiredDocs = [
  'community/typography.md',
  'issues/v1.md',
  'migrations/v1.md',
  'migrations/v2.md',
  'principle/index.md',
  'quick-start/build-or-import-outside-components.md',
  'quick-start/frameworks/uni-app.mdx',
  'quick-start/v2/index.mdx',
  'quick-start/v4/UniAppHbuilderShared.mdx',
  'quick-start/v4/UniappCliStyle.mdx',
  'quick-start/v4/UniappHbuilderStyle.mdx',
  'quick-start/v4/mpx.mdx',
  'quick-start/v4/readme.md',
  'quick-start/v4/taro-vite.mdx',
  'quick-start/v4/taro-webpack.mdx',
  'quick-start/v4/uni-app-vite-hbuilder.mdx',
  'quick-start/v4/uni-app-vite.mdx',
  'quick-start/v4/uni-app-webpack.mdx',
  'quick-start/v4/uni-app-x.mdx',
  'quick-start/v4/weapp-vite.mdx',
  'releases/v2.md',
  'tailwindcss-maintenance-book.md',
  'upgrade/uni-app.md',
]

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
const unsupportedVersionDocs = [
  ...chineseFiles.map(file => ({ file, root: chineseRoot, locale: 'Chinese' })),
  ...englishFiles.map(file => ({ file, root: englishRoot, locale: 'English' })),
].filter(({ file, root }) => {
  return unsupportedTailwindVersion.test(visibleContent(fs.readFileSync(path.join(root, file), 'utf8')))
})
const retiredDocsPresent = [
  ...retiredDocs.map(file => ({ file, root: chineseRoot, locale: 'Chinese' })),
  ...retiredDocs.map(file => ({ file, root: englishRoot, locale: 'English' })),
].filter(({ file, root }) => fs.existsSync(path.join(root, file)))

if (missing.length || extra.length || untranslated.length || unsupportedVersionDocs.length || retiredDocsPresent.length) {
  if (missing.length) {
    console.error(`Missing English docs:\n${missing.join('\n')}`)
  }
  if (extra.length) {
    console.error(`English docs without a Chinese source:\n${extra.join('\n')}`)
  }
  if (untranslated.length) {
    console.error(`English docs containing Han characters:\n${untranslated.join('\n')}`)
  }
  if (unsupportedVersionDocs.length) {
    console.error(`Current docs referencing unsupported Tailwind CSS versions:\n${unsupportedVersionDocs.map(({ file, locale }) => `${locale}: ${file}`).join('\n')}`)
  }
  if (retiredDocsPresent.length) {
    console.error(`Retired docs must not be restored:\n${retiredDocsPresent.map(({ file, locale }) => `${locale}: ${file}`).join('\n')}`)
  }
  process.exitCode = 1
}
else {
  console.log(`Docs localization is complete: ${chineseFiles.length} Chinese/English file pairs.`)
}
