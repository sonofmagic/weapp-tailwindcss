import PptxGenJS from 'pptxgenjs'

export const colors = {
  navy: '0B1220',
  panel: '111B30',
  cyan: '38BDF8',
  blue: '2563EB',
  mint: '5EEAD4',
  text: 'F8FAFC',
  muted: 'CBD5E1',
  faint: '94A3B8',
  line: '1E293B',
}

export function createPptx(talkMeta) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'OpenAI Codex'
  pptx.company = 'weapp-tailwindcss'
  pptx.subject = talkMeta.subtitle
  pptx.title = talkMeta.title
  pptx.lang = 'zh-CN'
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'PingFang SC',
    lang: 'zh-CN',
  }
  return pptx
}

export function addBackground(pptx, slide) {
  slide.background = { color: colors.navy }
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    line: { color: colors.navy, transparency: 100 },
    fill: { color: colors.navy },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: -0.6,
    y: -0.8,
    w: 6.2,
    h: 2.4,
    line: { color: colors.blue, transparency: 100 },
    fill: { color: colors.blue, transparency: 48 },
    rotate: -8,
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 9.7,
    y: 5.7,
    w: 4.4,
    h: 2.2,
    line: { color: colors.cyan, transparency: 100 },
    fill: { color: colors.cyan, transparency: 64 },
    rotate: -12,
  })
}

export function addFrame(pptx, slide, talkMeta, index) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 0.5,
    w: 12.23,
    h: 6.45,
    rectRadius: 0.14,
    line: { color: colors.line, pt: 1.2 },
    fill: { color: colors.panel, transparency: 8 },
  })

  slide.addText(`${String(index).padStart(2, '0')}`, {
    x: 11.9,
    y: 0.62,
    w: 0.52,
    h: 0.26,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: colors.faint,
    align: 'right',
  })

  slide.addText(talkMeta.date, {
    x: 0.85,
    y: 6.55,
    w: 1.7,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 9,
    color: colors.faint,
  })

  slide.addText('weapp-tailwindcss live deck', {
    x: 9.55,
    y: 6.55,
    w: 2.55,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 9,
    color: colors.faint,
    align: 'right',
  })
}

export function addTitle(pptx, slide, title, subtitle) {
  slide.addText(title, {
    x: 0.95,
    y: 0.95,
    w: 6.9,
    h: 0.56,
    fontFace: 'PingFang SC',
    fontSize: 22,
    bold: true,
    color: colors.text,
  })
  slide.addText(subtitle, {
    x: 0.98,
    y: 1.55,
    w: 7.1,
    h: 0.32,
    fontFace: 'PingFang SC',
    fontSize: 11.5,
    color: colors.muted,
  })
  slide.addShape(pptx.ShapeType.line, {
    x: 0.98,
    y: 1.96,
    w: 1.35,
    h: 0,
    line: { color: colors.cyan, pt: 2.2 },
  })
}

export function addBullets(slide, bullets) {
  const runs = bullets.flatMap(text => [
    {
      text,
      options: {
        bullet: { indent: 14 },
        breakLine: true,
      },
    },
  ])

  slide.addText(runs, {
    x: 1.05,
    y: 2.18,
    w: 6.25,
    h: 3.65,
    fontFace: 'PingFang SC',
    fontSize: 18,
    color: colors.text,
    breakLine: true,
    paraSpaceAfterPt: 14,
    valign: 'top',
    margin: 0,
  })
}

export function addRightPanel(pptx, slide, data) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.25,
    y: 1.08,
    w: 3.95,
    h: 4.95,
    rectRadius: 0.12,
    line: { color: colors.line, pt: 1 },
    fill: { color: '0D1728', transparency: 0 },
  })

  slide.addText('Live Focus', {
    x: 8.58,
    y: 1.38,
    w: 1.45,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: colors.cyan,
  })

  if (data.highlight) {
    slide.addText(data.highlight, {
      x: 8.58,
      y: 1.76,
      w: 3.02,
      h: 1.24,
      fontFace: 'PingFang SC',
      fontSize: 18,
      bold: true,
      color: colors.text,
      valign: 'mid',
    })
  }

  if (data.note) {
    slide.addText('Speaker Cue', {
      x: 8.58,
      y: data.highlight ? 3.34 : 1.82,
      w: 1.8,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 10,
      bold: true,
      color: colors.mint,
    })
    slide.addText(data.note, {
      x: 8.58,
      y: data.highlight ? 3.62 : 2.12,
      w: 3.0,
      h: 1.6,
      fontFace: 'PingFang SC',
      fontSize: 12,
      color: colors.muted,
      fit: 'shrink',
      valign: 'top',
    })
  }

  slide.addText('Core Chain', {
    x: 8.58,
    y: 4.82,
    w: 1.4,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: colors.mint,
  })
  slide.addText('意图\nAI 类名\nTailwind\nweapp-tailwindcss\n小程序预览', {
    x: 8.58,
    y: 5.08,
    w: 2.2,
    h: 0.84,
    fontFace: 'PingFang SC',
    fontSize: 11,
    color: colors.muted,
    breakLine: true,
    margin: 0,
    paraSpaceAfterPt: 5,
  })
}
