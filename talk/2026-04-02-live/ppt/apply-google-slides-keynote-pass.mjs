import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')
const keynoteLayoutOverridesPath = path.resolve(__dirname, 'keynote-layout-overrides.json')

const EMU = 914400
const colors = {
  text: { red: 0.973, green: 0.98, blue: 0.988 },
  muted: { red: 0.761, green: 0.812, blue: 0.882 },
  panel: { red: 0.055, green: 0.086, blue: 0.157 },
  panelAlt: { red: 0.071, green: 0.114, blue: 0.2 },
  cyan: { red: 0.22, green: 0.741, blue: 0.973 },
  mint: { red: 0.369, green: 0.918, blue: 0.831 },
  amber: { red: 0.984, green: 0.749, blue: 0.141 },
  red: { red: 0.973, green: 0.443, blue: 0.443 },
}

const keynotePages = new Map([
  [
    2,
    {
      accent: 'red',
      kicker: 'FRICTION',
      headline: '样式开发不该\n吃掉业务时间',
      subline: '把像素劳动，换成意图表达。',
      metric: 'TIME',
    },
  ],
  [
    4,
    {
      accent: 'cyan',
      kicker: 'SHIFT',
      headline: '以前写像素\n现在写意图',
      subline: '工作流切换，效率才会跳变。',
      metric: 'INTENT',
    },
  ],
  [
    7,
    {
      accent: 'cyan',
      kicker: 'MODEL',
      headline: 'AI 先写 Tailwind\n再去小程序',
      subline: '职责拆开，链路才稳定。',
      metric: '3-LAYER',
    },
  ],
  [
    18,
    {
      accent: 'amber',
      kicker: 'SIGNAL',
      headline: '能跑不等于\n可验证',
      subline: '真正的工程信号，是反馈速度和可比较性。',
      metric: 'VERIFY',
    },
  ],
])

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

function deleteObject(requests, objectId) {
  requests.push({
    deleteObject: {
      objectId,
    },
  })
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

function styleShape(requests, objectId, fillColor, alpha = 1, outlineColor = null, outlineAlpha = 1) {
  const shapeProperties = {
    shapeBackgroundFill: {
      solidFill: {
        color: { rgbColor: fillColor },
        alpha,
      },
    },
    outline: {
      propertyState: 'NOT_RENDERED',
    },
  }
  const fields = [
    'shapeBackgroundFill.solidFill.color',
    'shapeBackgroundFill.solidFill.alpha',
    'outline.propertyState',
  ]

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
    fields.splice(2, 1, 'outline.outlineFill.solidFill.color', 'outline.outlineFill.solidFill.alpha', 'outline.weight')
  }

  requests.push({
    updateShapeProperties: {
      objectId,
      shapeProperties,
      fields: fields.join(','),
    },
  })
}

function insertText(requests, objectId, text) {
  requests.push({
    insertText: {
      objectId,
      insertionIndex: 0,
      text,
    },
  })
}

function updateTextStyle(requests, objectId, options) {
  requests.push({
    updateTextStyle: {
      objectId,
      textRange: { type: 'ALL' },
      style: options,
      fields: Object.keys(options).join(','),
    },
  })
}

function updateParagraphStyle(requests, objectId, options) {
  requests.push({
    updateParagraphStyle: {
      objectId,
      textRange: { type: 'ALL' },
      style: options,
      fields: Object.keys(options).join(','),
    },
  })
}

function sendToFront(requests, objectId) {
  requests.push({
    updatePageElementsZOrder: {
      pageElementObjectIds: [objectId],
      operation: 'BRING_TO_FRONT',
    },
  })
}

function createTextBox(requests, pageObjectId, objectId, x, y, w, h, text, style, paragraphStyle) {
  createShape(requests, { pageObjectId, objectId, shapeType: 'TEXT_BOX', x, y, w, h })
  styleShape(requests, objectId, colors.panelAlt, 0)
  insertText(requests, objectId, text)
  updateTextStyle(requests, objectId, style)
  if (paragraphStyle) {
    updateParagraphStyle(requests, objectId, paragraphStyle)
  }
  sendToFront(requests, objectId)
}

const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))
const keynoteLayoutOverrides = JSON.parse(fs.readFileSync(keynoteLayoutOverridesPath, 'utf8'))
const presentationId = process.argv[2] ?? outputInfo.presentationId
const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId,
    fields: 'slides(objectId,pageElements(objectId,shape(placeholder(type,index))))',
  }),
])

const requests = []

for (const [index, slide] of (presentation.slides ?? []).entries()) {
  const pageIndex = index + 1
  const meta = keynotePages.get(pageIndex)
  if (!meta) {
    continue
  }

  const accent = colors[meta.accent]
  const pageId = String(pageIndex).padStart(2, '0')
  const idBase = `keynote_v5_${pageId}`
  const pageElements = slide.pageElements ?? []
  const elementIds = new Set(pageElements.map(element => element.objectId))
  const layout = keynoteLayoutOverrides[String(pageIndex)] ?? {
    kicker: { x: 0.6, y: 1.88, w: 12.1, h: 0.4 },
    headline: { x: 0.85, y: 2.42, w: 11.6, h: 1.78 },
    subline: { x: 1.4, y: 5.18, w: 10.5, h: 0.62 },
  }

  for (const objectId of [
    `keynote_v1_${pageId}_panel`,
    `keynote_v1_${pageId}_beam`,
    `keynote_v1_${pageId}_kicker`,
    `keynote_v1_${pageId}_headline`,
    `keynote_v1_${pageId}_subline`,
    `keynote_v1_${pageId}_metric_bg`,
    `keynote_v1_${pageId}_metric`,
    `keynote_v2_${pageId}_panel`,
    `keynote_v2_${pageId}_beam`,
    `keynote_v2_${pageId}_kicker`,
    `keynote_v2_${pageId}_headline`,
    `keynote_v2_${pageId}_subline`,
    `keynote_v2_${pageId}_metric_bg`,
    `keynote_v2_${pageId}_metric`,
    `keynote_v3_${pageId}_panel`,
    `keynote_v3_${pageId}_beam`,
    `keynote_v3_${pageId}_kicker`,
    `keynote_v3_${pageId}_headline`,
    `keynote_v3_${pageId}_subline`,
    `keynote_v3_${pageId}_metric_bg`,
    `keynote_v3_${pageId}_metric`,
    `keynote_v4_${pageId}_panel`,
    `keynote_v4_${pageId}_beam`,
    `keynote_v4_${pageId}_kicker`,
    `keynote_v4_${pageId}_headline`,
    `keynote_v4_${pageId}_subline`,
    `keynote_v4_${pageId}_metric_bg`,
    `keynote_v4_${pageId}_metric`,
    `keynote_v5_${pageId}_kicker`,
    `keynote_v5_${pageId}_headline`,
    `keynote_v5_${pageId}_subline`,
    `repo_image_${pageId}`,
    `repo_tag_${pageId}`,
    `skill_v1_${pageId}_section`,
    `skill_v1_${pageId}_highlight`,
  ]) {
    if (elementIds.has(objectId)) {
      deleteObject(requests, objectId)
    }
  }

  for (const element of pageElements) {
    const placeholderType = element.shape?.placeholder?.type
    if (['TITLE', 'BODY'].includes(placeholderType ?? '')) {
      deleteObject(requests, element.objectId)
    }
  }

  createTextBox(
    requests,
    slide.objectId,
    `${idBase}_kicker`,
    layout.kicker.x,
    layout.kicker.y,
    layout.kicker.w,
    layout.kicker.h,
    meta.kicker,
    {
      foregroundColor: { opaqueColor: { rgbColor: accent } },
      fontFamily: 'Aptos',
      fontSize: { magnitude: 10, unit: 'PT' },
      bold: true,
    },
    { alignment: 'CENTER', spacingMode: 'NEVER_COLLAPSE' },
  )

  createTextBox(
    requests,
    slide.objectId,
    `${idBase}_headline`,
    layout.headline.x,
    layout.headline.y,
    layout.headline.w,
    layout.headline.h,
    layout.headlineText ?? meta.headline,
    {
      foregroundColor: { opaqueColor: { rgbColor: colors.text } },
      fontFamily: 'Aptos Display',
      fontSize: { magnitude: 30, unit: 'PT' },
      bold: true,
    },
    {
      alignment: 'CENTER',
      lineSpacing: 98,
      spaceBelow: { magnitude: 2, unit: 'PT' },
    },
  )

  createTextBox(
    requests,
    slide.objectId,
    `${idBase}_subline`,
    layout.subline.x,
    layout.subline.y,
    layout.subline.w,
    layout.subline.h,
    meta.subline,
    {
      foregroundColor: { opaqueColor: { rgbColor: colors.muted } },
      fontFamily: 'Aptos',
      fontSize: { magnitude: 12, unit: 'PT' },
      bold: false,
    },
    {
      alignment: 'CENTER',
      lineSpacing: 110,
    },
  )
}

runGws([
  'slides',
  'presentations',
  'batchUpdate',
  '--params',
  JSON.stringify({ presentationId }),
  '--json',
  JSON.stringify({ requests }),
])

process.stdout.write(`${JSON.stringify(
  {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    keynotePages: [...keynotePages.keys()],
    keynoteStyle: 'minimal-centered-statement',
  },
  null,
  2,
)}\n`)
