import { Img, staticFile } from 'remotion'
import { Accent, Eyebrow } from '../components/Stage'
import { C } from '../config'
import { enter, rise } from '../motion'

const outputs = [{ label: 'Web', detail: 'BROWSER CSS', color: C.blue }, { label: '小程序', detail: 'MINI PROGRAM STYLES', color: C.green }, { label: '原生跨端', detail: 'TARGET-SPECIFIC OUTPUT', color: '#A7D8EA' }]
export function Pipeline({ frame }: { frame: number }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 113, top: 180 }}>
        <div style={rise(frame)}><Eyebrow>ONE INPUT. MANY POSSIBILITIES.</Eyebrow></div>
        <div style={{ ...rise(frame, 5), fontSize: 77, fontWeight: 750, letterSpacing: -4 }}>
          同一套输入，
          <Accent>不同的可能。</Accent>
        </div>
      </div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="flow">
            <stop stopColor={C.blue} />
            <stop offset=".65" stopColor="#70E3DF" />
            <stop offset="1" stopColor={C.green} />
          </linearGradient>
        </defs>
        {outputs.map((item, i) => {
          const d = `M560 603 C730 603 717 603 910 603 S1170 ${470 + i * 135} 1300 ${470 + i * 135}`
          return (
            <g key={item.label} opacity={enter(frame, 18 + i * 10)}>
              <path d={d} fill="none" stroke="#25495E" strokeWidth="2" />
              <path d={d} fill="none" stroke="url(#flow)" strokeWidth="4" strokeDasharray="70 960" strokeDashoffset={-frame * 6 - i * 250} />
              <path d={d} fill="none" stroke="url(#flow)" strokeWidth="15" opacity=".06" />
            </g>
          )
        })}
      </svg>
      <div style={{ ...rise(frame, 8), position: 'absolute', left: 113, top: 469, width: 448, height: 268, border: '1px solid #557F9A65', borderRadius: 23, padding: '31px 33px', background: 'linear-gradient(120deg,#122F47,#091726)' }}>
        <div className="mono" style={{ color: '#5D92AE', fontSize: 15, letterSpacing: 3 }}>YOUR TAILWIND INPUT</div>
        <div className="mono" style={{ fontSize: 26, lineHeight: 1.7, marginTop: 24, color: '#B7E5F8' }}>
          flex items-center
          <br />
          gap-4 rounded-2xl
          <br />
          <span style={{ color: '#84E5B2' }}>bg-sky-500</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 837, top: 521, width: 166, height: 166, borderRadius: 40, background: '#0D2235', border: '1px solid #90C4DB80', display: 'grid', placeItems: 'center', boxShadow: '0 0 80px #0EA5E925', transform: `scale(${0.85 + enter(frame, 14) * 0.15})`, opacity: enter(frame, 10) }}><Img src={staticFile('brand/logo.svg')} style={{ width: 148, height: 148 }} /></div>
      <div className="mono" style={{ ...rise(frame, 17), position: 'absolute', left: 781, top: 725, color: C.muted, fontSize: 17 }}>weapp-tailwindcss</div>
      {outputs.map((output, i) => (
        <div key={output.label} style={{ ...rise(frame, 27 + i * 12), position: 'absolute', left: 1299, top: 417 + i * 135, width: 461, height: 105, borderRadius: 19, border: '1px solid #3F718B65', background: '#0C2032', padding: '22px 29px', display: 'flex', alignItems: 'center', gap: 25 }}>
          <div style={{ width: 6, height: 39, background: output.color, borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 600 }}>{output.label}</div>
            <div className="mono" style={{ fontSize: 12, color: '#7098AD', marginTop: 5, letterSpacing: 2 }}>{output.detail}</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 25, color: output.color }}>↗</span>
        </div>
      ))}
      <div style={{ ...rise(frame, 45), position: 'absolute', left: 116, top: 846, color: C.muted, fontSize: 25, letterSpacing: 2 }}>由对应平台集成，生成目标端所需的样式产物。</div>
    </>
  )
}
