import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { slides, talkMeta } from './slides-data.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outPath = path.resolve(__dirname, '..', 'google-slides-output.json')

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

function getTitleSlidePlaceholders(presentation) {
  const firstSlide = presentation.slides?.[0]
  const pageElements = firstSlide?.pageElements ?? []

  let titleId = ''
  let subtitleId = ''

  for (const element of pageElements) {
    const placeholderType = element.shape?.placeholder?.type
    if (placeholderType === 'CENTERED_TITLE' || placeholderType === 'TITLE') {
      titleId = element.objectId
    }
    if (placeholderType === 'SUBTITLE') {
      subtitleId = element.objectId
    }
  }

  if (!titleId || !subtitleId) {
    throw new Error('无法识别标题页占位符。')
  }

  return { titleId, subtitleId }
}

function createBodyText(slide) {
  const lines = [slide.subtitle, '', ...slide.bullets.map(item => `• ${item}`)]
  if (slide.note) {
    lines.push('', `备注：${slide.note}`)
  }
  if (slide.highlight) {
    lines.push('', `强调：${slide.highlight}`)
  }
  if (slide.tagline) {
    lines.push('', slide.tagline)
  }
  return lines.join('\n')
}

function buildRequests(firstSlidePlaceholders) {
  const requests = [
    {
      insertText: {
        objectId: firstSlidePlaceholders.titleId,
        text: slides[0].title,
        insertionIndex: 0,
      },
    },
    {
      insertText: {
        objectId: firstSlidePlaceholders.subtitleId,
        text: `${slides[0].subtitle}\n${slides[0].tagline}`,
        insertionIndex: 0,
      },
    },
  ]

  slides.slice(1).forEach((slide, index) => {
    const pageIndex = index + 2
    const slideObjectId = `live_slide_${String(pageIndex).padStart(2, '0')}`
    const titleObjectId = `${slideObjectId}_title`
    const bodyObjectId = `${slideObjectId}_body`

    requests.push({
      createSlide: {
        objectId: slideObjectId,
        insertionIndex: index + 1,
        slideLayoutReference: {
          predefinedLayout: 'TITLE_AND_BODY',
        },
        placeholderIdMappings: [
          {
            layoutPlaceholder: {
              type: 'TITLE',
              index: 0,
            },
            objectId: titleObjectId,
          },
          {
            layoutPlaceholder: {
              type: 'BODY',
              index: 0,
            },
            objectId: bodyObjectId,
          },
        ],
      },
    })

    requests.push({
      insertText: {
        objectId: titleObjectId,
        text: slide.title,
        insertionIndex: 0,
      },
    })

    requests.push({
      insertText: {
        objectId: bodyObjectId,
        text: createBodyText(slide),
        insertionIndex: 0,
      },
    })
  })

  return requests
}

const presentationTitle = `${talkMeta.title}｜${talkMeta.subtitle}`

const created = runGws([
  'slides',
  'presentations',
  'create',
  '--json',
  JSON.stringify({ title: presentationTitle }),
])

const presentationId = created.presentationId

const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId,
    fields:
      'presentationId,title,slides(objectId,pageElements(objectId,shape(placeholder(type,index))))',
  }),
])

const firstSlidePlaceholders = getTitleSlidePlaceholders(presentation)
const requests = buildRequests(firstSlidePlaceholders)

runGws([
  'slides',
  'presentations',
  'batchUpdate',
  '--params',
  JSON.stringify({ presentationId }),
  '--json',
  JSON.stringify({ requests }),
])

const result = {
  title: presentationTitle,
  presentationId,
  url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  slideCount: slides.length,
}

fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
