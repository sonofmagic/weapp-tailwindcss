import { interpolate, useCurrentFrame } from 'remotion'
import { CodeLine, CodeWindow, functionName, keyword, stringValue } from '../components/CodeWindow'
import { eyebrowStyle, SceneShell, titleStyle } from '../components/SceneShell'
import { COLORS } from '../config'

export function ConfigScene() {
  const frame = useCurrentFrame()
  const reveal = Math.floor(interpolate(frame, [18, 135], [1, 7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
  const lines = [
    <>
      <span style={keyword}>import</span>
      {' '}
      {'{ defineConfig }'}
      {' '}
      <span style={keyword}>from</span>
      {' '}
      <span style={stringValue}>'@lynx-js/rspeedy'</span>
    </>,
    <>
      <span style={keyword}>import</span>
      {' '}
      {'{ pluginLynxTailwindcss }'}
    </>,
    <>
      <span style={keyword}>from</span>
      {' '}
      <span style={stringValue}>'@weapp-tailwindcss/lynx'</span>
    </>,
    <></>,
    <>
      <span style={keyword}>export default</span>
      {' '}
      <span style={functionName}>defineConfig</span>
      {'({'}
    </>,
    <>
      plugins: [
      <span style={functionName}>pluginLynxTailwindcss</span>
      ()],
    </>,
    <>{'})'}</>,
  ]
  return (
    <SceneShell>
      <div style={eyebrowStyle}>一个 Rspeedy 插件</div>
      <h2 style={{ ...titleStyle, marginTop: 20, fontSize: 64 }}>接入只需要一处配置</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 48, marginTop: 54, alignItems: 'stretch' }}>
        <CodeWindow title="lynx.config.ts">
          {lines.slice(0, reveal).map((line, index) => (
            <CodeLine key={index} active={index === 5} indent={index === 5 ? 1 : 0}>{line}</CodeLine>
          ))}
        </CodeWindow>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0' }}>
          <div style={{ color: COLORS.text, fontSize: 35, lineHeight: 1.36, fontWeight: 650 }}>
            ReactLynx
            <br />
            Rspeedy
            <br />
            Tailwind CSS 4
          </div>
          <div style={{ borderLeft: `3px solid ${COLORS.blue}`, paddingLeft: 20, color: COLORS.muted, fontSize: 21, lineHeight: 1.55 }}>插件进入既有 Rspack 生命周期，不改变组件写法。</div>
        </div>
      </div>
    </SceneShell>
  )
}
