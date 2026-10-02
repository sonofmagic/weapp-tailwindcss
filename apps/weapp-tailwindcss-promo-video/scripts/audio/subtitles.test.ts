import { describe, expect, it } from 'vitest'
import { canonicalText, createCues, serializeCues, timestamp } from './subtitles'

describe('词级字幕对齐', () => {
  it('字幕使用真实语音边界，保留短语之间的停顿', () => {
    const cues = createCues([{ id: 'example', duration: 4, start: 10.5, text: 'Tailwind CSS 4，开始构建。', words: [
      { text: 'Tailwind', start: 0.1, end: 0.6 },
      { text: 'CSS', start: 0.7, end: 1.1 },
      { text: '四', start: 1.2, end: 1.4 },
      { text: '开始', start: 2.1, end: 2.5 },
      { text: '构建', start: 2.6, end: 3.1 },
    ] }])
    expect(cues).toEqual([{ start: 10.6, end: 11.9, text: 'Tailwind CSS 4' }, { start: 12.6, end: 13.6, text: '开始构建' }])
    expect(cues[1].start - cues[0].end).toBeCloseTo(0.7)
  })
  it('品牌连字符、大小写和发音数字不会破坏对齐', () => {
    expect(canonicalText('weapp-tailwindcss')).toBe(canonicalText('weapp Tailwind CSS'))
    expect(canonicalText('uni-app x、Mpx')).toBe(canonicalText('uni app x、M P X'))
    expect(canonicalText('CSS 4')).toBe(canonicalText('CSS 四'))
  })
  it('文本不匹配时明确报错，不用估算时间掩盖缺失边界', () => {
    expect(() => createCues([{ id: 'bad', duration: 2, start: 0, text: '开始', words: [{ text: '结束', start: 0, end: 1 }] }])).toThrow('不一致')
  })
  it('时间戳正确进位并分别输出 SRT/VTT', () => {
    expect(timestamp(59.9996)).toBe('00:01:00.000')
    expect(timestamp(3600.001, true)).toBe('01:00:00,001')
    const cues = [{ start: 0.25, end: 1.8, text: '开始构建' }]
    expect(serializeCues(cues, true)).toContain('1\n00:00:00,250 --> 00:00:01,800\n开始构建')
    expect(serializeCues(cues, false)).toContain('WEBVTT\n\n00:00:00.250 --> 00:00:01.800')
  })
})
