<template>
  <view class="flex flex-col">
    <view class="template-corpus-card flex flex-col gap-3 rounded-[28rpx] border border-slate-200/80 bg-gradient-to-br from-slate-900/95 to-slate-700/95 p-4 text-white shadow-xl wx:bg-blue-500 not-wx:bg-red-500 any-hover:bg-slate-800">
      <view class="template-corpus-radial bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[48px] py-[24rpx] text-[#123456]">
        template corpus radial
      </view>
      <view class="template-corpus-space space-y-2">
        <view class="rounded-[20rpx] bg-white/70 px-3 py-1 text-[26rpx] text-slate-700">space item 1</view>
        <view :class="templateCorpusDynamicClass">space item 2</view>
      </view>
      <view class="template-corpus-apply">apply corpus</view>
      <view class="template-corpus-hover h-16 w-32 rounded-[20rpx] bg-green-200/70" hover-class="!bg-[gray] after:!content-['good_work!']">
        hover corpus
      </view>
    </view>
    <image class="w-20 h-20" src="/static/logo.png" />
    <view class="text-area aspect-(--my-aspect-ratio)">
      <text class="text-[#00f285] text-[102.43rpx] font-bold underline">{{ title }}</text>
    </view>
    <view :class="className" class="aspect-[calc(4*3+1)/3]">
      {{ className }}
    </view>
    <view class="i-mdi-home"></view>
    <view class="bg-midnight text-tahiti fill-bermuda">
      bg-midnight text-tahiti fill-bermuda
    </view>
    <view class="bg-neutral-1B">
      12345
    </view>
    <view class="mt-4 flex items-center gap-3">
      <view class="h-12 w-12 rounded-full bg-emerald-500"></view>
      <text class="text-sm text-neutral-66">rounded-full</text>
    </view>
    <view class="mt-6 rounded-xl bg-emerald-500 py-3 text-center text-white shadow-sm active:bg-emerald-600"
      @tap="goOrder">
      打开订单分包
    </view>
    <view class="theme-mode-demo mt-4 rounded bg-white px-4 py-3 text-slate-900 system-dark:bg-slate-900 system-dark:text-slate-100 dark:bg-zinc-900 dark:text-zinc-50">
      uni-app Vite Tailwind CSS v4 system dark
      <view class="theme-dark mt-2 rounded bg-white px-3 py-2 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
        uni-app Vite Tailwind CSS v4 manual dark
      </view>
    </view>
    <view class="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm">
      <view class="flex items-center justify-between gap-3">
        <text class="text-base font-semibold text-slate-900">App WebView Runtime</text>
        <view class="rounded bg-slate-900 px-3 py-1 text-[24rpx] text-white active:bg-slate-700" @tap="refreshWebviewInfo">
          刷新
        </view>
      </view>
      <view v-for="item in webviewInfoRows" :key="item.label" class="mt-3 border-t border-slate-200 pt-2">
        <text class="block text-xs text-slate-500">{{ item.label }}</text>
        <text selectable class="mt-1 block break-all text-[24rpx] leading-5 text-slate-800">{{ item.value }}</text>
      </view>
    </view>
    <div class="flex space-x-4 border" :class="{
      'space-x-reverse': reverseFlag,
      'flex-row-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex flex-col space-y-4 border" :class="{
      'space-y-reverse': reverseFlag,
      'flex-col-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <div class="flex divide-x-4 border p-2 divide-[#d80c0c] divide-double" :class="{
      'divide-x-reverse': reverseFlag,
      'flex-row-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>

    <div class="flex flex-col divide-y-4 border p-2 divide-[#41eb04] divide-dotted" :class="{
      'divide-y-reverse': reverseFlag,
      'flex-col-reverse': reverseFlag
    }">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>
    <button @click="reverseFlag = !reverseFlag">reverseFlag</button>
    <input v-model="aaa" />
    <HelloWorld v-model="aaa"></HelloWorld>
  </view>
</template>

<script setup lang="ts">
import { twMerge } from '@weapp-tailwindcss/merge'
import { weappTwIgnore } from "weapp-tailwindcss/escape"
import HelloWorld from "@/components/HelloWorld.vue"
import { onMounted, ref } from 'vue'

interface WebviewInfoRow {
  label: string
  value: string
}

type GlobalWithPlus = typeof globalThis & {
  plus?: {
    navigator?: {
      getUserAgent?: () => string
    }
    os?: Record<string, unknown>
    runtime?: Record<string, unknown>
    webview?: {
      currentWebview?: () => {
        id?: string
        getURL?: () => string
      }
    }
  }
}

const title = ref('Hello')
const className = ref('bg-[#0000ff] text-[45rpx] text-white')
const templateCorpusDynamicClass = 'template-corpus-dynamic bg-[#68c828] text-[100rpx] w-[323px] h-[45px]'
const reverseFlag = ref(false)
const webviewInfoRows = ref<WebviewInfoRow[]>([
  { label: 'status', value: 'collecting App WebView runtime...' }
])

const aaa = ref('111')
const world = {
  Accept: `text/event-stream`,
  CCC: `text` + `/evexstream`,
  BBB: weappTwIgnore`bg-[#123498]`
}
console.log(world, twMerge)

function stringifyInfoValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

function pushInfoRow(rows: WebviewInfoRow[], label: string, value: unknown) {
  const text = stringifyInfoValue(value)
  if (text) {
    rows.push({ label, value: text })
  }
}

function readRecordValue(record: Record<string, unknown> | undefined, key: string) {
  return record ? record[key] : undefined
}

function matchUserAgent(userAgent: string, pattern: RegExp) {
  return userAgent.match(pattern)?.[1]
}

function createWebviewEngineRows(userAgent: string) {
  const rows: WebviewInfoRow[] = []
  const isAndroid = /Android/i.test(userAgent)
  const isIOS = /\b(?:iPhone|iPad|iPod)\b/i.test(userAgent)
  const chromeVersion = matchUserAgent(userAgent, /\b(?:Chrome|Chromium|CriOS)\/([\d.]+)/i)
  const webkitVersion = matchUserAgent(userAgent, /\bAppleWebKit\/([\d.]+)/i)
  const safariVersion = matchUserAgent(userAgent, /\bVersion\/([\d.]+)/i)
    ?? matchUserAgent(userAgent, /\bSafari\/([\d.]+)/i)
  const mobileBuild = matchUserAgent(userAgent, /\bMobile\/([A-Za-z0-9]+)/i)
  const androidWebViewMarker = /\bwv\b/i.test(userAgent) || /\bVersion\/4\.0\b/i.test(userAgent)

  pushInfoRow(rows, 'webview.engine', isAndroid
    ? 'Android System WebView / Chromium'
    : isIOS
      ? 'iOS WKWebView / AppleWebKit'
      : 'Unknown WebView engine')
  pushInfoRow(rows, 'webview.androidChromiumVersion', chromeVersion)
  pushInfoRow(rows, 'webview.androidWebViewMarker', isAndroid ? String(androidWebViewMarker) : '')
  pushInfoRow(rows, 'webview.iosAppleWebKitVersion', webkitVersion)
  pushInfoRow(rows, 'webview.iosSafariVersion', isIOS ? safariVersion : '')
  pushInfoRow(rows, 'webview.iosMobileBuild', isIOS ? mobileBuild : '')
  return rows
}

function readUserAgent(plusObject: GlobalWithPlus['plus']) {
  try {
    const plusUserAgent = plusObject?.navigator?.getUserAgent?.()
    if (plusUserAgent) {
      return plusUserAgent
    }
  }
  catch {
  }
  return typeof navigator === 'undefined' ? '' : navigator.userAgent
}

function refreshWebviewInfo() {
  const rows: WebviewInfoRow[] = []
  const systemInfo = uni.getSystemInfoSync() as unknown as Record<string, unknown>
  const plusObject = (globalThis as GlobalWithPlus).plus
  const userAgent = readUserAgent(plusObject)
  let currentWebview: ReturnType<NonNullable<NonNullable<GlobalWithPlus['plus']>['webview']>['currentWebview']> | undefined

  try {
    currentWebview = plusObject?.webview?.currentWebview?.()
  }
  catch {
  }

  pushInfoRow(rows, 'uni.uniPlatform', readRecordValue(systemInfo, 'uniPlatform'))
  pushInfoRow(rows, 'uni.platform', readRecordValue(systemInfo, 'platform'))
  pushInfoRow(rows, 'uni.system', readRecordValue(systemInfo, 'system'))
  pushInfoRow(rows, 'uni.osName', readRecordValue(systemInfo, 'osName'))
  pushInfoRow(rows, 'uni.osVersion', readRecordValue(systemInfo, 'osVersion'))
  pushInfoRow(rows, 'device.brand', readRecordValue(systemInfo, 'brand') ?? readRecordValue(systemInfo, 'deviceBrand'))
  pushInfoRow(rows, 'device.model', readRecordValue(systemInfo, 'model') ?? readRecordValue(systemInfo, 'deviceModel'))
  pushInfoRow(rows, 'plus.os.name', plusObject?.os?.name)
  pushInfoRow(rows, 'plus.os.version', plusObject?.os?.version)
  pushInfoRow(rows, 'plus.runtime.version', plusObject?.runtime?.version)
  pushInfoRow(rows, 'plus.runtime.innerVersion', plusObject?.runtime?.innerVersion)
  pushInfoRow(rows, 'plus.runtime.appid', plusObject?.runtime?.appid)
  pushInfoRow(rows, 'plus.webview.id', currentWebview?.id)
  pushInfoRow(rows, 'plus.webview.url', currentWebview?.getURL?.())
  rows.push(...createWebviewEngineRows(userAgent))
  pushInfoRow(rows, 'navigator.userAgent', userAgent)

  webviewInfoRows.value = rows.length > 0 ? rows : [{ label: 'status', value: 'No WebView runtime info collected' }]
  console.log('[uni-app-vite] App WebView Runtime', Object.fromEntries(webviewInfoRows.value.map(item => [item.label, item.value])))
}

onMounted(() => {
  refreshWebviewInfo()
  setTimeout(refreshWebviewInfo, 300)
  if (!(globalThis as GlobalWithPlus).plus && typeof document !== 'undefined') {
    document.addEventListener('plusready', refreshWebviewInfo, { once: true })
  }
})

const goOrder = () => {
  uni.navigateTo({
    url: '/pages-order/pages/home/home'
  })
}
</script>
