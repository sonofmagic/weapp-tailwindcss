# tailwindcss 多上下文与独立分包

你看过动漫《百兽王》吗？《百兽王》的主人公是五个飞行员，他们分别驾驶黑、红、青、黄、绿五头机器狮，它们平时可以单独进行作战，遇到强敌时，也能进行五狮合体，成为巨大机器人“百兽王”。

同样，在日常开发中，我们经常遇到这样的问题，一个很大的程序，它有很多个独立的部分组成，每一个部分可以单独运行，也有独立的入口，相互之间没有任何的依赖，但是它们在同一个项目或任务里进行构建。

在这种场景下，去使用 `tailwindcss` 就往往需要去创建多个上下文，让这些上下文各自去管理我们程序中的指定的一块区域。

当然我写到这，相信大家也啥都没看懂，于是我搬出一个小程序中，独立分包的示例，来让大家理解这种思想。

## 什么是独立分包

独立分包是小程序中一种特殊类型的分包，可以独立于主包和其他分包运行。从独立分包中页面进入小程序时，不需要下载主包。当用户进入普通分包或主包内页面时，主包才会被下载。

独立分包属于分包的一种。普通分包的所有限制都对独立分包有效。独立分包中插件、自定义组件的处理方式同普通分包。此外，使用独立分包时要注意：

- 独立分包中不能依赖主包和其他分包中的内容，包括 `js`、`template`、`wxss`、自定义组件、插件等（使用分包异步化时 `js`、自定义组件、插件不受此条限制）。
- 主包中的 `app.wxss` 对独立分包无效，应避免在独立分包页面中使用 `app.wxss` 中的样式。
- App 只能在主包内定义，独立分包中不能定义 App，会造成无法预期的行为。
- 独立分包中暂时不支持使用插件。

> 更多信息参见微信官方文档中的[独立分包](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/independent.html)

这里要特别注意第二条：**主包中的 `app.wxss` 对独立分包是无效的**！！！

之前提供的 `tailwindcss` 小程序模板的示例中，所有 `tailwindcss` 生成的 `wxss` 工具类都是在主包里共用的（`app.wxss`），这在大部分情况下运转良好，然而这在独立分包场景下，是不行的！因为主包的样式无法影响到独立分包。

那么应该怎么做才能解决这个问题呢？

## 创建与配置示例

这里笔者先以 `taro@3.6.7` 和 `weapp-tailwindcss@2.5.2` 版本的项目作为示例。

首先配置好 `weapp-tailwindcss` 的配置，然后在 `config/index.js` 中关闭 `prebundle` 功能，因为这在独立分包场景下会报一些未知的错误:

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
        // 方法1: 不要传 appType
        // 注释掉 appType : 'taro'
        // 或者方法2: 让所有css chunk 都是 main chunk
        // mainCssChunkMatcher: ()=> true
        // 2 种选其一即可
      }]
    }
  }
})
```

接下来我们就可以创建一个独立分包 `moduleA`，在里面新建一个 `"pages/index"` 页面，并写入一个只属于 `moduleA` 的独一无二的 `tailwindcss class`，然后在 `app.config.ts` 里注册它:

```js
  subpackages: [
    {
      root: "moduleA",
      pages: [
        "pages/index",
      ],
      // 下方这个标志位，声明独立分包
      independent: true
    },
  ]
```

到这里，准备工作就完成了，接下来就可以设计方案了。

## 单 `tailwindcss` 上下文的方案（不完美不推荐）

这个方案是一个不完美的方案，在这里写出来是为了促进大家对 `tailwindcss` 的理解。

首先在独立分包中，也创建一个 `index.scss` 内容为:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

然后在所有独立分包中的页面引用它，这样打包之后，独立分包里的 `tailwindcss` 样式也就生效了。

然而这种方式有一个巨大的问题，就是它会带来严重的 `css` 冗余。

因为此时 `tailwindcss` 上下文有且仅有一个，它会把在这个项目中，所有提取出来的 `css` 工具类，全部注入到所有的 `@tailwind` 指令里去。`@import 'tailwindcss/utilities'` 这个引入(本质实际上是`@tailwind`指令)一下子膨胀了起来。

这导致了，主包里的 `app.wxss` 里，会包含主包里所有的 `class` + 独立分包里所有的 `class`，而独立分包里的 `index.scss` 里，也包含主包里所有的 `class` + 独立分包里所有的 `class`!

这显然是不可接受的，因为主包是没有必要包含独立分包的 `class`，而独立分包里，也没有必要包含主包里的 `class`! 这只会白白增大打包后`wxss`文件的体积。

所以这个方案需要改进!

## 多 `tailwindcss` 上下文的方案

由于上面那个方案的问题，我们开始改进，就必须要创建多个 `tailwindcss` 上下文。

那么第一步就是要 **`↓`**

### 创建多个 `tailwind.config.js`

比如说我们只有一个独立分包，所以我们创建了2个 `tailwind.config.js`:

1. `tailwind.config.js` 用于主包以及相互依赖的子包
2. `tailwind.config.sub.js` 用于 `moduleA` 这个独立分包

内容如下:

#### 独立分包的上下文配置

```js
// `moduleA` 这个独立分包的 tailwind.config.sub.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里只提取 moduleA 这个独立分包下的文件内容
  content: ["./src/moduleA/**/*.{html,js,ts,jsx,tsx}"],
  // ....
  corePlugins: {
    preflight: false
  }
}
```

#### 主包以及相互依赖的子包的上下文配置

```js
// 主包以及相互依赖的子包的 tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // https://github.com/mrmlnc/fast-glob
  // 这里需要限定范围，不去提取 moduleA 这个独立分包下的文件内容
  // 所以后面跟了一个 `!` 开头的路径
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", 
    // 不提取独立分包里的 class
    "!./src/moduleA/**/*.{html,js,ts,jsx,tsx}"],
  // ....
  corePlugins: {
    preflight: false
  }
}
```

这样 `2` 个配置文件创建好了，接下来就要通过配置让它们各自在打包中生效。

### `postcss.config.js` 配置

这是非常重要的一块配置，我们需要把 `postcss.config.js` 的配置变成一个函数，这样才能把构建时的上下文传入进来：

```js
const path = require('path')

module.exports = function config(loaderContext) {
  // moduleA 下面的所有 scss 文件，都是独立模块的，应用不同的 tailwindcss 配置
  const isModuleA = /moduleA[/\\](?:\w+[/\\])*\w+\.scss$/.test(
    loaderContext.file
  )
  // 多个独立子包同理，加条件分支即可
  if (isModuleA) {
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

主包里的 `app.wxss` 和独立分包里的 `index.wxss`，里面的内容就已经各归各了，不再相互包含了。

## 尾言

当然，上面只是一种方案，达到这样的目的方式有很多种，比如你可以在运行时去修改 `postcss-loader` 对它进行劫持，或者拆成多个项目，分开构建。

我这篇文章只是抛砖引玉，相信聪明的你们一定可以举一反三的。

## 参考示例

示例见:<https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/taro-app>
