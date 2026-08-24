import type { LynxPromoProps } from '../config'
import { Audio } from '@remotion/media'
import { AbsoluteFill, Sequence, staticFile } from 'remotion'
import { Subtitles } from '../components/Subtitles'
import { scenes } from '../config'
import { ClassNameScene } from '../scenes/ClassNameScene'
import { ConfigScene } from '../scenes/ConfigScene'
import { CtaScene } from '../scenes/CtaScene'
import { EvidenceScene } from '../scenes/EvidenceScene'
import { HookScene } from '../scenes/HookScene'
import { NativeScene } from '../scenes/NativeScene'
import { PipelineScene } from '../scenes/PipelineScene'

const sceneComponents = {
  hook: HookScene,
  config: ConfigScene,
  classname: ClassNameScene,
  pipeline: PipelineScene,
  native: NativeScene,
} as const

export function LynxPromo(props: LynxPromoProps) {
  return (
    <AbsoluteFill style={{ background: '#0b0f10' }}>
      <Audio src={staticFile('audio/ambient.wav')} volume={0.045} />
      {scenes.map((scene, index) => {
        const Component = sceneComponents[scene.id as keyof typeof sceneComponents]
        return (
          <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
            {Component ? <Component /> : scene.id === 'evidence' ? <EvidenceScene evidence={props.evidence} /> : <CtaScene packageName={props.packageName} docsUrl={props.docsUrl} />}
            <Audio src={staticFile(`audio/narration/${String(index + 1).padStart(2, '0')}-${scene.id}.mp3`)} volume={1} />
          </Sequence>
        )
      })}
      <Subtitles />
    </AbsoluteFill>
  )
}
