import { Button, Text, View } from '@tarojs/components'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <View className="flex items-center gap-2">
      <Button className="px-3 py-2 rounded-lg bg-slate-900 text-white" onClick={() => setCount(c => c - 1)}>
        -
      </Button>
      <Text className="min-w-[64rpx] text-center font-semibold">{count}</Text>
      <Button className="px-3 py-2 rounded-lg bg-slate-900 text-white" onClick={() => setCount(c => c + 1)}>
        +
      </Button>
    </View>
  )
}
