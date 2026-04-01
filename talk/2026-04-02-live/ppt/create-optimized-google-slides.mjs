import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')
const backupDir = path.resolve(talkDir, 'google-slides-history')

function runNodeScript(relativePath) {
  return execFileSync('node', [relativePath], {
    cwd: path.resolve(__dirname, '../../..'),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

fs.mkdirSync(backupDir, { recursive: true })

if (fs.existsSync(outputInfoPath)) {
  const current = safeReadJson(outputInfoPath)
  const safeTitle = current.title.replace(/[^\w\u4E00-\u9FA5-]+/g, '-')
  const backupPath = path.join(
    backupDir,
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${safeTitle}.json`,
  )
  fs.copyFileSync(outputInfoPath, backupPath)
}

const steps = [
  'talk/2026-04-02-live/ppt/push-google-slides.mjs',
  'talk/2026-04-02-live/ppt/sync-google-slides-notes.mjs',
  'talk/2026-04-02-live/ppt/enhance-google-slides.mjs',
  'talk/2026-04-02-live/ppt/augment-google-slides-release.mjs',
  'talk/2026-04-02-live/ppt/apply-google-slides-backgrounds.mjs',
]

for (const step of steps) {
  runNodeScript(step)
}

const finalOutput = safeReadJson(outputInfoPath)
process.stdout.write(
  `${JSON.stringify({ ...finalOutput, recipe: 'recipe-create-presentation' }, null, 2)}\n`,
)
