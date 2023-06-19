# tailwindcss 多上下文与独立分包

在日常开发中，我们经常遇到这样的问题，一个程序，它有很多个组成的部分，每一个组成部分也有独立的入口。

这些部分可以独立运行，相互之间没有任何的依赖。

在这种场景下，使用 `tailwindcss` 就往往需要去创建多个上下文，让这些上下文各自去管理我们程序中的一块区域。

当然我写到这，相信大家也啥都没看懂，于是我搬出一个小程序中，独立分包的示例，来让大家理解这种思想。

## 什么是独立分包

独立分包是小程序中一种特殊类型的分包，可以独立于主包和其他分包运行。从独立分包中页面进入小程序时，不需要下载主包。当用户进入普通分包或主包内页面时，主包才会被下载。

独立分包属于分包的一种。普通分包的所有限制都对独立分包有效。独立分包中插件、自定义组件的处理方式同普通分包。此外，使用独立分包时要注意：

1. 独立分包中不能依赖主包和其他分包中的内容，包括 js 文件、template、wxss、自定义组件、插件等（使用 分包异步化 时 js 文件、自定义组件、插件不受此条限制）
0. 主包中的 `app.wxss` 对独立分包无效，应避免在独立分包页面中使用 `app.wxss` 中的样式；
0. App 只能在主包内定义，独立分包中不能定义 App，会造成无法预期的行为；
0. 独立分包中暂时不支持使用插件。

> 更多信息详见 [微信独立分包官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html)

---

这里要特别注意第二条: **主包中的 `app.wxss` 对独立分包是无效的!!!**

在我之前提供的配置示例中，所有 `tailwindcss` 生成的 `wxss` 工具类都是在主包里的，这在大部分情况下使用良好，然而这在独立分包场景下，是不行的！

那么应该怎么做才能解决这个问题呢？

## 创建与配置示例

这里笔者先以 `taro@3.6.7` 和 `weapp-tailwindcss@2.5.0` 版本的项目作为示例

首先在 `config/index.js` 中关闭 `prebundle` 功能，因为这在独立分包场景下会报一些未知的错误:

```js
const config = {
  compiler: {
    prebundle: {
      enable: false,
    },
    type: 'webpack5'
  },
  // .....
}
```

其次关闭插件对 `tailwindcss css var` 主块的寻址行为：

```js
chain.merge({
  plugin: {
    install: {
      plugin: UnifiedWebpackPluginV5,
      args: [{
        // 方法1: 不传 appType
        // appType : 'taro'
        // 或者方法2: 所有css chunk 都是 main chunk
        // mainCssChunkMatcher: ()=> true
        // 2 种选其一即可
      }]
    }
  }
})
```

接下来我们就可以创建一个独立分包 `moduleB`，在里面新建一个 `"pages/index"` 页面，然后在 `app.config.ts` 里注册它:

```js
  subpackages: [
    {
      root: "moduleB",
      pages: [
        "pages/index",
      ],
      // 下方这个标志位，声明独立分包
      independent: true
    },
  ]
```

## 单 `tailwindcss` 上下文的方案（不推荐）

这个方案是一个不完美的方案，在这里写出来是为了促进大家对 `tailwindcss` 的理解。

首先在独立分包中，也创建一个 `index.scss` 内容为:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```

然后让所有独立分包中的页面引用它，这样打包之后，独立分包里的 `tailwindcss` 样式也就生效了。

然而这种方式有一个巨大的问题，就是它会带来严重的 `css` 冗余。

实际上，由于此时 `tailwindcss` 上下文有且仅有一个，它会把所有这个项目中，提取出来的 `css` 工具类，注入到所有的 `@tailwind` 指令中。

这导致了，主包里的 `app.wxss` 里，包含主包里所有的 `class` + 独立分包里所有的 `class`，而独立分包里的 `index.scss` 里，也包含主包里所有的 `class` + 独立分包里所有的 `class`!

这显然是不可接受的，因为主包里没有必要包含 独立分包的 `class`，而独立分包里也没有必要包含主包里的 `class`! 这个方案需要改进!

## 多 `tailwindcss` 上下文的方案

由于上面那个方案的问题，我们开始改进就必须要创建多个 `tailwindcss` 上下文。

### 创建多个 `tailwind.config.js`

这里我们只有一个独立分包，所以我们创建了2个 `tailwind.config.js`:

1. `tailwind.config.js` 用于主包以及相互依赖的子包
2. `tailwind.config.sub.js` 用于 `moduleB` 这个独立分包

内容如下

#### 独立分包的上下文配置

```js
// tailwind.config.sub.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里只提取 moduleB 这个独立分包下的文件内容
  content: ["./src/moduleB/**/*.{html,js,ts,jsx,tsx}"],
  // ....
  corePlugins: {
    preflight: false
  }
}
```

#### 主包以及相互依赖的子包的上下文配置

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://github.com/mrmlnc/fast-glob
  // 这里需要限定范围，不去提取 moduleB 这个独立分包下的文件内容
  // 所以后面跟了一个 `!` 开头的路径
  content: ["./src/**/*.{html,js,ts,jsx,tsx}", "!./src/moduleB/**/*.{html,js,ts,jsx,tsx}"],
  // ....
  corePlugins: {
    preflight: false
  }
}
```

这样 `2` 个配置文件创建好了，接下来就要通过配置让它们各自在打包中生效

### `postcss.config.js` 配置

这是非常重要的一块配置，我们需要把 `postcss.config.js` 的配置变成一个函数，这样才能把构建时的上下文传入进来：

```js
const path = require('path')

module.exports = function config(loaderContext) {
  // moduleB 下面的所有 scss 文件，都是独立模块的，应用不同的 tailwindcss 配置
  const isIndependentModule = /moduleB[/\\](?:\w+[/\\])*\w+\.scss$/.test(
    loaderContext.file
  )
  if (isIndependentModule) {
    return {
      plugins: {
        tailwindcss: {
          config: path.resolve(__dirname, 'tailwind.config.sub.js')
        },
        autoprefixer: {},
      }
    }
  }
  return {
    plugins: {
      // 不传默认取 tailwind.config.js
      tailwindcss: {},
      autoprefixer: {},
    }
  }
}
```

通过这种方式，我们成功的创建了 `2` 个不同的 `tailwindcss` 上下文，此时你进行打包之后，会发现

主包里的 `app.wxss` 和独立分包里的 `index.wxss` 这种构建产物，里面的内容已经各归各了，不再相互包含了。

## 参考示例

示例见:<https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/taro-app>
