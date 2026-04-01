import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const talkDir = path.resolve(__dirname, '..')
const outputInfoPath = path.resolve(talkDir, 'google-slides-output.json')
const slideScriptPath = path.resolve(talkDir, 'slide-script.md')
const slideSectionPattern = /## 第 (\d+) 页[\s\S]*?(?=\n## 第 \d+ 页|\n## 讲者备注|$)/g
const titleLinePattern = /^## 第 \d+ 页\s*/

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

function extractSection(block, label) {
  const pattern = new RegExp(`### ${label}\\n\\n([\\s\\S]*?)(?=\\n### |\\n---|$)`)
  const match = block.match(pattern)
  return match?.[1]?.trim() ?? ''
}

function parseNotes(markdown) {
  const matches = [...markdown.matchAll(slideSectionPattern)]

  return matches.map((match) => {
    const index = Number(match[1])
    const block = match[0]
    const titleLine = block.split('\n')[0].replace(titleLinePattern, '').trim()
    const speaking = extractSection(block, '要讲的话')
    const duration = extractSection(block, '停留时间')
    const action = extractSection(block, '操作')

    const chunks = []
    if (titleLine) {
      chunks.push(`标题：${titleLine}`)
    }
    if (speaking) {
      chunks.push(`要讲的话：\n${speaking}`)
    }
    if (duration) {
      chunks.push(`停留时间：${duration}`)
    }
    if (action) {
      chunks.push(`操作：${action}`)
    }

    return {
      index,
      noteText: chunks.join('\n\n'),
    }
  })
}

const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))
const markdown = fs.readFileSync(slideScriptPath, 'utf8')
const notes = parseNotes(markdown)

const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId: outputInfo.presentationId,
    fields:
      'presentationId,slides(objectId,slideProperties(notesPage(notesProperties(speakerNotesObjectId),pageElements(objectId,shape(text(textElements(endIndex)))))))',
  }),
])

const slideList = presentation.slides ?? []

if (slideList.length !== notes.length) {
  throw new Error(`页数不匹配：presentation=${slideList.length} notes=${notes.length}`)
}

const requests = notes.flatMap((note, idx) => {
  const notesPage = slideList[idx]?.slideProperties?.notesPage
  const speakerNotesObjectId = notesPage?.notesProperties?.speakerNotesObjectId

  if (!speakerNotesObjectId) {
    throw new Error(`第 ${idx + 1} 页缺少 speakerNotesObjectId`)
  }

  const noteShape = (notesPage?.pageElements ?? []).find(
    element => element.objectId === speakerNotesObjectId,
  )
  const textElements = noteShape?.shape?.text?.textElements ?? []
  const lastEndIndex = textElements.at(-1)?.endIndex ?? 0

  const slideRequests = []

  // Google Slides notes placeholders may start empty; only delete when there is real content.
  if (lastEndIndex > 1) {
    slideRequests.push({
      deleteText: {
        objectId: speakerNotesObjectId,
        textRange: {
          type: 'FIXED_RANGE',
          startIndex: 0,
          endIndex: lastEndIndex - 1,
        },
      },
    })
  }

  slideRequests.push({
    insertText: {
      objectId: speakerNotesObjectId,
      insertionIndex: 0,
      text: note.noteText,
    },
  })

  return slideRequests
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
    notesUpdated: notes.length,
    url: outputInfo.url,
  },
  null,
  2,
)}\n`)
