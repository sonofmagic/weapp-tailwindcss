import type { ResolvedWetwConfig, WetwRegistryItem } from './types'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { isHttp } from './utils'

const counterJson = `${JSON.stringify({ component: true }, null, 2)}\n`
const tagJson = counterJson

export const defaultRegistry: WetwRegistryItem[] = [
  {
    name: 'counter',
    description: '简易计数器组件，提供 mp-weixin / uni-app vue3 / taro react 三套模板（纯 Tailwind 工具类，无自定义样式表）。',
    frameworks: {
      'mp-weixin': [
        {
          path: 'counter/mp-weixin/index.ts',
          content: `Component({
  data: {
    count: 0,
  },
  methods: {
    inc() {
      this.setData({ count: this.data.count + 1 })
    },
    dec() {
      this.setData({ count: this.data.count - 1 })
    },
  },
})
`,
        },
        {
          path: 'counter/mp-weixin/index.wxml',
          content: `<view class="flex items-center gap-2">
  <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" bindtap="dec">-</button>
  <text class="min-w-[64rpx] text-center font-semibold">{{count}}</text>
  <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" bindtap="inc">+</button>
</view>
`,
        },
        {
          path: 'counter/mp-weixin/index.json',
          content: counterJson,
        },
      ],
      'uni-app-vue3': [
        {
          path: 'counter/uni-app-vue3/index.vue',
          content: `<template>
  <view class="flex items-center gap-2">
    <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" @tap="dec">-</button>
    <text class="min-w-[64rpx] text-center font-semibold">{{ count }}</text>
    <button class="px-3 py-2 rounded-lg bg-slate-900 text-white" @tap="inc">+</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const inc = () => { count.value++ }
const dec = () => { count.value-- }
</script>
`,
        },
      ],
      'taro-react': [
        {
          path: 'counter/taro-react/index.tsx',
          content: `import { Button, Text, View } from '@tarojs/components'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <View className='flex items-center gap-2'>
      <Button className='px-3 py-2 rounded-lg bg-slate-900 text-white' onClick={() => setCount((c) => c - 1)}>
        -
      </Button>
      <Text className='min-w-[64rpx] text-center font-semibold'>{count}</Text>
      <Button className='px-3 py-2 rounded-lg bg-slate-900 text-white' onClick={() => setCount((c) => c + 1)}>
        +
      </Button>
    </View>
  )
}
`,
        },
      ],
    },
  },
  {
    name: 'tag',
    description: '语义色标签组件，提供 mp-weixin / uni-app vue3 / taro react 三套模板（纯 Tailwind 工具类）。',
    frameworks: {
      'mp-weixin': [
        {
          path: 'tag/mp-weixin/index.ts',
          content: `Component({
  properties: {
    tone: {
      type: String,
      value: 'primary',
    },
    text: {
      type: String,
      value: '标签',
    },
  },
})
`,
        },
        {
          path: 'tag/mp-weixin/index.wxml',
          content: `<view wx:if="{{tone === 'primary'}}" class="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold bg-sky-500 text-slate-50">
  <text>{{text}}</text>
</view>
`,
        },
        {
          path: 'tag/mp-weixin/index.json',
          content: tagJson,
        },
      ],
      'uni-app-vue3': [
        {
          path: 'tag/uni-app-vue3/index.vue',
          content: `<template>
  <view
    class="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold"
    :class="toneClass"
  >
    <text>{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tone?: 'primary' | 'neutral' | 'danger'
  text?: string
}>()

const toneClass = computed(() => {
  if (props.tone === 'neutral') return 'bg-slate-100 text-slate-900'
  if (props.tone === 'danger') return 'bg-red-50 text-red-800'
  return 'bg-sky-500 text-slate-50'
})
</script>
`,
        },
      ],
      'taro-react': [
        {
          path: 'tag/taro-react/index.tsx',
          content: `import { Text, View } from '@tarojs/components'

type Tone = 'primary' | 'neutral' | 'danger'

interface TagProps {
  tone?: Tone
  text?: string
}

export default function Tag({ tone = 'primary', text = '标签' }: TagProps) {
  const styles: Record<Tone, string> = {
    primary: 'bg-sky-500 text-slate-50',
    neutral: 'bg-slate-100 text-slate-900',
    danger: 'bg-red-50 text-red-800',
  }
  const toneClass = styles[tone]
  return (
    <View className={\`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold \${toneClass}\`}>
      <Text>{text}</Text>
    </View>
  )
}
`,
        },
      ],
    },
  },
]

async function readRegistryFromFile(path: string, config: ResolvedWetwConfig) {
  const target = isAbsolute(path) ? path : resolve(config.cwd, path)
  const content = await readFile(target, 'utf8')
  return JSON.parse(content) as WetwRegistryItem[]
}

async function readRegistryFromUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch registry from ${url}: ${response.status} ${response.statusText}`)
  }

  const payload = (await response.json()) as WetwRegistryItem[]
  return payload
}

export async function resolveRegistry(config: ResolvedWetwConfig) {
  if (Array.isArray(config.registry)) {
    return config.registry
  }

  if (!config.registry) {
    return defaultRegistry
  }

  if (isHttp(config.registry)) {
    return readRegistryFromUrl(config.registry)
  }

  return readRegistryFromFile(config.registry, config)
}
