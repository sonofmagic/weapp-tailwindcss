import { View } from '@tarojs/components'

const swatchStyle = {
  border: '1px solid #0f172a',
  borderRadius: '6px',
  height: '56px',
  width: '112px',
}

const samples = [
  {
    className: 'issue-928-gradient issue-928-linear-to-r h-14 w-28 bg-linear-to-r from-cyan-500 to-blue-500',
  },
  {
    className: 'issue-928-linear-via h-14 w-28 bg-linear-to-tr from-cyan-500 from-10% via-purple-500 via-30% to-blue-500 to-90%',
  },
  {
    className: 'issue-928-stop-arbitrary h-14 w-28 bg-linear-to-r from-[#06b6d4] via-purple-500 to-[#3b82f6]',
  },
  {
    className: 'issue-928-stop-var h-14 w-28 bg-linear-to-r from-(--issue-928-from) via-(--issue-928-via) to-(--issue-928-to)',
  },
  {
    className: 'issue-928-linear-angle h-14 w-28 bg-linear-65 from-emerald-400 via-yellow-300 to-rose-500',
  },
  {
    className: 'issue-928-linear-negative h-14 w-28 -bg-linear-65 from-emerald-400 via-yellow-300 to-rose-500',
  },
  {
    className: 'issue-928-linear-custom h-14 w-28 bg-linear-[25deg,#ef4444_5%,#eab308_60%,#22c55e_90%,#14b8a6]',
  },
  {
    className: 'issue-928-linear-var h-14 w-28 bg-linear-(--issue-928-linear)',
  },
  {
    className: 'issue-928-radial h-14 w-28 bg-radial from-cyan-500 via-purple-500 to-blue-500',
  },
  {
    className: 'issue-928-radial-custom h-14 w-28 bg-radial-[at_50%_75%] from-cyan-500 via-purple-500 to-blue-500',
  },
  {
    className: 'issue-928-radial-var h-14 w-28 bg-radial-(--issue-928-radial)',
  },
  {
    className: 'issue-928-conic h-14 w-28 bg-conic from-cyan-500 via-purple-500 to-blue-500',
  },
  {
    className: 'issue-928-conic-angle h-14 w-28 bg-conic-180 from-cyan-500 via-purple-500 to-blue-500',
  },
  {
    className: 'issue-928-conic-negative h-14 w-28 -bg-conic-180 from-cyan-500 via-purple-500 to-blue-500',
  },
  {
    className: 'issue-928-conic-custom h-14 w-28 bg-conic-[from_45deg_at_50%_50%,#ef4444,#eab308,#22c55e]',
  },
  {
    className: 'issue-928-conic-var h-14 w-28 bg-conic-(--issue-928-conic)',
  },
  {
    className: 'issue-928-interpolation-srgb h-14 w-28 bg-linear-to-r/srgb from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-hsl h-14 w-28 bg-linear-to-r/hsl from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-oklab h-14 w-28 bg-linear-to-r/oklab from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-oklch h-14 w-28 bg-linear-to-r/oklch from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-longer h-14 w-28 bg-linear-to-r/longer from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-shorter h-14 w-28 bg-linear-to-r/shorter from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-increasing h-14 w-28 bg-linear-to-r/increasing from-red-500 to-blue-500',
  },
  {
    className: 'issue-928-interpolation-decreasing h-14 w-28 bg-conic/decreasing from-red-500 via-yellow-300 to-blue-500',
  },
  {
    className: 'issue-928-arbitrary-image h-14 w-28 bg-[image:linear-gradient(to_right,#06b6d4,#3b82f6)]',
  },
  {
    className: 'issue-928-image-var h-14 w-28 bg-(image:--issue-928-image)',
  },
  {
    className: 'issue-928-direct-empty-fallback',
    style: {
      backgroundImage: 'linear-gradient(to right, #06b6d4 var(--issue-928-missing-from-position, ), #3b82f6 var(--issue-928-missing-to-position, ))',
    },
  },
  {
    className: 'issue-928-direct-empty-fallback-no-space',
    style: {
      backgroundImage: 'linear-gradient(to right, #06b6d4 var(--issue-928-missing-from-position,), #3b82f6 var(--issue-928-missing-to-position,))',
    },
  },
  {
    className: 'issue-928-none h-14 w-28 bg-none',
    style: {
      backgroundColor: '#e2e8f0',
    },
  },
]

export default function Issue928() {
  return (
    <View
      className='issue-928-page'
      style={{
        '--issue-928-conic': 'from 90deg at 50% 50%, #06b6d4, #a855f7, #3b82f6',
        '--issue-928-from': '#06b6d4',
        '--issue-928-image': 'linear-gradient(to right, #06b6d4, #3b82f6)',
        '--issue-928-linear': '135deg, #06b6d4 0%, #a855f7 45%, #3b82f6 100%',
        '--issue-928-radial': 'circle at 50% 35%, #06b6d4 0%, #a855f7 45%, #3b82f6 100%',
        '--issue-928-to': '#3b82f6',
        '--issue-928-via': '#a855f7',
        background: '#f8fafc',
        minHeight: '100vh',
        padding: '32px 24px',
      }}
    >
      <View
        className='issue-928-title'
        style={{
          color: '#0f172a',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: '24px',
          marginBottom: '16px',
        }}
      >
        issue #928
      </View>
      <View
        className='issue-928-grid'
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {samples.map(sample => (
          <View
            key={sample.className}
            className={sample.className}
            style={{
              ...swatchStyle,
              ...sample.style,
            }}
          />
        ))}
      </View>
      <View
        className='issue-928-reference-row'
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '16px',
        }}
      >
        <View
          className='issue-928-cyan-reference'
          style={{
            background: '#06b6d4',
            height: '28px',
            marginRight: '8px',
            width: '56px',
          }}
        />
        <View
          className='issue-928-blue-reference'
          style={{
            background: '#3b82f6',
            height: '28px',
            width: '56px',
          }}
        />
      </View>
    </View>
  )
}
