import { useEffect } from 'react'

const Index = () => {
  const text = 'debugger'

  useEffect(() => {
    console.log('text has change or init')
    debugger
  }, [text])
  // 此处写可以准确触发
  // debugger
  return text
}

export default Index
