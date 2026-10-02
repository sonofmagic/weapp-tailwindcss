import type { ReactNode } from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../config'

export function Brand({ size = 44, label = true }: { size?: number, label?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <Img src={staticFile('brand/logo.svg')} style={{ width: size, height: size }} />
      {label && <span className="mono" style={{ fontSize: size * 0.54, fontWeight: 600, color: C.text, letterSpacing: -0.8 }}>weapp-tailwindcss</span>}
    </div>
  )
}

export function Stage({ children, portrait, cover = false }: { children: ReactNode, portrait: boolean, cover?: boolean }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return (
    <AbsoluteFill style={{ background: C.background, color: C.text, overflow: 'hidden', fontFamily: 'Noto Sans SC Variable' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${65 + Math.sin(frame / 240) * 10}% 38%, #10344B80 0%, transparent 52%), radial-gradient(ellipse at 15% 100%, #07443550 0%, transparent 45%), linear-gradient(135deg,#081528,#030A14 75%)` }} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(#71859C44 0.75px,transparent 0.75px)', backgroundSize: '32px 32px', opacity: 0.22 }} />
      <div style={{ position: 'absolute', width: 1500, height: 1, top: portrait ? 155 : 112, left: portrait ? 76 : 100, background: 'linear-gradient(90deg,#7EB5CF40,transparent)' }} />
      <div style={{ position: 'absolute', top: portrait ? 90 : 52, left: portrait ? 70 : 94 }}><Brand size={portrait ? 48 : 42} /></div>
      {!portrait && <div className="mono" style={{ position: 'absolute', right: 104, top: 62, fontSize: 15, color: C.muted, letterSpacing: 3 }}>ONE LANGUAGE. MORE SCREENS.</div>}
      {children}
      {!cover && (
        <>
          <div className="mono" style={{ position: 'absolute', left: portrait ? 80 : 104, bottom: portrait ? 217 : 41, color: '#577084', fontSize: portrait ? 16 : 13, letterSpacing: 3 }}>WEAPP / TAILWIND CSS</div>
          {!portrait && <div className="mono" style={{ position: 'absolute', right: 104, bottom: 41, color: '#577084', fontSize: 13 }}>tw.weapp.dev</div>}
          <div style={{ position: 'absolute', left: portrait ? 80 : 104, right: portrait ? 152 : 104, bottom: portrait ? 201 : 25, height: 1, background: '#41657844' }}>
            <div style={{ width: `${frame / (durationInFrames - 1) * 100}%`, height: 1, background: `linear-gradient(90deg,${C.green},${C.blue})` }} />
          </div>
        </>
      )}
    </AbsoluteFill>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mono" style={{ color: C.ice, fontSize: 20, letterSpacing: 5, display: 'flex', gap: 14, alignItems: 'center', marginBottom: 26 }}>
      <span style={{ width: 20, height: 2, background: C.green }} />
      {children}
    </div>
  )
}

export function Accent({ children }: { children: ReactNode }) {
  return <span style={{ background: 'linear-gradient(105deg,#F0F7FF 0%,#A9E6FF 40%,#40DFA1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{children}</span>
}
