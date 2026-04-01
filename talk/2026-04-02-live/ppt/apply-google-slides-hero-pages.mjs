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
  cyan: { red: 0.22, green: 0.741, blue: 0.973 },
  mint: { red: 0.369, green: 0.918, blue: 0.831 },
  text: { red: 0.973, green: 0.98, blue: 0.988 },
  muted: { red: 0.796, green: 0.835, blue: 0.882 },
  panel: { red: 0.067, green: 0.106, blue: 0.188 },
  panelAlt: { red: 0.091, green: 0.141, blue: 0.239 },
  deep: { red: 0.031, green: 0.055, blue: 0.102 },
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

function rawGitHubUrl(relativePath) {
  return `https://raw.githubusercontent.com/sonofmagic/weapp-tailwindcss/main/${relativePath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')}`
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

function styleFill(requests, objectId, rgbColor, alpha = 1) {
  requests.push({
    updateShapeProperties: {
      objectId,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor },
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
}

function sendToBack(requests, objectId) {
  requests.push({
    updatePageElementsZOrder: {
      pageElementObjectIds: [objectId],
      operation: 'SEND_TO_BACK',
    },
  })
}

function createBadge(requests, slideId, idBase, x, y, text, accent = 'cyan') {
  createShape(requests, {
    pageObjectId: slideId,
    objectId: `${idBase}_bg`,
    shapeType: 'ROUND_RECTANGLE',
    x,
    y,
    w: 1.66,
    h: 0.36,
  })
  requests.push({
    updateShapeProperties: {
      objectId: `${idBase}_bg`,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor: colors.panelAlt },
            alpha: 0.92,
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
      text,
    },
  })
  requests.push({
    updateTextStyle: {
      objectId: `${idBase}_bg`,
      textRange: { type: 'ALL' },
      style: {
        foregroundColor: { opaqueColor: { rgbColor: colors.text } },
        fontFamily: 'Aptos',
        fontSize: { magnitude: 9, unit: 'PT' },
        bold: true,
      },
      fields: 'foregroundColor,fontFamily,fontSize,bold',
    },
  })
}

function createHeroBeam(requests, slideId, objectId, x, y, w, h, color, alpha, shearX) {
  createShape(requests, {
    pageObjectId: slideId,
    objectId,
    shapeType: 'RECTANGLE',
    x,
    y,
    w,
    h,
  })
  styleFill(requests, objectId, color, alpha)
  requests.push({
    updatePageElementTransform: {
      objectId,
      applyMode: 'RELATIVE',
      transform: {
        scaleX: 1,
        scaleY: 1,
        shearX,
        shearY: 0,
        translateX: 0,
        translateY: 0,
        unit: 'EMU',
      },
    },
  })
  sendToBack(requests, objectId)
}

const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))
const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId: outputInfo.presentationId,
    fields:
      'slides(objectId,pageElements(objectId,shape(placeholder(type,index))))',
  }),
])

const slides = presentation.slides ?? []
const keyPages = new Map([
  [1, { badge: '2026 LIVE', accent: 'cyan' }],
  [8, { badge: 'CORE ENGINE', accent: 'cyan' }],
  [15, { badge: 'AI WORKFLOW', accent: 'mint' }],
  [20, { badge: 'CLOSING', accent: 'mint' }],
])

const requests = []

for (const [pageIndex, meta] of keyPages.entries()) {
  const slide = slides[pageIndex - 1]
  if (!slide) {
    continue
  }

  const idBase = `hero_v1_${String(pageIndex).padStart(2, '0')}`

  createShape(requests, {
    pageObjectId: slide.objectId,
    objectId: `${idBase}_panel`,
    shapeType: 'ROUND_RECTANGLE',
    x: 0.48,
    y: 0.4,
    w: 12.2,
    h: 6.65,
  })
  requests.push({
    updateShapeProperties: {
      objectId: `${idBase}_panel`,
      shapeProperties: {
        shapeBackgroundFill: {
          solidFill: {
            color: { rgbColor: colors.deep },
            alpha: 0.22,
          },
        },
        outline: {
          outlineFill: {
            solidFill: {
              color: { rgbColor: colors.cyan },
              alpha: 0.12,
            },
          },
          weight: { magnitude: 1, unit: 'PT' },
        },
      },
      fields:
        'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.outlineFill.solidFill.color,outline.outlineFill.solidFill.alpha,outline.weight',
    },
  })
  sendToBack(requests, `${idBase}_panel`)

  createHeroBeam(
    requests,
    slide.objectId,
    `${idBase}_beam1`,
    -0.15,
    5.8,
    5.9,
    0.28,
    colors.cyan,
    0.12,
    -0.22,
  )
  createHeroBeam(
    requests,
    slide.objectId,
    `${idBase}_beam2`,
    8.4,
    0.05,
    4.8,
    0.22,
    colors.mint,
    0.09,
    -0.26,
  )

  createShape(requests, {
    pageObjectId: slide.objectId,
    objectId: `${idBase}_disc`,
    shapeType: 'ELLIPSE',
    x: 8.95,
    y: 4.35,
    w: 2.55,
    h: 2.55,
  })
  styleFill(requests, `${idBase}_disc`, colors.panel, 0.26)
  sendToBack(requests, `${idBase}_disc`)

  createShape(requests, {
    pageObjectId: slide.objectId,
    objectId: `${idBase}_ring`,
    shapeType: 'ELLIPSE',
    x: 9.18,
    y: 4.58,
    w: 2.08,
    h: 2.08,
  })
  requests.push({
    updateShapeProperties: {
      objectId: `${idBase}_ring`,
      shapeProperties: {
        shapeBackgroundFill: {
          propertyState: 'NOT_RENDERED',
        },
        outline: {
          outlineFill: {
            solidFill: {
              color: { rgbColor: colors[meta.accent] },
              alpha: 0.35,
            },
          },
          weight: { magnitude: 1.5, unit: 'PT' },
        },
      },
      fields:
        'shapeBackgroundFill.propertyState,outline.outlineFill.solidFill.color,outline.outlineFill.solidFill.alpha,outline.weight',
    },
  })
  sendToBack(requests, `${idBase}_ring`)

  createBadge(requests, slide.objectId, `${idBase}_badge`, 0.82, 0.62, meta.badge, meta.accent)

  if (pageIndex === 1) {
    requests.push({
      createImage: {
        objectId: `${idBase}_logo`,
        url: rawGitHubUrl('assets/logo-text-colorful.png'),
        elementProperties: {
          pageObjectId: slide.objectId,
          size: {
            width: { magnitude: emu(3.68), unit: 'EMU' },
            height: { magnitude: emu(0.6), unit: 'EMU' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: emu(0.82),
            translateY: emu(0.98),
            unit: 'EMU',
          },
        },
      },
    })
  }

  const titleElement = slide.pageElements?.find(element =>
    ['CENTERED_TITLE', 'TITLE'].includes(element.shape?.placeholder?.type ?? ''),
  )
  const bodyElement = slide.pageElements?.find(element =>
    ['SUBTITLE', 'BODY'].includes(element.shape?.placeholder?.type ?? ''),
  )

  if (titleElement) {
    requests.push({
      updateTextStyle: {
        objectId: titleElement.objectId,
        textRange: { type: 'ALL' },
        style: {
          foregroundColor: { opaqueColor: { rgbColor: colors.text } },
          fontFamily: 'Aptos',
          fontSize: { magnitude: pageIndex === 1 ? 30 : 24, unit: 'PT' },
          bold: true,
        },
        fields: 'foregroundColor,fontFamily,fontSize,bold',
      },
    })
  }

  if (bodyElement) {
    requests.push({
      updateTextStyle: {
        objectId: bodyElement.objectId,
        textRange: { type: 'ALL' },
        style: {
          foregroundColor: { opaqueColor: { rgbColor: colors.muted } },
          fontFamily: 'Aptos',
          fontSize: { magnitude: pageIndex === 1 ? 13 : 13, unit: 'PT' },
        },
        fields: 'foregroundColor,fontFamily,fontSize',
      },
    })
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
    heroPages: [...keyPages.keys()],
  },
  null,
  2,
)}\n`)
