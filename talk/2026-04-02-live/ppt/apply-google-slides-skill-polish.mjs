import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { slides as slideDefinitions } from './slides-data.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')

const EMU = 914400
const TOTAL_SLIDES = slideDefinitions.length
const colors = {
  text: { red: 0.973, green: 0.98, blue: 0.988 },
  muted: { red: 0.698, green: 0.756, blue: 0.827 },
  panel: { red: 0.067, green: 0.106, blue: 0.188 },
  panelAlt: { red: 0.09, green: 0.141, blue: 0.239 },
  track: { red: 0.176, green: 0.243, blue: 0.365 },
  teal: { red: 0.369, green: 0.918, blue: 0.831 },
  red: { red: 0.973, green: 0.443, blue: 0.443 },
  cyan: { red: 0.22, green: 0.741, blue: 0.973 },
  blue: { red: 0.376, green: 0.647, blue: 0.98 },
  mint: { red: 0.369, green: 0.918, blue: 0.831 },
  amber: { red: 0.984, green: 0.749, blue: 0.141 },
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

function createShape(requests, { pageObjectId, objectId, shapeType, x, y, w, h }) {
  requests.push({
    createShape: {
      objectId,
      shapeType,
      elementProperties: {
        pageObjectId,
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
}

function updateShapeFill(requests, objectId, rgbColor, alpha = 1, outlineColor = null, outlineAlpha = 1) {
  const fields = [
    'shapeBackgroundFill.solidFill.color',
    'shapeBackgroundFill.solidFill.alpha',
  ]
  const shapeProperties = {
    shapeBackgroundFill: {
      solidFill: {
        color: { rgbColor },
        alpha,
      },
    },
    outline: {
      propertyState: 'NOT_RENDERED',
    },
  }

  if (outlineColor) {
    shapeProperties.outline = {
      outlineFill: {
        solidFill: {
          color: { rgbColor: outlineColor },
          alpha: outlineAlpha,
        },
      },
      weight: { magnitude: 1, unit: 'PT' },
    }
    fields.push(
      'outline.outlineFill.solidFill.color',
      'outline.outlineFill.solidFill.alpha',
      'outline.weight',
    )
  }
  else {
    fields.push('outline.propertyState')
  }

  requests.push({
    updateShapeProperties: {
      objectId,
      shapeProperties,
      fields: fields.join(','),
    },
  })
}

function insertShapeText(requests, objectId, text, fontSize, color, bold = true) {
  requests.push({
    insertText: {
      objectId,
      insertionIndex: 0,
      text,
    },
  })
  requests.push({
    updateTextStyle: {
      objectId,
      textRange: { type: 'ALL' },
      style: {
        foregroundColor: { opaqueColor: { rgbColor: color } },
        fontFamily: 'Aptos',
        fontSize: { magnitude: fontSize, unit: 'PT' },
        bold,
      },
      fields: 'foregroundColor,fontFamily,fontSize,bold',
    },
  })
}

function bringToFront(requests, objectId) {
  requests.push({
    updatePageElementsZOrder: {
      pageElementObjectIds: [objectId],
      operation: 'BRING_TO_FRONT',
    },
  })
}

function getSectionMeta(pageIndex) {
  if (pageIndex === 1) {
    return { label: 'OPENING', accent: 'teal' }
  }
  if (pageIndex <= 4) {
    return { label: 'FRICTION', accent: 'red' }
  }
  if (pageIndex <= 7) {
    return { label: 'MODEL', accent: 'cyan' }
  }
  if (pageIndex <= 14) {
    return { label: 'PLATFORM', accent: 'blue' }
  }
  if (pageIndex <= 18) {
    return { label: 'AI FLOW', accent: 'mint' }
  }
  return { label: 'SIGNAL', accent: 'amber' }
}

function addSectionBadge(requests, slideId, objectId, label, accentKey) {
  createShape(requests, {
    pageObjectId: slideId,
    objectId,
    shapeType: 'ROUND_RECTANGLE',
    x: 0.52,
    y: 0.18,
    w: 1.46,
    h: 0.34,
  })
  updateShapeFill(requests, objectId, colors.panelAlt, 0.94, colors[accentKey], 1)
  insertShapeText(requests, objectId, label, 9, colors.text)
  bringToFront(requests, objectId)
}

function addPageChip(requests, slideId, objectId, pageIndex) {
  createShape(requests, {
    pageObjectId: slideId,
    objectId,
    shapeType: 'ROUND_RECTANGLE',
    x: 11.26,
    y: 0.18,
    w: 1.54,
    h: 0.34,
  })
  updateShapeFill(requests, objectId, colors.panel, 0.9, colors.track, 0.9)
  insertShapeText(
    requests,
    objectId,
    `${String(pageIndex).padStart(2, '0')} / ${String(TOTAL_SLIDES).padStart(2, '0')}`,
    8.5,
    colors.muted,
    false,
  )
  bringToFront(requests, objectId)
}

function addProgress(requests, slideId, objectIdBase, pageIndex, accentKey) {
  createShape(requests, {
    pageObjectId: slideId,
    objectId: `${objectIdBase}_track`,
    shapeType: 'RECTANGLE',
    x: 0.52,
    y: 7.12,
    w: 12.28,
    h: 0.03,
  })
  updateShapeFill(requests, `${objectIdBase}_track`, colors.track, 0.58)

  createShape(requests, {
    pageObjectId: slideId,
    objectId: `${objectIdBase}_fill`,
    shapeType: 'RECTANGLE',
    x: 0.52,
    y: 7.12,
    w: 12.28 * (pageIndex / TOTAL_SLIDES),
    h: 0.03,
  })
  updateShapeFill(requests, `${objectIdBase}_fill`, colors[accentKey], 0.96)

  createShape(requests, {
    pageObjectId: slideId,
    objectId: `${objectIdBase}_edge`,
    shapeType: 'RECTANGLE',
    x: 12.62,
    y: 1.02,
    w: 0.03,
    h: 5.52,
  })
  updateShapeFill(requests, `${objectIdBase}_edge`, colors[accentKey], 0.24)
}

function addHighlightCard(requests, slideId, objectId, text, accentKey) {
  createShape(requests, {
    pageObjectId: slideId,
    objectId,
    shapeType: 'ROUND_RECTANGLE',
    x: 8.42,
    y: 0.78,
    w: 3.72,
    h: 1.54,
  })
  updateShapeFill(requests, objectId, colors.panel, 0.9, colors[accentKey], 0.72)
  insertShapeText(requests, objectId, text, 12, colors.text)
  requests.push({
    updateParagraphStyle: {
      objectId,
      textRange: { type: 'ALL' },
      style: {
        lineSpacing: 110,
      },
      fields: 'lineSpacing',
    },
  })
  bringToFront(requests, objectId)
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

for (const [index, slide] of (presentation.slides ?? []).entries()) {
  const pageIndex = index + 1
  const slideMeta = slideDefinitions[index]
  const sectionMeta = getSectionMeta(pageIndex)
  const idBase = `skill_v1_${String(pageIndex).padStart(2, '0')}`

  addSectionBadge(requests, slide.objectId, `${idBase}_section`, sectionMeta.label, sectionMeta.accent)
  addPageChip(requests, slide.objectId, `${idBase}_page`, pageIndex)
  addProgress(requests, slide.objectId, `${idBase}_progress`, pageIndex, sectionMeta.accent)

  if (slideMeta?.highlight) {
    addHighlightCard(
      requests,
      slide.objectId,
      `${idBase}_highlight`,
      slideMeta.highlight,
      sectionMeta.accent,
    )
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
    polishedSlides: presentation.slides?.length ?? 0,
    highlightCards: slideDefinitions.filter(slide => slide.highlight).length,
    polishStyle: 'section-label-progress-keynote',
  },
  null,
  2,
)}\n`)
