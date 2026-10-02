import { Img, staticFile } from 'remotion'
import { Ribbon } from '../components/Ribbon'
import { Accent, Brand, Eyebrow } from '../components/Stage'
import { C } from '../config'
import { enter, rise } from '../motion'

export function Opening({ frame, portrait, cover = false }: { frame: number, portrait: boolean, cover?: boolean }) {
  const p = portrait
  const orbitSize = p ? 930 : 900
  return (
    <>
      <div style={{ position: 'absolute', left: p ? 76 : 106, top: p ? 246 : 262, zIndex: 2 }}>
        <div style={rise(frame, 2)}><Eyebrow>BUILD BEYOND BOUNDARIES</Eyebrow></div>
        <div style={{ ...rise(frame, 5, 65), fontSize: p ? 91 : 113, fontWeight: 700, letterSpacing: -5, lineHeight: 1.23 }}>Tailwind CSS</div>
        <div style={{ ...rise(frame, 12, 70), fontSize: p ? 126 : 157, fontWeight: 850, letterSpacing: -8, lineHeight: 1.26 }}><Accent>走向全端。</Accent></div>
        {!p && <div style={{ ...rise(frame, 24), marginTop: 33, fontSize: 29, fontWeight: 350, color: C.muted, letterSpacing: 4 }}>熟悉的写法。更多的屏幕。</div>}
      </div>
      <div style={{ position: 'absolute', left: p ? -2 : 973, top: p ? 634 : 109, transform: `scale(${0.83 + enter(frame, 5, 65) * 0.17})`, opacity: 0.32 + enter(frame, 3) * 0.68 }}>
        <Ribbon size={orbitSize} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ transform: `translateY(${Math.sin(frame / 50) * 9}px)`, width: p ? 230 : 226, height: p ? 230 : 226, display: 'grid', placeItems: 'center', borderRadius: 58, background: 'linear-gradient(130deg,#29485B99,#0A1A2BDD)', border: '1px solid #B3D9EE45', boxShadow: 'inset 0 1px 0 #C4E7FD40,0 20px 90px #0B5B8430' }}>
            <Img src={staticFile('brand/logo.svg')} style={{ width: 202, height: 202 }} />
          </div>
        </div>
      </div>
      <div style={{ ...rise(frame, 26), position: 'absolute', left: p ? 80 : 112, top: p ? 1450 : 850, display: 'flex', flexDirection: p ? 'column' : 'row', gap: p ? 17 : 34, color: C.muted, fontSize: p ? 27 : 21, letterSpacing: 2 }}>
        <span>Web / 小程序 / 原生跨端生态</span>
        {!p && <span style={{ color: '#44708C' }}>————</span>}
        <span className="mono" style={{ fontSize: p ? 20 : 17, color: C.ice }}>{cover ? 'tw.weapp.dev' : 'ONE LANGUAGE. MORE SCREENS.'}</span>
      </div>
    </>
  )
}

export function PromiseScene({ frame, portrait }: { frame: number, portrait: boolean }) {
  return (
    <>
      <div style={{ position: 'absolute', left: portrait ? -120 : 630, top: portrait ? 500 : -90, opacity: 0.42 }}><Ribbon size={portrait ? 1100 : 1400} phase={2} /></div>
      <div style={{ position: 'absolute', left: portrait ? 80 : 123, top: portrait ? 320 : 245 }}>
        <div style={rise(frame)}><Eyebrow>CREATE WITHOUT LIMITS</Eyebrow></div>
        <div style={{ ...rise(frame, 4), fontSize: portrait ? 106 : 134, lineHeight: 1.32, fontWeight: 800, letterSpacing: -6 }}>
          让创造，
          <br />
          <Accent>跨越屏幕。</Accent>
        </div>
        <div style={{ ...rise(frame, 14), fontSize: portrait ? 31 : 29, color: C.muted, marginTop: 40 }}>把熟悉的原子化开发体验，带到更多屏幕。</div>
      </div>
    </>
  )
}

export function CtaScene({ frame, portrait }: { frame: number, portrait: boolean }) {
  const p = portrait
  return (
    <>
      <div style={{ position: 'absolute', left: p ? -20 : 684, top: p ? 480 : -190, opacity: 0.25 }}><Ribbon size={p ? 1100 : 1350} phase={3} /></div>
      <div style={{ position: 'absolute', left: p ? 82 : 119, top: p ? 268 : 236 }}>
        <div style={rise(frame)}><Eyebrow>YOUR NEXT SCREEN STARTS HERE</Eyebrow></div>
        <div style={{ ...rise(frame, 5), fontSize: p ? 103 : 108, fontWeight: 750, lineHeight: 1.33, letterSpacing: -5 }}>
          下一块屏幕，
          <br />
          <Accent>等你创造。</Accent>
        </div>
        <div style={{ ...rise(frame, 10), marginTop: p ? 52 : 55 }}><Brand size={p ? 70 : 67} /></div>
        <div className="mono" style={{ ...rise(frame, 13), fontSize: p ? 60 : 51, fontWeight: 500, color: C.ice, marginTop: p ? 32 : 30, letterSpacing: -2 }}>
          tw.weapp.dev
          <span style={{ color: C.green }}>↗</span>
        </div>
      </div>
      <div style={{ ...rise(frame, 8, 35), position: 'absolute', left: p ? 82 : 1280, top: p ? 1028 : 292 }}>
        <div style={{ width: p ? 268 : 306, padding: 12, background: '#FFFFFF', borderRadius: 26, boxShadow: '0 20px 90px #0EA5E920' }}><Img src={staticFile('brand/docs-qr.png')} style={{ width: '100%', display: 'block', borderRadius: 18 }} /></div>
        <div style={{ marginTop: 26, color: C.text, fontSize: p ? 29 : 25, fontWeight: 500, letterSpacing: 8 }}>开始构建</div>
        <div className="mono" style={{ marginTop: 13, color: C.muted, fontSize: 14, letterSpacing: 4 }}>OPEN SOURCE / MIT</div>
      </div>
    </>
  )
}
