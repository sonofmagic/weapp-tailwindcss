import type { PropsWithChildren } from 'react'
// import '@tarojs/taro/html5.css'
import './app.css'
import '@nutui/nutui-react-taro/dist/styles/themes/default.css'
import '@nutui/nutui-react-taro/dist/style.css'

function App({ children }: PropsWithChildren<any>) {
  // children 是将要会渲染的页面
  return children
}



export default App
