import type { ResolvedWetwConfig, WetwRegistryItem } from './types'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { isHttp } from './utils'

const counterJson = `${JSON.stringify({ component: true }, null, 2)}\n`

export const defaultRegistry: WetwRegistryItem[] = [
  {
    name: 'counter',
    description: 'Minimal mini-program counter component for wetw CLI demo.',
    files: [
      {
        path: 'counter/index.ts',
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
        path: 'counter/index.wxml',
        content: `<view class="wetw-counter">
  <button class="wetw-counter__btn" bindtap="dec">-</button>
  <text class="wetw-counter__value">{{count}}</text>
  <button class="wetw-counter__btn" bindtap="inc">+</button>
</view>
`,
      },
      {
        path: 'counter/index.wxss',
        content: `.wetw-counter {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.wetw-counter__btn {
  padding: 12rpx 20rpx;
  background: #111827;
  border-radius: 12rpx;
  color: #fff;
}

.wetw-counter__value {
  min-width: 64rpx;
  text-align: center;
  font-weight: 600;
}
`,
      },
      {
        path: 'counter/index.json',
        content: counterJson,
      },
    ],
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
