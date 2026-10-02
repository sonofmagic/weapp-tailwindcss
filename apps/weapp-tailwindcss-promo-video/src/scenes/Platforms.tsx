import { Browser, Phone } from '../components/Interface'
import { Accent, Eyebrow } from '../components/Stage'
import { C } from '../config'
import { enter, rise } from '../motion'

const platforms = ['Web / H5', '小程序', 'App WebView', 'uni-app x', 'React Native', 'Lynx']
export function Platforms({ frame, portrait }: { frame: number, portrait: boolean }) {
  const p = portrait
  return (
    <>
      <div style={{ position: 'absolute', top: p ? 225 : 171, left: p ? 80 : 111 }}>
        <div style={rise(frame)}><Eyebrow>DESIGNED FOR MORE</Eyebrow></div>
        <div style={{ ...rise(frame, 3), fontSize: p ? 76 : 79, fontWeight: 750, letterSpacing: -4, lineHeight: 1.35 }}>
          从一块屏幕，
          <br style={{ display: p ? 'block' : 'none' }} />
          <Accent>到更多可能。</Accent>
        </div>
      </div>
      <div style={{ position: 'absolute', left: p ? 52 : 155, top: p ? 569 : 333, transform: `perspective(1600px) rotateY(${p ? -5 : 8}deg) translateY(${(1 - enter(frame, 6, 45)) * 65 + Math.sin(frame / 65) * 4}px)`, opacity: enter(frame, 6) }}><Browser width={p ? 824 : 803} /></div>
      <div style={{ position: 'absolute', left: p ? 547 : 1413, top: p ? 696 : 326, transform: `translateY(${(1 - enter(frame, 21, 45)) * 95 + Math.sin(frame / 57 + 2) * 5}px) rotate(7deg)`, opacity: enter(frame, 21) }}><Phone width={p ? 261 : 247} color="green" /></div>
      <div style={{ position: 'absolute', left: p ? 248 : 1080, top: p ? 773 : 340, transform: `translateY(${(1 - enter(frame, 15, 45)) * 75 + Math.sin(frame / 62) * 5}px) rotate(-5deg)`, opacity: enter(frame, 15) }}><Phone width={p ? 287 : 267} /></div>
      <div style={{ position: 'absolute', top: p ? 1410 : 889, left: p ? 80 : 120, width: p ? 820 : 1680, display: p ? 'grid' : 'flex', gridTemplateColumns: 'repeat(3,1fr)', gap: p ? '20px 16px' : 30, justifyContent: 'space-between' }}>
        {platforms.map((label, i) => (
          <div key={label} style={{ ...rise(frame, 30 + i * 7, 20), display: 'flex', gap: 11, alignItems: 'center', fontSize: p ? 24 : 23, color: Math.floor(frame / 50) % 6 === i ? '#E5F8FF' : '#85A5B9', whiteSpace: 'nowrap' }}>
            <span style={{ height: 5, width: 5, borderRadius: 5, background: i % 2 ? C.green : C.blue }} />
            {label}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: p ? 1530 : 934, left: p ? 80 : 125, fontSize: p ? 16 : 13, color: '#4D7389' }}>界面设计示意 · 样式能力以各目标运行时为准</div>
    </>
  )
}
