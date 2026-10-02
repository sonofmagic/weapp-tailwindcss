import type { Format, SceneId } from './config'
import { useEffect, useState } from 'react'
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion'
import { Stage } from './components/Stage'
import { films, FPS } from './config'
import subtitles from './generated/subtitles.json'
import { Craft } from './scenes/Craft'
import { Ecosystem } from './scenes/Ecosystem'
import { CtaScene, Opening, PromiseScene } from './scenes/Opening'
import { Pipeline } from './scenes/Pipeline'
import { Platforms } from './scenes/Platforms'

export function useFonts() {
  const [handle] = useState(() => delayRender('等待本地品牌字体'))
  useEffect(() => {
    Promise.all([document.fonts.load('700 80px "Noto Sans SC Variable"'), document.fonts.load('500 30px "JetBrains Mono Variable"')]).then(() => document.fonts.ready).then(() => continueRender(handle)).catch(cancelRender)
  }, [handle])
}

function Scene({ id, frame, portrait }: { id: SceneId, frame: number, portrait: boolean }) {
  if (id === 'intro') {
    return <Opening frame={frame} portrait={portrait} />
  }
  if (id === 'craft') {
    return <Craft frame={frame} portrait={portrait} />
  }
  if (id === 'pipeline') {
    return <Pipeline frame={frame} />
  }
  if (id === 'platforms') {
    return <Platforms frame={frame} portrait={portrait} />
  }
  if (id === 'ecosystem') {
    return <Ecosystem frame={frame} portrait={portrait} />
  }
  if (id === 'promise') {
    return <PromiseScene frame={frame} portrait={portrait} />
  }
  return <CtaScene frame={frame} portrait={portrait} />
}

export function PromoVideo({ format, muted = false }: { format: Format, muted?: boolean }) {
  useFonts()
  const frame = useCurrentFrame()
  const portrait = format === 'portrait'
  const film = films[format]
  const cues = subtitles[format] as Array<{ start: number, end: number, text: string }>
  const caption = cues.find(cue => frame / FPS >= cue.start && frame / FPS < cue.end)
  return (
    <Stage portrait={portrait}>
      {!muted && <Audio src={staticFile(`audio/${format}/master.wav`)} />}
      {film.scenes.map((scene, index) => {
        const relative = frame - scene.from * FPS
        const tail = (scene.from + scene.duration) * FPS - frame
        if (relative < 0 || tail <= 0) {
          return null
        }
        const fadeIn = index === 0 ? 1 : Math.min(1, relative / 8)
        const opacity = fadeIn * (index === film.scenes.length - 1 ? 1 : Math.min(1, tail / 12))
        return <AbsoluteFill key={scene.id} style={{ opacity }}><Scene id={scene.id} frame={Math.max(0, relative + (index ? 10 : 0))} portrait={portrait} /></AbsoluteFill>
      })}
      {caption && <div style={{ position: 'absolute', left: portrait ? 80 : 170, right: portrait ? 152 : 170, bottom: portrait ? 295 : 76, textAlign: 'center', fontSize: portrait ? 35 : 29, lineHeight: 1.55, fontWeight: 450, color: '#ECF7FF', textShadow: '0 2px 12px #000000' }}><span style={{ background: '#030C19D9', padding: '7px 17px', borderRadius: 9, boxDecorationBreak: 'clone' }}>{caption.text}</span></div>}
    </Stage>
  )
}

export function PromoCover({ format }: { format: Format }) {
  useFonts()
  return <Stage portrait={format === 'portrait'} cover><Opening frame={90} portrait={format === 'portrait'} cover /></Stage>
}
