import { Img, staticFile } from 'remotion'
import { Accent, Eyebrow } from '../components/Stage'
import { C } from '../config'
import { enter, rise } from '../motion'

const frameworks = [
  { label: 'uni-app', image: 'uni-app.svg' },
  { label: 'Taro', image: 'taro.png' },
  { label: 'Mpx', image: 'mpx.png' },
  { label: 'weapp-vite', image: 'weapp-vite.svg' },
  { label: 'Expo', image: 'expo.svg' },
  { label: 'Lynx', image: 'lynx.svg' },
]

export function Ecosystem({ frame, portrait }: { frame: number, portrait: boolean }) {
  const p = portrait
  const center = p ? { x: 488, y: 968 } : { x: 1377, y: 531 }
  const radius = p ? 304 : 305
  return (
    <>
      <div style={{ position: 'absolute', left: p ? 80 : 110, top: p ? 225 : 264 }}>
        <div style={rise(frame)}><Eyebrow>CONNECTED BY DESIGN</Eyebrow></div>
        <div style={{ ...rise(frame, 4), fontSize: p ? 76 : 80, lineHeight: 1.35, fontWeight: 750, letterSpacing: -4 }}>
          熟悉的生态。
          <br />
          <Accent>更广的舞台。</Accent>
        </div>
        <div style={{ ...rise(frame, 14), marginTop: 34, color: C.muted, fontSize: p ? 26 : 26, lineHeight: 1.75 }}>
          让 Tailwind CSS 4，
          <br style={{ display: p ? 'none' : 'block' }} />
          融入你的开发方式。
        </div>
        {!p && (
          <div className="mono" style={{ ...rise(frame, 25), fontSize: 19, color: '#6595B0', marginTop: 57, lineHeight: 2 }}>
            Vite · Webpack · Rspack · Gulp
            <br />
            <span style={{ color: '#416C86' }}>GENERATE / TRANSFORM / BUILD</span>
          </div>
        )}
      </div>
      <svg width={p ? 1080 : 1920} height={p ? 1920 : 1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={center.x} cy={center.y} r={radius} stroke="#335971" fill="none" opacity=".5" />
        <circle cx={center.x} cy={center.y} r={radius - 45} stroke="#1B4058" strokeDasharray="2 12" fill="none" />
        <circle cx={center.x} cy={center.y} r={radius + 37} stroke="#163349" fill="none" />
        {frameworks.map((item, i) => {
          const a = (i / 6 * 360 - 90) * Math.PI / 180
          return <line key={item.label} x1={center.x} y1={center.y} x2={center.x + Math.cos(a) * radius} y2={center.y + Math.sin(a) * radius} stroke={i % 2 ? C.green : C.blue} opacity={enter(frame, 14 + i * 6) * 0.25} />
        })}
        <circle cx={center.x} cy={center.y} r={radius} stroke={C.blue} strokeWidth="2" strokeDasharray="130 1787" strokeDashoffset={-frame * 3} fill="none" />
      </svg>
      <div style={{ position: 'absolute', left: center.x - 143, top: center.y - 143, width: 286, height: 286, border: '1px solid #78C0DD90', borderRadius: '50%', background: 'radial-gradient(circle at 35% 20%,#1B4C67,#071B2A 70%)', boxShadow: '0 0 100px #0EA5E927,inset 0 1px 0 #91DCFF40', textAlign: 'center', paddingTop: 40, transform: `scale(${0.85 + enter(frame, 6) * 0.15})`, opacity: enter(frame, 6) }}>
        <div className="mono" style={{ color: C.ice, fontSize: 17, letterSpacing: 1 }}>Tailwind CSS</div>
        <div style={{ fontSize: 141, fontWeight: 800, letterSpacing: -9, lineHeight: 1.15 }}><Accent>4</Accent></div>
      </div>
      {frameworks.map((item, i) => {
        const a = (i / 6 * 360 - 90) * Math.PI / 180
        return (
          <div key={item.label} style={{ ...rise(frame, 14 + i * 7, 25), position: 'absolute', left: center.x + Math.cos(a) * radius - 93, top: center.y + Math.sin(a) * radius - 61, width: 186, height: 122, border: '1px solid #648FA354', borderRadius: 20, background: 'linear-gradient(135deg,#153348,#081827)', boxShadow: '0 10px 35px #00000035', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 13 }}>
            <Img src={staticFile(`brand/${item.image}`)} style={{ width: 41, height: 41, objectFit: 'contain', filter: item.label === 'Expo' || item.label === 'Lynx' ? 'brightness(0) invert(1)' : undefined }} />
            <div className="mono" style={{ fontSize: 20, color: '#D0E5EF' }}>{item.label}</div>
          </div>
        )
      })}
      {p && <div style={{ ...rise(frame, 42), position: 'absolute', left: 80, top: 1443, fontSize: 24, color: '#7EA7BC', letterSpacing: 1 }}>Vite · Webpack · Rspack · Gulp</div>}
    </>
  )
}
