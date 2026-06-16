import { View } from '@tarojs/components'
import type { ReactNode } from 'react'

function Stage({ children }: { children: ReactNode }) {
  return (
    <View
      className='issue-909-stage'
      style={{
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        display: 'flex',
        height: '64px',
        justifyContent: 'center',
        position: 'relative',
        width: '104px',
      }}
    >
      <View
        className='issue-909-reference'
        style={{
          border: '1px dashed #94a3b8',
          height: '32px',
          position: 'absolute',
          width: '32px',
        }}
      />
      {children}
    </View>
  )
}

function Label({ description, title }: { description: string, title: string }) {
  return (
    <View
      className='issue-909-label'
      style={{
        color: '#334155',
        fontSize: '13px',
        lineHeight: '18px',
        width: '112px',
      }}
    >
      <View>{title}</View>
      <View style={{ color: '#64748b', fontSize: '11px' }}>{description}</View>
    </View>
  )
}

function Sample({ children, description, title }: { children: ReactNode, description: string, title: string }) {
  return (
    <View
      className='issue-909-sample'
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '28px',
      }}
    >
      <Label description={description} title={title} />
      <Stage>{children}</Stage>
    </View>
  )
}

function Issue916BoxSizingSample() {
  return (
    <View
      className='issue-916-native-selector-box'
      style={{
        background: '#fbbf24',
        border: '10px solid #78350f',
        height: '80px',
        width: '80px',
      }}
    />
  )
}

export default function Issue909() {
  return (
    <View
      className='issue-909-page'
      style={{
        background: '#f8fafc',
        minHeight: '100vh',
        padding: '32px 24px',
      }}
    >
      <Sample description='baseline' title='normal'>
        <View
          className='issue-909-box issue-909-box-control h-8 w-8'
          style={{
            alignItems: 'center',
            background: '#10b981',
            color: '#064e3b',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='Y axis edge-on' title='rotate-y-90'>
        <View
          className='issue-909-box issue-909-box-rotate-y-90 h-8 w-8 rotate-y-90'
          style={{
            alignItems: 'center',
            background: '#10b981',
            color: '#064e3b',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='Y axis 45deg' title='rotate-y-45'>
        <View
          className='issue-909-box issue-909-box-rotate-y-45 h-8 w-8 rotate-y-45'
          style={{
            alignItems: 'center',
            background: '#0ea5e9',
            color: '#075985',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='Y axis -45deg' title='-rotate-y-45'>
        <View
          className='issue-909-box issue-909-box-negative-rotate-y-45 h-8 w-8 -rotate-y-45'
          style={{
            alignItems: 'center',
            background: '#f97316',
            color: '#7c2d12',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='X axis 45deg' title='rotate-x-45'>
        <View
          className='issue-909-box issue-909-box-rotate-x-45 h-8 w-8 rotate-x-45'
          style={{
            alignItems: 'center',
            background: '#8b5cf6',
            color: '#4c1d95',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='Z axis 45deg' title='rotate-z-45'>
        <View
          className='issue-909-box issue-909-box-rotate-z-45 h-8 w-8 rotate-z-45'
          style={{
            alignItems: 'center',
            background: '#e11d48',
            color: '#881337',
            display: 'flex',
            fontSize: '10px',
            justifyContent: 'center',
            lineHeight: '12px',
          }}
        >
          box
        </View>
      </Sample>
      <Sample description='native selector' title='issue #916'>
        <Issue916BoxSizingSample />
      </Sample>
    </View>
  )
}
