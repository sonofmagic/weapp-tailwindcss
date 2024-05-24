# uni-app cli vue3 vite

:::warning
这是 `uni-app cli` 创建的项目的注册方式，如果你使用 `HbuilderX`，应该查看 [uni-app HbuilderX 使用方式](/docs/quick-start/frameworks/hbuilderx)
:::

## 注册插件

创建完成后，快速上手中的准备工作都完成之后，就可以便捷的注册了：

```js title="vite.config.[jt]s"
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss/vite';

export default defineConfig({
  // uni 是 uni-app 官方插件， uvtw 一定要放在 uni 后，对生成文件进行处理
  plugins: [uni(),uvwt()],
  css: {
    postcss: {
      plugins: [
        // require('tailwindcss')() 和 require('tailwindcss') 等价的，表示什么参数都不传，如果你想传入参数
        // require('tailwindcss')({} <- 这个是postcss插件参数)
        require('tailwindcss'),
        require('autoprefixer')
      ],
    },
  },
});

```

这里只列举了插件的注册，包括`postcss`配置完整的注册方式，参考配置项文件链接: <https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template>

## 创建项目参考

`uni-app vite` 版本是 `uni-app` 最新的升级，它使用 `vue3` 的语法。

你可以通过 `cli` 命令创建项目 ([参考官网文档](https://uniapp.dcloud.net.cn/quickstart-cli.html)):

- 创建以 javascript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```bash
npx degit dcloudio/uni-preset-vue#vite my-vue3-project
```

- 创建以 typescript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```bash
npx degit dcloudio/uni-preset-vue#vite-ts my-vue3-project
```

> gitee 地址见上方的 `参考官网文档` 链接，点击跳转到 uni-app 官网即可

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=326378691&bvid=BV14w411773C&cid=1409199088&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
