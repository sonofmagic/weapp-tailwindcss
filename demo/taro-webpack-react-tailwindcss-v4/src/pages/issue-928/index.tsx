import { View } from '@tarojs/components'

export default function Issue928() {
  return (
    <View
      className='issue-928-page'
      style={{
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
        className='issue-928-gradient h-14 w-24 bg-linear-to-r from-cyan-500 to-blue-500'
        style={{
          border: '1px solid #0f172a',
          marginBottom: '16px',
        }}
      />
      <View
        className='issue-928-reference-row'
        style={{
          display: 'flex',
          flexDirection: 'row',
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
