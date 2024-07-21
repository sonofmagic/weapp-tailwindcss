<script lang="ts" setup>
import mpHtml from 'uni-app-mp-html/components/mp-html/mp-html.vue'
import Theme from './custom/Theme.vue'
import CssVarBtn from './custom/CssVarBtn.vue'
import VariantBtn from './custom/VariantBtn.vue'

enum ModeEnum {
  light = 'light',
  deep = 'deep',
  dark = 'dark',
  fantasy = 'fantasy',
}
const cssVarsMap: Record<ModeEnum, Record<string, string>> = {
  light: {
    '--ice-color-base': '191, 219, 254',
    '--ice-color-primary': '30, 58, 138',
    '--ice-color-primary-content': '255, 255, 255',
  },
  deep: {
    '--ice-color-base': '125, 211, 252',
    '--ice-color-primary': '79, 70, 229',
    '--ice-color-primary-content': '255, 255, 255',
  },
  dark: {
    '--ice-color-base': '2, 132, 199',
    '--ice-color-primary': '165, 180, 252',
    '--ice-color-primary-content': '0,0,0',
  },
  fantasy: {
    '--ice-color-base': '8, 47, 73',
    '--ice-color-primary': '224, 231, 255',
    '--ice-color-primary-content': '0,0,0',
  },
}
const mode = ref(ModeEnum.light)

const currentCssVar = computed(() => {
  return Object.entries(cssVarsMap[mode.value])
    .map(([k, v]) => {
      return `${k}:${v};`
    })
    .join('')
})

function toggleTheme(t: ModeEnum) {
  console.log(t)
  mode.value = t
}

const VariantContent
      /* weapp-tw ignore */
      = '```html\n<view class="bg-green-50\n deep:bg-green-300\n dark:bg-green-600\n fantasy:bg-green-950"></view>\n```'

const CssVarContent
      = '```js\n'
      + `colors: {
  'primary': 'rgba(var(--ice-color-primary), <alpha-value>)',
  'primary-content': 'rgba(var(--ice-color-primary-content), <alpha-value>)',
  'base': 'rgba(var(--ice-color-base), <alpha-value>)'
}`
      + '\n```'

function viewCode() {
  uni.navigateTo({
    url: '/pages/theme/code',
  })
}
const visibles = ref({
  a: false,
  b: false,
})
function toggleCode(idx: 'a' | 'b') {
  visibles.value[idx] = !visibles.value[idx]
}
</script>

<template>
  <view>
    <Theme :mode="mode" :css-vars="currentCssVar">
      <view class="min-h-[50vh] bg-base py-2 transition-colors duration-300">
        <view
          class="mb-2 px-2 text-sm transition-colors duration-300 fantasy:text-white dark:text-gray-200"
        >
          CssVar 方案， 一个原子化对应一/n个动态的 css var
        </view>

        <view v-show="visibles.a">
          <mpHtml markdown :content="CssVarContent" />
        </view>
        <view class="mb-2 flex justify-around">
          <view v-for="v in ModeEnum" :key="v">
            <CssVarBtn @click="toggleTheme(v)">
              {{ v }}
            </CssVarBtn>
          </view>
        </view>
        <view class="flex justify-evenly">
          <view
            class="i-mdi-application-braces text-5xl text-primary transition-colors duration-300"
            @click="toggleCode('a')"
          />
          <CssVarBtn @click="viewCode">
            查看tailwind.config.js
          </CssVarBtn>
        </view>
      </view>
      <view
        class="min-h-[50vh] bg-green-50 p-2 transition-colors duration-300 deep:bg-green-300 fantasy:bg-green-950 dark:bg-green-600"
      >
        <view
          class="mb-2 text-sm transition-colors duration-300 fantasy:text-white dark:text-gray-200"
        >
          Variant 方案，语义化的原子类生成全局样式利用优先级进行覆盖
        </view>
        <view v-show="visibles.b">
          <mpHtml markdown :content="VariantContent" />
        </view>
        <view class="mb-2 flex justify-around">
          <view v-for="v in ModeEnum" :key="v">
            <VariantBtn @click="toggleTheme(v)">
              {{ v }}
            </VariantBtn>
          </view>
        </view>
        <view class="flex justify-evenly">
          <view
            class="i-mdi-application-braces bg-pink-900 text-5xl text-white transition-colors duration-300 deep:bg-pink-600 deep:text-gray-300 fantasy:bg-pink-100 fantasy:text-gray-900 dark:bg-pink-300 dark:text-gray-600"
            @click="toggleCode('b')"
          />
          <VariantBtn @click="viewCode">
            查看tailwind.config.js
          </VariantBtn>
        </view>
      </view>
    </Theme>
  </view>
</template>
