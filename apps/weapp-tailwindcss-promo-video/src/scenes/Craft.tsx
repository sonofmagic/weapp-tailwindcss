import { Phone } from '../components/Interface'
import { Accent, Eyebrow } from '../components/Stage'
import { C } from '../config'
import { enter, rise } from '../motion'

const tokens = ['p-6', 'rounded-2xl', 'bg-sky-500']
export function Craft({ frame, portrait }: { frame: number, portrait: boolean }) {
  const p = portrait
  const progress = enter(frame, 20, 110)
  const selected = Math.min(2, Math.max(0, Math.floor((frame - 15) / 36)))
  return (
    <>
      <div style={{ position: 'absolute', left: p ? 80 : 110, top: p ? 223 : 191 }}>
        <div style={rise(frame)}><Eyebrow>FROM CLASS TO CRAFT</Eyebrow></div>
        <div style={{ ...rise(frame, 3), fontWeight: 750, fontSize: p ? 76 : 80, letterSpacing: -4, lineHeight: 1.35 }}>
          熟悉的 class。
          <br />
          <Accent>看得见的创造。</Accent>
        </div>
      </div>
      <div style={{ ...rise(frame, 7), position: 'absolute', left: p ? 80 : 115, top: p ? 517 : 486, width: p ? 820 : 902, borderRadius: 24, border: '1px solid #6C9AB540', background: 'linear-gradient(140deg,#163049B0,#071321F0)', boxShadow: '0 28px 55px #00000030', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 58, padding: '0 28px', borderBottom: '1px solid #79AAC020' }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#4E7189' }} />)}
          <div className="mono" style={{ marginLeft: 15, color: '#7397AF', fontSize: 14 }}>your-next-screen</div>
          <div className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: '#509183' }}>● LIVE DESIGN</div>
        </div>
        <div className="mono" style={{ padding: p ? '30px 27px' : '38px 35px', fontSize: p ? 29 : 30, lineHeight: 1.9 }}>
          <div>
            <span style={{ color: '#54758E' }}>&lt;</span>
            <span style={{ color: '#8ECFF2' }}>view</span>
            {' '}
            <span style={{ color: '#85DDAD' }}>class</span>
            <span style={{ color: '#54758E' }}>=</span>
            <span style={{ color: '#AEE3F8' }}>&quot;</span>
          </div>
          <div style={{ display: 'flex', gap: 11, marginLeft: p ? 20 : 30, marginTop: 7, marginBottom: 7 }}>
            {tokens.map((token, i) => <span key={token} style={{ background: selected === i ? '#0A705870' : '#18405A60', border: `1px solid ${selected === i ? '#43C995' : '#396B8740'}`, borderRadius: 8, padding: '0 11px', color: selected === i ? '#C6FFE5' : '#A7C8DA', opacity: 0.45 + enter(frame, 15 + i * 30) * 0.55 }}>{token}</span>)}
          </div>
          <div style={{ color: '#AEE3F8' }}>
            &quot;
            <span style={{ color: '#54758E' }}>&gt; ... &lt;/</span>
            <span style={{ color: '#8ECFF2' }}>view</span>
            <span style={{ color: '#54758E' }}>&gt;</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: p ? 302 : 1290, top: p ? 867 : 182, opacity: enter(frame, 9), transform: `translateY(${(1 - enter(frame, 9, 45)) * 75 + Math.sin(frame / 50) * 5}px) rotate(${(1 - progress) * 5}deg)` }}><Phone width={p ? 313 : 380} progress={progress} /></div>
      {p
        ? <div className="mono" style={{ ...rise(frame, 32), position: 'absolute', left: 80, top: 980, color: '#78A8BE', fontSize: 17, letterSpacing: 3, writingMode: 'vertical-rl' }}>IDEA → INTERFACE</div>
        : (
            <div style={{ ...rise(frame, 35), position: 'absolute', left: 122, top: 852, display: 'flex', gap: 40, fontSize: 24, color: C.muted }}>
              {['间距', '圆角', '色彩'].map((label, i) => (
                <span key={label} style={{ color: selected === i ? '#87EFBA' : C.muted }}>
                  {label}
                  <span style={{ marginLeft: 40, color: '#365D76' }}>{i < 2 ? '／' : ''}</span>
                </span>
              ))}
            </div>
          )}
      <div style={{ position: 'absolute', left: p ? 690 : 1650, top: p ? 1430 : 891, fontSize: p ? 17 : 14, color: '#63879C' }}>界面设计示意</div>
    </>
  )
}
