const path = require('node:path')
const fs = require('fs-extra')
const klaw = require('klaw')

const targetDir = path.resolve(__dirname, 'docx')
const sourceDocsDir = path.resolve(__dirname, '../docs')

/** 匹配 .md 文件扩展名 */
const MD_EXTENSION_RE = /\.md$/

async function main() {
  await fs.ensureDir(targetDir)
  const { execa } = await import('execa')
  for await (const file of klaw(sourceDocsDir)) {
    const p = file.path.replace(sourceDocsDir, '')
    // const docxFilename = `${path.basename(p, '.md')}.docx`
    if (file.stats.isFile() && p.endsWith('.md') && !p.startsWith('/api')) {
      const target = `scripts/docx${p.replace(MD_EXTENSION_RE, '.docx')}`
      await fs.ensureDir(path.dirname(target))
      const { stdout } = await execa`pandoc -s ${file.path}  -o ${target}`
      console.log(stdout)
    }
  }
}

main()
