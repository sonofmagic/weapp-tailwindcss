# uni-app 条件编译语法糖插件

> 版本需求 2.10.0+

## 这是什么玩意?

在 `uni-app` 里，存在一种类似宏指令的[样式条件编译写法](https://uniapp.dcloud.net.cn/tutorial/platform.html#%E6%A0%B7%E5%BC%8F%E7%9A%84%E6%9D%A1%E4%BB%B6%E7%BC%96%E8%AF%91):

```css
/*  #ifdef  %PLATFORM%  */
平台特有样式
/*  #endif  */
```

> uni-app `%PLATFORM%` 的所有取值可以参考这个[链接](https://uniapp.dcloud.net.cn/tutorial/platform.html#preprocessor)

在 `weapp-tailwindcss@2.10.0+` 版本中内置了一个 `css-macro` 功能，可以让你的 `tailwindcss` 自动生成带有条件编译的样式代码，来辅助你进行多平台的适配开发，效果类似如下方式:

```html
<!-- 默认 -->
<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">Web和微信小程序平台蓝色背景</view>
<view class="ifndef-[MP-WEIXIN]:bg-red-500">非MP-WEIXIN平台红色背景</view>
<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">微信小程序为蓝色，不是微信小程序为红色<view>
<!-- 自定义 -->
<view class="wx:bg-blue-400 -wx:bg-red-400">微信小程序为蓝色，不是微信小程序为红色</view>
<view class="tt:bg-blue-400">头条小程序蓝色</view>
```

或者这样的条件样式代码:

```css
/*只在 H5 和 MP-WEIXIN, 背景为蓝色，否则为红色 */
.apply-test-0 {
  @apply ifdef-[H5||MP-WEIXIN]:bg-blue-400 ifndef-[H5||MP-WEIXIN]:bg-red-400;
}
/* 自定义 */
.apply-test-1 {
  @apply mv:bg-blue-400 -mv:bg-red-400 wx:text-blue-400 -wx:text-red-400;
}
```

让我们看看如何使用吧！

## 如何使用

这里需要同时配置 `tailwindcss` 和 `postcss` 的配置文件才能起作用，其中 `tailwindcss` 配置修改的方式大体类似， `uni-app` `vue2/3` `postcss`插件的注册方式，有些许不同:

### tailwind.config.js 注册

首先在你的 `tailwind.config.js` 注册插件 `cssMacro`:

```js
const cssMacro = require('weapp-tailwindcss/css-macro');
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ...
  plugins: [
    /* 这里可以传入配置项，默认只包括 ifdef 和 ifndef */
    cssMacro(),
  ],
};
```

### postcss 插件注册

对应的 `postcss` 插件位置为 `weapp-tailwindcss/css-macro/postcss`

值得注意的是，你必须把这个插件，注册在 `tailwindcss` 之后和 `@dcloudio/vue-cli-plugin-uni/packages/postcss` 之前。

> `@dcloudio/vue-cli-plugin-uni/packages/postcss` 为 vue2 cli项目特有，vue3不用管。

注册在 `tailwindcss` 之后很好理解，我们在针对 `tailwindcss` 的产物做修改，自然要在它执行之后处理，注册在 `@dcloudio/vue-cli-plugin-uni/packages/postcss` 之前则是因为 `uni-app` 样式的条件编译，靠的就是它。假如在它之后去处理不久已经太晚了嘛。

> 这里提一下 postcss 插件的执行顺序，假如注册是数组，那就是按照顺序执行，如果是对象，那就是从上往下执行，详见[官方文档](https://www.npmjs.com/package/postcss-load-config#ordering)

#### uni-app vite vue3

```diff
// vite.config.ts 文件
import { defineConfig } from 'vite';
// postcss 插件配置
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()];
// ... 其他省略
+ postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'));
// https://vitejs.dev/config/
export default defineConfig({
  plugins: vitePlugins,
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
});
```

> 可以参考这个项目的配置 [demo/uni-app-vue3-vite](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/uni-app-vue3-vite)

#### uni-app vue2

vue2 cli 项目默认会带一个 `postcss.config.js` 我们之间直接在里面注册即可:

```diff
const webpack = require('webpack')
const config = {
  parser: require('postcss-comment'),
  plugins: [
    // ...
    require('tailwindcss')({ config: './tailwind.config.js' }),
    // ...
+   require('weapp-tailwindcss/css-macro/postcss'),
    require('autoprefixer')({
      remove: process.env.UNI_PLATFORM !== 'h5'
    }),
+   // 注意在 tailwindcss 之后和 这个之前
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')
  ]
}
if (webpack.version[0] > 4) {
  delete config.parser
}
module.exports = config
```

> 可以参考这个项目的配置 [demo/uni-app](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/uni-app)

### 配置完成

现在配置好了这2个地方，目前你就可以直接使用 `ifdef` 和 `ifndef` 的条件编译写法了！

```html
<!-- 默认 -->
<view class="ifdef-[H5||MP-WEIXIN]:bg-blue-400">Web和微信小程序平台蓝色背景</view>
<view class="ifndef-[MP-WEIXIN]:bg-red-500">非MP-WEIXIN平台红色背景</view>
<view class="ifdef-[MP-WEIXIN]:bg-blue-500 ifndef-[MP-WEIXIN]:bg-red-500">微信小程序为蓝色，不是微信小程序为红色<view>
<!-- 自定义 -->
<view class="wx:bg-blue-400 -wx:bg-red-400">微信小程序为蓝色，不是微信小程序为红色</view>
<view class="tt:bg-blue-400">头条小程序蓝色</view>
```

不过你肯定会觉得这种默认写法很烦！要写很多，不要紧，我还为你提供了自定义的方式，接下来来看看配置项吧！

## 配置项

这里提供了一份示例，

> uni-app `%PLATFORM%` 的所有取值可以参考这个[链接](https://uniapp.dcloud.net.cn/tutorial/platform.html#preprocessor)

```js
const cssMacro = require('weapp-tailwindcss/css-macro');
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ...
  plugins: [
    /* 这里可以传入配置项，默认只包括 ifdef 和 ifndef */
    cssMacro({
      // 是否包含 ifdef 和 ifndef，默认为 true
      // dynamic: true,
      // 传入一个 variantsMap
      variantsMap: {
        // wx 对应的 %PLATFORM% 为 'MP-WEIXIN'
        // 有了这个配置，你就可以使用 wx:bg-red-300
        wx: 'MP-WEIXIN',
        // -wx，语义上为非微信
        // 那就传入一个 obj 把 negative 设置为 true 
        // 就会编译出 ifndef 的指令
        // 有了这个配置，你就可以使用 -wx:bg-red-300
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true
        },
        mv: {
          // 可以使用表达式
          value: 'H5 || MP-WEIXIN'
        },
        '-mv': {
          // 可以使用表达式
          value: 'H5 || MP-WEIXIN',
          negative: true
        }
      }
    }),
  ],
};
```
