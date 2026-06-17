import { View } from '@tarojs/components'

const swatchStyle = {
  border: '1px solid #0f172a',
  borderRadius: '6px',
  height: '56px',
  width: '112px',
}

const samples = [
  {
    className: 'issue-928-v3-gradient issue-928-v3-gradient-to-r h-14 w-28 bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  {
    className: 'issue-928-v3-linear-via h-14 w-28 bg-gradient-to-tr from-cyan-500 from-10% via-purple-500 via-30% to-blue-500 to-90%',
  },
  {
    className: 'issue-928-v3-stop-arbitrary h-14 w-28 bg-gradient-to-r from-[#06b6d4] via-purple-500 to-[#3b82f6]',
  },
  {
    className: 'issue-928-v3-linear-b h-14 w-28 bg-gradient-to-b from-emerald-400 via-yellow-300 to-rose-500',
  },
  {
    className: 'issue-928-v3-linear-br h-14 w-28 bg-gradient-to-br from-red-500 via-yellow-300 to-emerald-500',
  },
  {
    className: 'issue-928-v3-arbitrary-image h-14 w-28 bg-[image:linear-gradient(to_right,#06b6d4,#3b82f6)]',
  },
  {
    className: 'issue-928-v3-arbitrary-radial h-14 w-28 bg-[radial-gradient(circle_at_50%_50%,#06b6d4,#a855f7,#3b82f6)]',
  },
  {
    className: 'issue-928-v3-arbitrary-conic h-14 w-28 bg-[conic-gradient(from_180deg,#06b6d4,#a855f7,#3b82f6)]',
  },
]

export default function Issue928() {
  return (
    <View
      className='issue-928-v3-page'
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        padding: '32px 24px',
      }}
    >
      <View
        className='issue-928-v3-title'
        style={{
          color: '#0f172a',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: '24px',
          marginBottom: '16px',
        }}
      >
        issue #928 v3
      </View>
      <View
        className='issue-928-v3-grid'
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
            style={swatchStyle}
          />
        ))}
      </View>
      <View
        className='issue-928-v3-reference-row'
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '16px',
        }}
      >
        <View
          className='issue-928-v3-cyan-reference'
          style={{
            background: '#06b6d4',
            height: '28px',
            marginRight: '8px',
            width: '56px',
          }}
        />
        <View
          className='issue-928-v3-blue-reference'
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
