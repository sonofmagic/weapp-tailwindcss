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
  navy: { red: 0.043, green: 0.071, blue: 0.125 },
  panel: { red: 0.067, green: 0.106, blue: 0.188 },
  cyan: { red: 0.22, green: 0.741, blue: 0.973 },
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

function rawGitHubUrl(relativePath) {
  return `https://raw.githubusercontent.com/sonofmagic/weapp-tailwindcss/main/${relativePath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')}`
}

function buildImageMap() {
  return new Map([
    [
      1,
      {
        path: 'assets/logo-text-colorful.png',
        x: 0.58,
        y: 0.32,
        w: 3.5,
        h: 0.56,
      },
    ],
    [
      8,
      {
        path: 'assets/weapp-tw-plugins.png',
        x: 6.9,
        y: 1.55,
        w: 2.25,
        h: 2.25,
      },
    ],
    [
      9,
      {
        path: 'assets/weapp-tw-frameworks.png',
        x: 6.7,
        y: 1.6,
        w: 2.4,
        h: 2.0,
      },
    ],
    [
      10,
      {
        path: 'website/blog/2025/3/assets/v4-release.png',
        x: 5.65,
        y: 3.75,
        w: 3.95,
        h: 1.24,
      },
    ],
    [
      11,
      {
        path: 'website/static/img/create-project.png',
        x: 6.05,
        y: 1.75,
        w: 3.35,
        h: 1.82,
      },
    ],
    [
      14,
      {
        path: 'website/docs/quick-start/v4/tailwindcss-v4-uniapp-layer.png',
        x: 6.55,
        y: 1.55,
        w: 2.55,
        h: 3.8,
      },
    ],
    [
      18,
      {
        path: 'website/docs/issues/css-vars.jpg',
        x: 6.35,
        y: 1.95,
        w: 3.1,
        h: 2.0,
      },
    ],
    [
      19,
      {
        path: 'website/blog/2025/3/assets/v4-release-square.png',
        x: 6.55,
        y: 1.72,
        w: 2.85,
        h: 2.85,
      },
    ],
    [
      20,
      {
        path: 'website/docs/uni-app-x/assets/run.png',
        x: 6.15,
        y: 1.65,
        w: 3.25,
        h: 2.55,
      },
    ],
  ])
}

const outputInfo = JSON.parse(fs.readFileSync(outputInfoPath, 'utf8'))
const imageMap = buildImageMap()

const presentation = runGws([
  'slides',
  'presentations',
  'get',
  '--params',
  JSON.stringify({
    presentationId: outputInfo.presentationId,
    fields:
      'presentationId,slides(objectId,pageElements(objectId,shape(placeholder(type,index))))',
  }),
])

const slides = presentation.slides ?? []

const requests = []

slides.forEach((slide, idx) => {
  const pageIndex = idx + 1
  const titleShape = slide.pageElements?.find(element =>
    ['TITLE', 'CENTERED_TITLE'].includes(element.shape?.placeholder?.type ?? ''),
  )
  const bodyShape = slide.pageElements?.find(element =>
    ['BODY', 'SUBTITLE'].includes(element.shape?.placeholder?.type ?? ''),
  )

  requests.push({
    updatePageProperties: {
      objectId: slide.objectId,
      pageProperties: {
        pageBackgroundFill: {
          solidFill: {
            color: {
              rgbColor: colors.navy,
            },
            alpha: 1,
          },
        },
      },
      fields: 'pageBackgroundFill.solidFill.color,pageBackgroundFill.solidFill.alpha',
    },
  })

  if (titleShape) {
    requests.push({
      updateTextStyle: {
        objectId: titleShape.objectId,
        textRange: { type: 'ALL' },
        style: {
          foregroundColor: {
            opaqueColor: {
              rgbColor: colors.text,
            },
          },
          bold: true,
          fontFamily: 'Aptos',
          fontSize: {
            magnitude: pageIndex === 1 ? 28 : 22,
            unit: 'PT',
          },
        },
        fields: 'foregroundColor,bold,fontFamily,fontSize',
      },
    })
  }

  if (bodyShape) {
    requests.push({
      updateTextStyle: {
        objectId: bodyShape.objectId,
        textRange: { type: 'ALL' },
        style: {
          foregroundColor: {
            opaqueColor: {
              rgbColor: colors.muted,
            },
          },
          fontFamily: 'Aptos',
          fontSize: {
            magnitude: pageIndex === 1 ? 13 : 13,
            unit: 'PT',
          },
        },
        fields: 'foregroundColor,fontFamily,fontSize',
      },
    })

    requests.push({
      updateParagraphStyle: {
        objectId: bodyShape.objectId,
        textRange: { type: 'ALL' },
        style: {
          lineSpacing: 110,
          spaceBelow: {
            magnitude: 8,
            unit: 'PT',
          },
        },
        fields: 'lineSpacing,spaceBelow',
      },
    })
  }

  if (pageIndex > 1 && bodyShape && imageMap.has(pageIndex)) {
    requests.push({
      updatePageElementTransform: {
        objectId: bodyShape.objectId,
        applyMode: 'ABSOLUTE',
        transform: {
          scaleX: 1.68,
          scaleY: 1.12,
          translateX: emu(0.48),
          translateY: emu(1.28),
          unit: 'EMU',
        },
      },
    })
  }

  const image = imageMap.get(pageIndex)
  if (image) {
    requests.push({
      createImage: {
        objectId: `repo_image_${String(pageIndex).padStart(2, '0')}`,
        url: rawGitHubUrl(image.path),
        elementProperties: {
          pageObjectId: slide.objectId,
          size: {
            width: {
              magnitude: emu(image.w),
              unit: 'EMU',
            },
            height: {
              magnitude: emu(image.h),
              unit: 'EMU',
            },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: emu(image.x),
            translateY: emu(image.y),
            unit: 'EMU',
          },
        },
      },
    })

    requests.push({
      createShape: {
        objectId: `repo_tag_${String(pageIndex).padStart(2, '0')}`,
        shapeType: 'ROUND_RECTANGLE',
        elementProperties: {
          pageObjectId: slide.objectId,
          size: {
            width: {
              magnitude: emu(1.18),
              unit: 'EMU',
            },
            height: {
              magnitude: emu(0.34),
              unit: 'EMU',
            },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: emu(image.x),
            translateY: emu(Math.max(0.98, image.y - 0.42)),
            unit: 'EMU',
          },
        },
      },
    })

    requests.push({
      updateShapeProperties: {
        objectId: `repo_tag_${String(pageIndex).padStart(2, '0')}`,
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: colors.panel,
              },
              alpha: 0.92,
            },
          },
          outline: {
            outlineFill: {
              solidFill: {
                color: {
                  rgbColor: colors.cyan,
                },
                alpha: 1,
              },
            },
            weight: {
              magnitude: 1,
              unit: 'PT',
            },
          },
        },
        fields:
          'shapeBackgroundFill.solidFill.color,shapeBackgroundFill.solidFill.alpha,outline.outlineFill.solidFill.color,outline.outlineFill.solidFill.alpha,outline.weight',
      },
    })

    requests.push({
      insertText: {
        objectId: `repo_tag_${String(pageIndex).padStart(2, '0')}`,
        insertionIndex: 0,
        text: 'Repo Asset',
      },
    })

    requests.push({
      updateTextStyle: {
        objectId: `repo_tag_${String(pageIndex).padStart(2, '0')}`,
        textRange: { type: 'ALL' },
        style: {
          foregroundColor: {
            opaqueColor: {
              rgbColor: colors.text,
            },
          },
          bold: true,
          fontFamily: 'Aptos',
          fontSize: {
            magnitude: 9,
            unit: 'PT',
          },
        },
        fields: 'foregroundColor,bold,fontFamily,fontSize',
      },
    })
  }
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
    themedSlides: slides.length,
    enrichedSlides: imageMap.size,
  },
  null,
  2,
)}\n`)
