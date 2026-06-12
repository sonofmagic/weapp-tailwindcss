import type { PropsWithChildren } from 'react'
// import '@tarojs/taro/html5.css'
if (process.env.TARO_ENV !== 'rn') {
  require('./app.css')
}

function App({ children }: PropsWithChildren<any>) {
  // children 是将要会渲染的页面
  return children
}



export default App
