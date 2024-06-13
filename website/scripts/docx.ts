import path from 'pathe'
import fs from 'fs-extra'
import klaw from 'klaw'
import { execa } from 'execa'

const targetDir = path.resolve(__dirname, 'docx')
const sourceDocsDir = path.resolve(__dirname, '../docs')

async function main() {
  await fs.ensureDir(targetDir)
  // const { execa } = await import('execa')
  for await (const file of klaw(sourceDocsDir)) {
    file.path = path.normalize(file.path)
    const p = file.path.replace(sourceDocsDir, '')
    // const docxFilename = `${path.basename(p, '.md')}.docx`
    if (file.stats.isFile() && p.endsWith('.md') && !p.startsWith('/api')) {
      const target = `scripts/docx${p.replace(/\.md$/, '.docx')}`
      await fs.ensureDir(path.dirname(target))
      const { stdout } = await execa`pandoc -s ${file.path}  -o ${target}`
      console.log(stdout)
    }
  }
}

main()
