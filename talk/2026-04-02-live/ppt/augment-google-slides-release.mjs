import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')

const EMU = 914400
const colors = {
  panel: { red: 0.067, green: 0.106, blue: 0.188 },
  panelAlt: { red: 0.091, green: 0.141, blue: 0.239 },
  cyan: { red: 0.22, green: 0.741, blue: 0.973 },
  mint: { red: 0.369, green: 0.918, blue: 0.831 },
  text: { red: 0.973, green: 0.98, blue: 0.988 },
  muted: { red: 0.796, green: 0.835, blue: 0.882 },
}

function emu(value) {
  return Math.round(value * EMU)
}

function runGws(args) {
  const output = execFileSync('gws', args, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  const lines = output
    .split('\n')
    .filter(line => !line.startsWith('Using keyring backend:'))
    .join('\n')
    .trim()

  return JSON.parse(lines)
}

function createCard(requests, { slideId, idBase, x, y, w, h, title, value, accent = 'cyan' }) {
  requests.push({
    createShape: {
      objectId: `${idBase}_bg`,
      shapeType: 'ROUND_RECTANGLE',
      elementProperties: {
        pageObjectId: slideId,
        size: {
          width: { magnitude: emu(w), unit: 'EMU' },
          height: { magnitude: emu(h), unit: 'EMU' },
        },
        transform: {
          scaleX: 1,
          scaleY: 1,
          translateX: emu(x),
          translateY: emu(y),
          unit: 'EMU',
        },
      },
    },
  })

  requests.push({
    updateShapeProperties: {
      objectId: `${idBase}_bg`,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor: colors.panelAlt },
            alpha: 0.96,
          },
        },
        outline: {
          outlineFill: {
            solidFill: {
              color: { rgbColor: colors[accent] },
              alpha: 1,
            },
          },
          weight: { magnitude: 1, unit: 'PT' },
        },
      },
      fields:
        'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.outlineFill.solidFill.color,outline.outlineFill.solidFill.alpha,outline.weight',
    },
  })

  requests.push({
    insertText: {
      objectId: `${idBase}_bg`,
      insertionIndex: 0,
      text: `${title}\n${value}`,
    },
  })

  requests.push({
    updateTextStyle: {
      objectId: `${idBase}_bg`,
      textRange: { type: 'FIXED_RANGE', startIndex: 0, endIndex: title.length },
      style: {
        foregroundColor: { opaqueColor: { rgbColor: colors.muted } },
        fontFamily: 'Aptos',
        fontSize: { magnitude: 10, unit: 'PT' },
        bold: true,
      },
      fields: 'foregroundColor,fontFamily,fontSize,bold',
    },
  })

  requests.push({
    updateTextStyle: {
      objectId: `${idBase}_bg`,
      textRange: {
        type: 'FIXED_RANGE',
        startIndex: title.length + 1,
        endIndex: title.length + 1 + value.length,
      },
      style: {
        foregroundColor: { opaqueColor: { rgbColor: colors.text } },
        fontFamily: 'Aptos',
        fontSize: { magnitude: 18, unit: 'PT' },
        bold: true,
      },
      fields: 'foregroundColor,fontFamily,fontSize,bold',
    },
  })
}

const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))

const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId: outputInfo.presentationId,
    fields: 'slides(objectId)',
  }),
])

const slides = presentation.slides ?? []
const slideByIndex = new Map(slides.map((slide, idx) => [idx + 1, slide.objectId]))
const requests = []

createCard(requests, {
  slideId: slideByIndex.get(6),
  idBase: 'release2_tailwind_card',
  x: 6.28,
  y: 1.82,
  w: 3.24,
  h: 1.48,
  title: 'Tailwind Signal',
  value: '更适合 AI 的结构化样式语言',
  accent: 'mint',
})

// Slide 9: strengthen matrix slide with repo-derived proof points.
createCard(requests, {
  slideId: slideByIndex.get(9),
  idBase: 'release2_matrix_card1',
  x: 6.5,
  y: 3.85,
  w: 1.48,
  h: 1.08,
  title: 'Build Tools',
  value: '6+',
})

createCard(requests, {
  slideId: slideByIndex.get(9),
  idBase: 'release2_matrix_card2',
  x: 8.08,
  y: 3.85,
  w: 1.48,
  h: 1.08,
  title: 'Story',
  value: '多框架 / 多端',
  accent: 'mint',
})

// Slide 19: benchmark cards.
createCard(requests, {
  slideId: slideByIndex.get(19),
  idBase: 'release2_bench_build',
  x: 6.2,
  y: 4.86,
  w: 1.08,
  h: 1.06,
  title: 'Build',
  value: '961.55ms',
})

createCard(requests, {
  slideId: slideByIndex.get(19),
  idBase: 'release2_bench_hmr',
  x: 7.45,
  y: 4.86,
  w: 1.08,
  h: 1.06,
  title: 'HMR',
  value: '922.91ms',
  accent: 'mint',
})

createCard(requests, {
  slideId: slideByIndex.get(19),
  idBase: 'release2_bench_runtime',
  x: 8.7,
  y: 4.86,
  w: 1.08,
  h: 1.06,
  title: 'Runtime',
  value: '0.0290ms',
})

requests.push({
  createShape: {
    objectId: 'release2_bench_caption',
    shapeType: 'TEXT_BOX',
    elementProperties: {
      pageObjectId: slideByIndex.get(19),
      size: {
        width: { magnitude: emu(3.6), unit: 'EMU' },
        height: { magnitude: emu(0.55), unit: 'EMU' },
      },
      transform: {
        scaleX: 1,
        scaleY: 1,
        translateX: emu(6.18),
        translateY: emu(5.98),
        unit: 'EMU',
      },
    },
  },
})
requests.push({
  insertText: {
    objectId: 'release2_bench_caption',
    insertionIndex: 0,
    text: '统一场景 benchmark，生成时间 2026-02-23',
  },
})
requests.push({
  updateTextStyle: {
    objectId: 'release2_bench_caption',
    textRange: { type: 'ALL' },
    style: {
      foregroundColor: { opaqueColor: { rgbColor: colors.muted } },
      fontFamily: 'Aptos',
      fontSize: { magnitude: 9, unit: 'PT' },
    },
    fields: 'foregroundColor,fontFamily,fontSize',
  },
})

// Slide 12: patch page proof tag.
createCard(requests, {
  slideId: slideByIndex.get(12),
  idBase: 'release2_patch_card',
  x: 6.25,
  y: 4.7,
  w: 3.2,
  h: 1.02,
  title: 'Patch Rule',
  value: '任意值 / JS class 问题优先查 patch',
  accent: 'mint',
})

runGws([
  'slides',
  'presentations',
  'batchUpdate',
  '--params',
  JSON.stringify({ presentationId: outputInfo.presentationId }),
  '--json',
  JSON.stringify({ requests }),
])

process.stdout.write(`${JSON.stringify(
  {
    presentationId: outputInfo.presentationId,
    url: outputInfo.url,
    addedBlocks: 8,
    onlineAssetsAttempted: 0,
  },
  null,
  2,
)}\n`)
