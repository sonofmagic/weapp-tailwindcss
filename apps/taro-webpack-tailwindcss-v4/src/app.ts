import type { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
// import '@tarojs/taro/html5.css'
import './app.css'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}

export default App
