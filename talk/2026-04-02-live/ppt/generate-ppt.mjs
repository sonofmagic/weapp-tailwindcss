import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  addBackground,
  addBullets,
  addFrame,
  addRightPanel,
  addTitle,
  createPptx,
} from './layout-common.mjs'
import { addClosing, addCover } from './layout-special.mjs'
import { slides, talkMeta } from './slides-data.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputPath = path.resolve(__dirname, '..', '2026-04-02-live-deck.pptx')

async function main() {
  const pptx = createPptx(talkMeta)

  slides.forEach((data, index) => {
    const slide = pptx.addSlide()

    if (data.type === 'cover') {
      addCover(pptx, slide, talkMeta, data)
      return
    }

    if (data.type === 'closing') {
      addClosing(pptx, slide, talkMeta, data, index + 1)
      return
    }

    addBackground(pptx, slide)
    addFrame(pptx, slide, talkMeta, index + 1)
    addTitle(pptx, slide, data.title, data.subtitle)
    addBullets(slide, data.bullets)
    addRightPanel(pptx, slide, data)
  })

  await pptx.writeFile({ fileName: outputPath })

  process.stdout.write(`${outputPath}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
