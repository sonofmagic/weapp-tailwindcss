import Layout from '@theme-original/Layout'
import React from 'react'

export default function LayoutWrapper(props) {
  // React.useEffect(() => {
  //   // 可以在这里运行全局 JavaScript 代码
  //   console.log('This will run globally on every page')
  // }, [])

  return <Layout {...props} />
}
