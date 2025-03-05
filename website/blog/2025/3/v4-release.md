![](https://cdn.jsdelivr.net/gh/sonofmagic/static/mbpv4-release.png)

# weapp-tailwindcss v4.0 发布了！

## 总结

经过一段时间的开发之后，`weapp-tailwindcss` `v4.0` 终于发布了!

在清理了一些自己拉的的屎山代码，我终于把心心念念的 `2` 个功能做出来了

1. 支持 `tailwindcss@4.x` 版本
2. 支持 `tailwind-merge`

> 因为 `tailwindcss@4` 直接变成了一个样式预处理器，定位上和 `sass` / `less` 类似，所以相关的功能改动还是比较多的。

想要了解使用方式的话，就访问 [weapp-tailwindcss 官网](https://tw.icebreaker.top/) 吧!

假如你还想了解更多的话，不如看一下下面这个示例吧。

## uni-app 快速集成示例

这里我们以 `uni-app vue3 vite` 版本为例

### 1. 安装依赖

```bash npm2yarn
npm install -D tailwindcss @tailwindcss/vite weapp-tailwindcss
```

然后把下列脚本，添加进你的 `package.json` 的 `scripts` 字段里:

```json title="package.json"
{
  "scripts": {
    // highlight-next-line
    "postinstall": "weapp-tw patch"
  }
}
```

> 这是为了给 `tailwindcss@4` 打上支持 `rpx` 单位的补丁，否则 `tailwindcss` 在校验单位的时候，由于 `rpx` 非标准长度单位，就会把 `rpx` 认为是一种颜色单位了。

### 2. 配置 `vite.config.ts`

```ts title="vite.config.ts"
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig(async () => {
  // 这里必须这样引用，因为 uni 只提供了 cjs 的版本且 uni-app 默认 cjs，而 @tailwindcss/vite 只提供了 esm 版本
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  return {
    plugins: [
      uni(),
      tailwindcss(),
      UnifiedViteWeappTailwindcssPlugin(
        {
          rem2rpx: true
        }
      )
    ],
  }
})
```

### 3. 添加样式

在项目目录下，创建一个 `main.css`，然后添加以下内容：

```css title="main.css"
@import 'weapp-tailwindcss';
```

然后直接运行 `npm run dev:mp-weixin` 即可看到效果

## 遇到的问题以及解决方案

假如你已经看到了这里，不妨在看看我实现过程中遇到的一些问题，以及解决方案吧

### 1. `tailwindcss@4` 的样式兼容性问题

`tailwindcss@4` 在生成样式中，大量使用了 `@layer` / `color-mix` / `oklch` 等等 `CSS` 的新特性，现代浏览器都兼容性一般，更不用说小程序了。

这时候不论是 `h5` 还是 `小程序` 都需要 `postcss-preset-env` 来对它的生成结果，做编译时降级。

当然，这个降级的程度，就取决于我们自己设置的 `browserslist` 了。

### 2. `tailwind-merge` 合并样式

`tailwind-merge` 是一个 `tailwindcss` 的样式合并工具，它允许你在运行时合并多个样式对象，并自动删除重复的样式。

想要在小程序里面用 `tailwind-merge` 比较淡，由于 `weapp-tailwindcss` 是在编译时，自动对 `tailwindcss` 提取到的字面量做转义，

而 `tailwind-merge` 是在运行时，进行合并处理的。这就导致转义之后的 `class` 再到 `tailwind-merge` 里面去检索时，会认为它是普通的 `class` 不是 `tailwindcss` 原子类的 `class`

为此，我去调研了 `tailwind-merge` 的源码，尝试去编写一个 `tailwind-merge` 的 `plugin` 去解决这个问题，然后发现路走不通，因为里面有些规则

比如 `!` 代表 `!important` 是被写在源代码里面的，无法通过实现一个 `plugin` 去自定义。

于是我就决定另辟蹊径，采用编译时感应，忽略转义，运行时合并转义的方式来解决了这个问题，这就是 `@weapp-tailwindcss/merge` 的由来了。

另外在编译时感应的部分，我也利用 `babel` 的 `scope` 和 `binding` 做了少许的增强，即利用 `NodePath.scope.getBinding` 的方式，自下而上的去寻找依赖，比如:

```js
const b = 'after:xx'
const a = `${b} text-[#123456]`
cn(a, 'xx', 'yy')
```

假如我们以 `cn` 作为标记，在编译时依次向上找，就会从 `cn` -> `a` -> `b` 这样的路径了。

当然我们也可以自上而下去找，以特定的 `import` 节点作为一个标识，去分析它的导出，以及是否使用了别名，这个文件的导出，以及在那些文件里面被导入了，这些也都能从打包工具的模块分析图里面获取到。算是在编译时进行静态分析的一种方式。

## 未来展望

转眼我也到而立之年了，现在这个糟糕的行情下，毕业也是随时的事情，当然也不敢毕业，毕竟上有老下有小。

前端技术嘛，越学越感觉苦海无涯，学了更多掌握了更多，也没有啥收益。

开源么也做的一般，平常要上班要卷，下班照顾小孩，做开源，也很累，也没啥收益。也没有本事成为开源明星，没那技术水平。

最近我一直在学很多云原生相关的东西，因为我感觉技术的细节要把握，另外一点也很重要。举个例子，假如对于现在的我来说，要去从 0 到 1 构建一整套业务系统，那么我是能够完全把握一套自己的技术栈，即 `vue`/`react` + `nodejs 任意框架` + `mongodb / pg` + `docker / serverless` 的技术选型，然后把业务上上去的。

但是这一切又有多少的成本呢？尤其是时间成本和人力成本，当初我去设计一个 `pg` 的 `graphql` 实现就搞了好久，为什么不直接部署 `pg_graphql` 这种中间件呢？

所以很多程度上，不如我们自己写尽可能少的代码，快速利用各种镜像，配置等等，快速部署一套满足业务的服务，赚钱作为第一要务，以后哪里有问题，先堆机器解决，实在解决不了的，再招对口的人才来解决。

## 参考链接

- [weapp-tailwindcss 迁移文档](https://tw.icebreaker.top/docs/migrations/v3)
- [Tailwindcss@4 各个框架集成方式](https://tw.icebreaker.top/docs/quick-start/v4)
- [Tailwindcss@4 升级指南](https://tailwindcss.com/docs/upgrade-guide)
- [uni-app-tailwindcss-v4 参考模板](https://github.com/icebreaker-template/uni-app-tailwindcss-v4)
