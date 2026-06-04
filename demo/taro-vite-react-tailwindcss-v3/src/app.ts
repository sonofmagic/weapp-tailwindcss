import type { PropsWithChildren } from 'react'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  // children 是将要会渲染的页面
  return children
}



export default App
