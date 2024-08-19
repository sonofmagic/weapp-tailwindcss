<script setup lang="ts">
import debounce from 'lodash/debounce'
import { devDependencies } from '../../../package.json'
import BaseLayout from '@/components/BaseLayout.vue'
import FloatButton from '@/components/FloatButton.vue'
import { useSystemStore } from '@/stores'
import { documentationNav } from '@/stores/documentation'
import Navbar from '@/components/Navbar.vue'

const version = devDependencies.tailwindcss.slice(1)

const store = useSystemStore()
const keyword = ref('')
const searchVisible = ref(false)
const searchResult = ref<SearchItem[]>([])

function openSearchBox() {
  searchVisible.value = true
}

function toggleTheme() {
  if (store.theme === 'dark') {
    store.setTheme('light')
  }
  else {
    store.setTheme('dark')
  }
}

function go2ThemeDemo() {
  uni.navigateTo({
    url: '/pages/theme/index',
  })
}

type Child = string | { title: string, href: string }

interface NavItem {
  name: string
  children: Child[]
  current: number
  disabled?: boolean
  open: boolean
}

interface SearchItem {
  title: string
  parent: string
}

const navs = Object.entries(documentationNav).reduce<NavItem[]>((acc, cur) => {
  acc.push({
    name: cur[0],
    children: cur[1],
    current: -1,
    disabled: false,
    open: false,
  })
  return acc
}, [])

function search(value: string) {
  doSearch(value)
}

function doSearch(text: string = '', num: number = 50) {
  let total = 0
  const arr: SearchItem[] = []
  for (let i = 0; i < navs.length; i++) {
    const nav = navs[i]
    for (let j = 0; j < nav.children.length; j++) {
      const child = nav.children[j]
      if (typeof child === 'string') {
        if (child.includes(text)) {
          arr.push({
            title: child,
            parent: nav.name,
          })
          total++
        }
      }
      if (total >= num) {
        break
      }
    }
    if (total >= num) {
      break
    }
  }
  searchResult.value = arr
}

function close() {
  searchVisible.value = false
}

function go2Detail(t: string) {
  uni.navigateTo({
    url: `/pages/index/detail?t=${t}`,
  })
}

function open() {

}

const debounceSearch = debounce(() => {
  if (keyword.value && keyword.value.length > 0) {
    search(keyword.value)
  }
}, 200)

function copy(data: string) {
  uni.setClipboardData({
    data,
  })
}
</script>

<template>
  <BaseLayout>
    <Navbar>
      <template #left>
        <view class="relative flex items-center">
          <view class="i-logos-tailwindcss-icon mr-2 h-[20.57px] w-[34px] shrink-0" />
          <view class="text-lg font-semibold">
            Tailwind CSS
          </view>
          <view
            class="relative bottom-0.5 ml-1 self-end rounded-full bg-sky-400/10 px-2 py-0.5 text-xs font-medium text-sky-600"
          >
            {{ version }}
          </view>
        </view>
      </template>
    </Navbar>
    <view>
      <up-collapse>
        <up-collapse-item v-for="nav in navs" :key="nav.name" :name="nav.name" :title="nav.name">
          <up-cell-group :border="false">
            <up-cell v-for="child in nav.children" :key="child" :title="child" is-link clickable :url="`/pages/index/detail?t=${child}`" />
          </up-cell-group>
        </up-collapse-item>
      </up-collapse>
    </view>
    <view class="py-4 text-center text-sm text-slate-900 dark:text-slate-200">
      <view class="mb-3 flex items-center justify-center" @click="copy('https://github.com/sonofmagic')">
        made by <view class="ml-2 flex items-center justify-center">
          <view class="i-mdi-github mr-1 size-6" /> sonofmagic
        </view>
      </view>
      <view class="flex items-center justify-center" @click="copy('https://github.com/sonofmagic/weapp-tailwindcss')">
        @powered by
        <image class="ml-2 w-6" src="../../../../assets/logo.png" mode="widthFix" />
        weapp-tailwindcss!
      </view>
    </view>
    <u-popup :show="searchVisible" mode="bottom" :round="10" @close="close" @open="open">
      <view class="h-[50vh] dark:bg-slate-900">
        <view class="p-[8px]">
          <u-search v-model="keyword" placeholder="请输入关键词" @search="search" @custom="search" @change="debounceSearch" />
        </view>
        <scroll-view scroll-y style="height: calc(50vh - 50px)">
          <template v-if="searchResult.length > 0">
            <u-cell v-for="(item, idx) in searchResult" :key="idx" is-link @click="go2Detail(item.title)">
              <template #title>
                <view class="flex space-x-1 text-sm">
                  <view class="text-gray-500 dark:text-white">
                    {{ item.parent }}
                  </view>
                  <view class="text-gray-600 dark:text-slate-400">
                    >
                  </view>
                  <view class="font-semibold text-gray-700 dark:text-slate-400">
                    {{ item.title }}
                  </view>
                </view>
              </template>
            </u-cell>
          </template>
          <template v-else>
            <view class="pt-4">
              <u-empty mode="list" />
            </view>
          </template>
        </scroll-view>
      </view>
    </u-popup>
    <FloatButton store-key="index-float-btn" :padding="[256, 32, 256, 32]">
      <view class="float-btn mb-3">
        <view class="i-mdi-flask-round-bottom-empty-outline text-sky-400 dark:text-sky-500" @click="go2ThemeDemo" />
      </view>
      <view class="float-btn mb-3" @click="toggleTheme">
        <view v-if="store.theme === 'dark'" class="i-mdi-white-balance-sunny text-sky-500" />
        <view v-else class="i-mdi-weather-night text-sky-400" />
      </view>
      <view class="float-btn" @click="openSearchBox">
        <view class="i-mdi-magnify text-sky-400 dark:text-sky-500" />
      </view>
    </FloatButton>
  </BaseLayout>
</template>
