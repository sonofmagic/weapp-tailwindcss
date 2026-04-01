import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')
const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))

const slideIds = [
  'live_slide_02',
  'live_slide_04',
  'live_slide_07',
  'live_slide_18',
]

const links = slideIds.map(slideId => ({
  slideId,
  url: `${outputInfo.url}?slide=id.${slideId}#slide=id.${slideId}`,
}))

process.stdout.write(`${JSON.stringify(links, null, 2)}\n`)
