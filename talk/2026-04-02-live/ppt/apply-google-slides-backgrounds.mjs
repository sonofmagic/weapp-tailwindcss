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
  line: { red: 0.176, green: 0.243, blue: 0.365 },
  lineStrong: { red: 0.231, green: 0.333, blue: 0.51 },
  beam: { red: 0.22, green: 0.741, blue: 0.973 },
  beamAlt: { red: 0.369, green: 0.918, blue: 0.831 },
  disc: { red: 0.118, green: 0.2, blue: 0.322 },
  bar: { red: 0.145, green: 0.557, blue: 0.737 },
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

function addRect(requests, slideId, objectId, x, y, w, h, fillColor, alpha = 1, rotate = 0) {
  requests.push({
    createShape: {
      objectId,
      shapeType: 'RECTANGLE',
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
      objectId,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor: fillColor },
            alpha,
          },
        },
        outline: {
          propertyState: 'NOT_RENDERED',
        },
      },
      fields:
        'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.propertyState',
    },
  })

  if (rotate !== 0) {
    requests.push({
      updatePageElementTransform: {
        objectId,
        applyMode: 'RELATIVE',
        transform: {
          scaleX: 1,
          scaleY: 1,
          shearX: Math.tan((rotate * Math.PI) / 180),
          shearY: 0,
          translateX: 0,
          translateY: 0,
          unit: 'EMU',
        },
      },
    })
  }

  requests.push({
    updatePageElementsZOrder: {
      pageElementObjectIds: [objectId],
      operation: 'SEND_TO_BACK',
    },
  })
}

function addEllipse(requests, slideId, objectId, x, y, w, h, fillColor, alpha = 1) {
  requests.push({
    createShape: {
      objectId,
      shapeType: 'ELLIPSE',
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
      objectId,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor: fillColor },
            alpha,
          },
        },
        outline: {
          propertyState: 'NOT_RENDERED',
        },
      },
      fields:
        'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.propertyState',
    },
  })

  requests.push({
    updatePageElementsZOrder: {
      pageElementObjectIds: [objectId],
      operation: 'SEND_TO_BACK',
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

const requests = []
const evidenceSlides = new Set([9, 10, 18, 19])

for (const [index, slide] of (presentation.slides ?? []).entries()) {
  const page = index + 1
  const idBase = `bg_v2_${String(page).padStart(2, '0')}`
  const isEvidence = evidenceSlides.has(page)

  if (isEvidence) {
    // Stronger matrix rhythm for evidence/data pages.
    addRect(requests, slide.objectId, `${idBase}_top`, 0.48, 0.74, 12.1, 0.024, colors.lineStrong, 0.42)
    addRect(requests, slide.objectId, `${idBase}_mid1`, 0.48, 2.32, 12.1, 0.016, colors.line, 0.24)
    addRect(requests, slide.objectId, `${idBase}_mid2`, 0.48, 4.92, 12.1, 0.016, colors.line, 0.18)
    addRect(requests, slide.objectId, `${idBase}_left`, 0.82, 0.42, 0.018, 6.4, colors.lineStrong, 0.3)
    addRect(requests, slide.objectId, `${idBase}_right`, 11.94, 0.42, 0.018, 6.4, colors.line, 0.22)

    // Vertical signal bars on the right side.
    addRect(requests, slide.objectId, `${idBase}_bar1`, 10.68, 0.98, 0.06, 5.35, colors.bar, 0.1)
    addRect(requests, slide.objectId, `${idBase}_bar2`, 10.86, 1.28, 0.03, 4.72, colors.beamAlt, 0.18)
    addRect(requests, slide.objectId, `${idBase}_bar3`, 11.08, 1.62, 0.015, 3.88, colors.beam, 0.24)

    // Tighter beams and anchor discs.
    addRect(requests, slide.objectId, `${idBase}_beam1`, -0.2, 5.72, 4.6, 0.16, colors.beam, 0.1, -10)
    addRect(requests, slide.objectId, `${idBase}_beam2`, 8.95, 0.08, 4.0, 0.14, colors.beamAlt, 0.08, -14)
    addEllipse(requests, slide.objectId, `${idBase}_disc1`, 9.85, 5.18, 1.95, 1.95, colors.disc, 0.2)
    addEllipse(requests, slide.objectId, `${idBase}_disc2`, -0.38, -0.18, 1.45, 1.45, colors.disc, 0.12)
  }
  else {
    // Thin developer-conference grid for regular content pages.
    addRect(requests, slide.objectId, `${idBase}_top`, 0.52, 0.78, 12.0, 0.02, colors.line, 0.35)
    addRect(requests, slide.objectId, `${idBase}_mid`, 0.52, 3.68, 12.0, 0.015, colors.line, 0.2)
    addRect(requests, slide.objectId, `${idBase}_left`, 0.86, 0.48, 0.015, 6.3, colors.line, 0.28)
    addRect(requests, slide.objectId, `${idBase}_right`, 11.86, 0.48, 0.015, 6.3, colors.line, 0.2)

    // Soft beams, deliberately subtle.
    addRect(requests, slide.objectId, `${idBase}_beam1`, -0.8, 5.85, 5.2, 0.18, colors.beam, 0.12, -12)
    addRect(requests, slide.objectId, `${idBase}_beam2`, 8.8, -0.45, 4.8, 0.16, colors.beamAlt, 0.1, -15)

    // Structural discs in corners.
    addEllipse(requests, slide.objectId, `${idBase}_disc1`, 9.45, 4.95, 2.3, 2.3, colors.disc, 0.16)
    addEllipse(requests, slide.objectId, `${idBase}_disc2`, -0.55, -0.3, 1.8, 1.8, colors.disc, 0.1)
  }
}

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
    slidesUpdated: presentation.slides?.length ?? 0,
    backgroundStyle: 'developer-conference-light-dual-rhythm',
  },
  null,
  2,
)}\n`)
