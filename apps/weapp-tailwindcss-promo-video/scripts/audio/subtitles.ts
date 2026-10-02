export interface Cue { start: number, end: number, text: string }
export interface Word { start: number, end: number, text: string }
export interface Voice { id: string, duration: number, start: number, text: string, words: Word[] }

export function canonicalText(text: string) {
  return text.toLowerCase().replaceAll('四', '4').replace(/[^\p{L}\p{N}]/gu, '')
}

export function createCues(voices: Voice[]): Cue[] {
  return voices.flatMap((voice) => {
    const chunks = voice.text.match(/[^，。！？]+[，。！？]?/g) ?? [voice.text]
    if (canonicalText(voice.words.map(word => word.text).join('')) !== canonicalText(voice.text)) {
      throw new Error(`${voice.id} 的配音文本与展示字幕不一致，无法按词对齐`)
    }
    let position = 0
    const words = voice.words.map((word) => {
      const from = position
      position += canonicalText(word.text).length
      return { ...word, from, to: position }
    })
    let cursor = 0
    return chunks.map((text) => {
      const from = cursor
      cursor += canonicalText(text).length
      const matching = words.filter(word => word.to > from && word.from < cursor)
      if (!matching.length) {
        throw new Error(`${voice.id} 字幕缺少语音边界`)
      }
      return { start: voice.start + matching[0].start, end: voice.start + matching[matching.length - 1].end, text: text.replace(/[，。]$/, '') }
    })
  })
}

export function timestamp(seconds: number, srt = false) {
  const milliseconds = Math.round(seconds * 1000)
  const ms = milliseconds % 1000
  const whole = Math.floor(milliseconds / 1000)
  return `${String(Math.floor(whole / 3600)).padStart(2, '0')}:${String(Math.floor(whole / 60) % 60).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}${srt ? ',' : '.'}${String(ms).padStart(3, '0')}`
}

export function serializeCues(cues: Cue[], srt: boolean) {
  return `${srt ? '' : 'WEBVTT\n\n'}${cues.map((cue, i) => `${srt ? `${i + 1}\n` : ''}${timestamp(cue.start, srt)} --> ${timestamp(cue.end, srt)}\n${cue.text}\n`).join('\n')}`
}
