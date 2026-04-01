import { addBackground, addFrame, colors } from './layout-common.mjs'

export function addCover(pptx, slide, talkMeta, data) {
  addBackground(pptx, slide)
  slide.addText(data.title, {
    x: 0.9,
    y: 1.1,
    w: 5.7,
    h: 0.9,
    fontFace: 'PingFang SC',
    fontSize: 28,
    bold: true,
    color: colors.text,
  })
  slide.addText(data.subtitle, {
    x: 0.92,
    y: 2.12,
    w: 5.8,
    h: 0.4,
    fontFace: 'PingFang SC',
    fontSize: 16,
    color: colors.muted,
  })
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9,
    y: 3.08,
    w: 6.35,
    h: 1.14,
    rectRadius: 0.12,
    line: { color: colors.line, pt: 1 },
    fill: { color: colors.panel, transparency: 6 },
  })
  slide.addText(data.tagline, {
    x: 1.16,
    y: 3.35,
    w: 5.82,
    h: 0.6,
    fontFace: 'PingFang SC',
    fontSize: 13,
    color: colors.text,
    fit: 'shrink',
  })
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.1,
    y: 1.18,
    w: 4.15,
    h: 4.95,
    rectRadius: 0.16,
    line: { color: colors.line, pt: 1.2 },
    fill: { color: '0D1728', transparency: 0 },
  })
  slide.addText('Live Story', {
    x: 8.45,
    y: 1.54,
    w: 1.6,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: colors.cyan,
  })
  slide.addText('痛点重述\n一句话出 UI\n为什么是 Tailwind\n仓库全景\n主 Demo\nSkill 工作流\n进阶技巧\n工程收尾', {
    x: 8.45,
    y: 1.94,
    w: 2.95,
    h: 2.92,
    fontFace: 'PingFang SC',
    fontSize: 17,
    color: colors.text,
    breakLine: true,
    margin: 0,
    paraSpaceAfterPt: 10,
  })
  slide.addText(talkMeta.date, {
    x: 0.92,
    y: 6.35,
    w: 1.5,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    color: colors.faint,
  })
}

export function addClosing(pptx, slide, talkMeta, data, index) {
  addBackground(pptx, slide)
  addFrame(pptx, slide, talkMeta, index)
  slide.addText(data.title, {
    x: 0.95,
    y: 1.18,
    w: 4.9,
    h: 0.62,
    fontFace: 'PingFang SC',
    fontSize: 25,
    bold: true,
    color: colors.text,
  })
  slide.addText(data.subtitle, {
    x: 0.98,
    y: 1.88,
    w: 4.9,
    h: 0.3,
    fontFace: 'PingFang SC',
    fontSize: 13,
    color: colors.muted,
  })
  slide.addText(
    data.bullets.map(text => ({ text: `${text}\n`, options: { breakLine: true } })),
    {
      x: 1.05,
      y: 2.62,
      w: 4.55,
      h: 2.35,
      fontFace: 'PingFang SC',
      fontSize: 20,
      bold: true,
      color: colors.text,
      margin: 0,
      paraSpaceAfterPt: 18,
    },
  )
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.1,
    y: 1.42,
    w: 4.7,
    h: 3.8,
    rectRadius: 0.15,
    line: { color: colors.line, pt: 1 },
    fill: { color: '0D1728', transparency: 0 },
  })
  slide.addText('Takeaway', {
    x: 7.45,
    y: 1.78,
    w: 1.4,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: colors.cyan,
  })
  slide.addText(data.tagline, {
    x: 7.45,
    y: 2.16,
    w: 3.7,
    h: 1.36,
    fontFace: 'PingFang SC',
    fontSize: 17,
    color: colors.text,
    fit: 'shrink',
    valign: 'mid',
  })
}
