import { execFileSync } from 'node:child_process'
import process from 'node:process'

const [, , presentationId] = process.argv

if (!presentationId) {
  throw new Error('缺少 presentationId')
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

function summarizeObjectId(objectId) {
  if (!objectId) {
    return 'unknown'
  }

  const knownPrefixes = [
    'bg_v2_',
    'hero_v1_',
    'skill_v1_',
    'keynote_v1_',
    'repo_image_',
    'repo_tag_',
  ]

  return knownPrefixes.find(prefix => objectId.startsWith(prefix)) ?? 'default'
}

const deck = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId,
    fields:
      'slides(objectId,pageElements(objectId,shape(placeholder(type,index))))',
  }),
])

const result = (deck.slides ?? []).map((slide, index) => {
  const prefixSummary = {}
  const placeholderSummary = {}

  for (const element of slide.pageElements ?? []) {
    const prefix = summarizeObjectId(element.objectId)
    prefixSummary[prefix] = (prefixSummary[prefix] ?? 0) + 1

    const placeholder = element.shape?.placeholder?.type
    if (placeholder) {
      placeholderSummary[placeholder] = (placeholderSummary[placeholder] ?? 0) + 1
    }
  }

  return {
    page: index + 1,
    elements: slide.pageElements?.length ?? 0,
    prefixes: prefixSummary,
    placeholders: placeholderSummary,
  }
})

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
