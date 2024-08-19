#### 1. 安装 `tailwindcss`

```bash
# npm / yarn / pnpm
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

#### 2. 把 `tailwindcss` 注册进 `postcss.config.js`

```js
// postcss.config.js
// 假如你使用的框架/工具不支持 postcss.config.js，则可以使用内联的写法
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

#### 3. 配置 `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录进行配置
  // 不在 content 包括的文件内，不会生成工具类
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],

  corePlugins: {
    // 不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false
  }
}
```

#### 4. 引入 `tailwindcss`

在你的项目入口引入 `tailwindcss`

比如 `uni-app` 的 `App.vue`

```html
<style lang="scss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  /* 使用 scss */
  @import 'tailwindcss/base';
  @import 'tailwindcss/components';
  @import 'tailwindcss/utilities';
</style>
```

又或者 `Taro` 的 `app.scss`

```scss
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

然后在 `app.ts` 里引入

> Q&A: 为什么没有引入 `tailwindcss/components`? 是因为里面默认存放的是 pc 端自适应相关的样式，对小程序环境来说没有用处。如果你有 @layer components 相关的工具类需要使用，可以引入。
