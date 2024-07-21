<script setup lang="ts">
import debounce from 'lodash/debounce'
import { useSystemStore } from '@/stores'

const props = defineProps({
  storeKey: {
    type: String,
    default: '',
  },
  padding: {
    type: Array,
    default: () => [256, 32, 64, 32],
  },
})

const store = useSystemStore()

const btnWidth = uni.upx2px(80)
const edgeWidth = uni.upx2px(32)

const position = reactive({
  x: 0,
  y: 0,
})

async function touchend() {
  console.log('touchend')
  // await $nextTick()
  setTimeout(() => {
    if (

      position.x
      > (store.systemInfo.windowWidth - btnWidth - edgeWidth * 2) / 2
    ) {
      position.x = store.systemInfo.windowWidth
    }
    else {
      position.x = 0
    }
    if (props.storeKey) {
      setTimeout(() => {
        uni.setStorageSync(
          props.storeKey,
          JSON.stringify({
            x: position.x,
            y: position.y,
          }),
        )
      }, 0)
    }
  }, 200)
}

const resetToYaxis = debounce((x, y, source) => {
  if (source) {
    position.x = x
    position.y = y
  }

  console.log('[Final]', x, y, source)
}, 100)

function fabChange(event: Event) {
  // @ts-ignore
  if (event && event.detail) {
    // @ts-ignore
    const { x, y, source } = event.detail

    resetToYaxis(x, y, source)
  }
}

if (store.systemInfo) {
  const { windowHeight, windowWidth } = store.systemInfo
  position.x = windowWidth
  position.y = windowHeight / 1.25
}

if (props.storeKey) {
  try {
    const p = uni.getStorageSync(props.storeKey)
    if (p) {
      Object.assign(position, JSON.parse(p))
    }
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <view
    class="pointer-events-none fixed z-50" :style="{
      top: `${padding[0]}rpx`,
      right: `${padding[1]}rpx`,
      bottom: `${padding[2]}rpx`,
      left: `${padding[3]}rpx`,
    }"
  >
    <movable-area class="size-full">
      <movable-view
        direction="all" :x="position.x" :y="position.y" class="size-10" @change="fabChange"
        @touchend="touchend"
      >
        <view v-if="$slots.expand" class="padding-box absolute flex w-10 flex-col" style="bottom: 100rpx">
          <slot name="expand" />
        </view>

        <slot />
      </movable-view>
    </movable-area>
  </view>
</template>
