import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')
const keynoteLayoutOverridesPath = path.resolve(__dirname, 'keynote-layout-overrides.json')

const DEFAULT_LAYOUT = {
  kicker: { x: 0.6, y: 1.88, w: 12.1, h: 0.4 },
  headline: { x: 0.85, y: 2.42, w: 11.6, h: 1.78 },
  subline: { x: 1.4, y: 5.18, w: 10.5, h: 0.62 },
}

function formatSlideId(page) {
  return `live_slide_${String(page).padStart(2, '0')}`
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
}

function parsePageArg(value, slideCount) {
  const page = Number.parseInt(value ?? '', 10)

  if (!Number.isInteger(page) || page < 1 || page > slideCount) {
    throw new Error(`页号无效，应为 1 到 ${slideCount} 之间的整数`)
  }

  return page
}

const outputInfo = readJson(outputInfoPath)
const keynoteLayoutOverrides = readJson(keynoteLayoutOverridesPath)
const page = parsePageArg(process.argv[2], outputInfo.slideCount)
const presentationId = process.argv[3] ?? outputInfo.presentationId
const slideId = formatSlideId(page)
const override = keynoteLayoutOverrides[String(page)] ?? null
const effectiveLayout = override
  ? {
      ...DEFAULT_LAYOUT,
      ...override,
    }
  : DEFAULT_LAYOUT

const result = {
  page,
  slideId,
  presentationId,
  editorUrl: `https://docs.google.com/presentation/d/${presentationId}/edit?slide=id.${slideId}#slide=id.${slideId}`,
  hasOverride: Boolean(override),
  override,
  effectiveLayout,
  commands: {
    apply: `node talk/2026-04-02-live/ppt/apply-google-slides-keynote-pass.mjs ${presentationId}`,
    inspect: `node talk/2026-04-02-live/ppt/inspect-google-slides-layout.mjs ${presentationId}`,
    links: 'node talk/2026-04-02-live/ppt/print-google-slides-calibration-links.mjs',
  },
  nextStep: [
    '打开 editorUrl，只看 Google Slides 编辑器画布。',
    '如果主标题偏右，优先左移 headline.x；如果断行不稳，再改 headline.w 或 headlineText。',
    '修改 keynote-layout-overrides.json 后，重新执行 commands.apply。',
  ],
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
