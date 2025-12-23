<script setup lang="ts">
import BaseLayout from '@/components/BaseLayout.vue'
import Fab from '@/components/FloatButton.vue'
import Navbar from '@/components/Navbar.vue'
import { useSystemStore } from '@/stores'
import camelCase from 'lodash/camelCase'
import redent from 'redent'

const store = useSystemStore()

interface TableItem {
  Class: string
  Properties: string[]
}

const listData = ref<TableItem[]>([])
const tipsContent = `${['长按行可以复制当前行的值']
  .map((x, idx) => {
    return `${idx + 1}. ${x}`
  })
  .join('\n')}`

const plugin = ref('')
const title = ref('')
const tipVisible = ref(false)
const header = [
  {
    title: 'Class',
    key: 'Class',
  },
  {
    title: 'Properties',
    key: 'Properties',
  },
]

const currentUrl = computed(() => {
  return `/pages/index/detail?t=${title.value}`
})

function showTips() {
  tipVisible.value = true
}

function longpressCopy(item: TableItem) {
  const copyValue = [
    `${item.Class} {`,
    `  ${item.Properties.join('\n  ')}`,
    '}',
  ].join('\n')

  uni.setClipboardData({
    data: copyValue,
  })
}

onLoad((params) => {
  title.value = params?.t as string
  plugin.value = camelCase(title.value)
  switch (plugin.value) {
    case 'topRightBottomLeft': {
      plugin.value = 'inset'
      break
    }
    case 'screenReaders': {
      plugin.value = 'accessibility'
      break
    }
    default: {
      break
    }
  }
  if (plugin.value === 'animation') {
    listData.value = [
      {
        Class: 'animate-none',
        Properties: ['animation: none;'],
      },
      {
        Class: 'animate-spin',
        Properties: [
          redent(`
              animation: spin 1s linear infinite;\n
              @keyframes spin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `).trim(),
        ],
      },
      {
        Class: 'animate-ping',
        Properties: [
          redent(`
              animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n
              @keyframes ping {
                75%, 100% {
                  transform: scale(2);
                  opacity: 0;
                }
              }
            `).trim(),
        ],
      },
      {
        Class: 'animate-pulse',
        Properties: [
          redent(`
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: .5;
                }
              }
            `).trim(),
        ],
      },
      {
        Class: 'animate-bounce',
        Properties: [
          redent(`
              animation: bounce 1s infinite;\n
              @keyframes bounce {
                0%, 100% {
                  transform: translateY(-25%);
                  animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
                }
                50% {
                  transform: translateY(0);
                  animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
                }
              }
            `).trim(),
        ],
      },
    ]
  }
  else {
    listData.value = Object.entries(store.getPluginsById(plugin.value)).map(
      (x) => {
        return {
          Class: x[0],
          // @ts-ignore
          Properties: Object.entries(x[1]).map(([key, value]) => {
            return `${key}: ${value};`
          }),
        }
      },
    )
  }

  uni.setNavigationBarTitle({
    title: title.value,
  })
})

onShareAppMessage(() => {
  return {
    title: plugin.value,
    path: currentUrl.value,
  }
})

onShareTimeline(() => {
  return {
    title: plugin.value,
    path: currentUrl.value,
  }
})
</script>

<template>
  <BaseLayout>
    <Navbar auto-back>
      <template #center>
        {{ title }}
      </template>
    </Navbar>
    <view class="px-4">
      <view class="tw-table">
        <view class="thead sticky top-0 z-50 bg-white transition-colors duration-500 dark:bg-slate-900">
          <view class="tr">
            <view class="w-4/12">
              <view class="flex py-2 pr-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <text class="mr-2">
                  {{ header[0].title }}
                </text>
                <u-icon name="question-circle" @click="showTips" />
              </view>
            </view>
            <view class="w-8/12">
              <view class="py-2 pl-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {{
                  header[1].title
                }}
              </view>
            </view>
          </view>
        </view>
        <view class="tbody">
          <view
            v-for="(item, index) in listData" :key="index" class="tr" hover-class="hover-gray-100"
            @longpress="longpressCopy(item)"
          >
            <template v-for="(obj, idx) in header" :key="idx">
              <view :class="idx === 0 ? 'w-4/12' : 'w-8/12'">
                <template v-if="Array.isArray(item[obj.key])">
                  <view class="whitespace-pre-wrap py-2 pl-2  text-xs text-indigo-600 dark:text-indigo-300">
                    <view v-for="(r, i) in item[obj.key]" :key="i">
                      {{ r }}
                    </view>
                  </view>
                </template>
                <template v-else>
                  <view
                    class="
                    whitespace-pre-wrap
                    py-2
                    pr-2 text-xs font-medium
                    text-sky-500
                    dark:text-sky-400
                  "
                  >
                    {{ item[obj.key] }}
                  </view>
                </template>
              </view>
            </template>
          </view>
        </view>
        <!-- <view></view> -->
      </view>

      <u-modal :show="tipVisible" title="操作提示" :content="tipsContent" @confirm="tipVisible = false" />
      <Fab store-key="detail-float-btn">
        <button
          class="
          u-reset-button
          pointer-events-auto
          flex
          size-10
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-sm
          dark:bg-slate-700

        " open-type="share"
        >
          <i class="i-ri-wechat-fill text-xl text-[#07c160]" />
        </button>
      </Fab>
    </view>
  </BaseLayout>
</template>

<style lang="scss">
.tw-table {
  .thead {
    .tr {
      @apply border-b border-slate-200 dark:border-slate-400/20;
    }
  }

  .tbody {
    .tr {
      @apply border-b border-slate-100 dark:border-slate-400/10;
    }
  }

  .tr {
    @apply flex;

    .td {
    }
  }
}
</style>
