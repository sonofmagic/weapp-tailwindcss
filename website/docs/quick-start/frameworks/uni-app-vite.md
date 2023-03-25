# uni-app vite(vue3)

`uni-app vite` 版本是 `uni-app` 最新的升级，它使用 `vue3` 的语法。

你可以通过 `cli` 命令创建项目 ([参考官网文档](https://uniapp.dcloud.net.cn/quickstart-cli.html)):

- 创建以 javascript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```sh
npx degit dcloudio/uni-preset-vue#vite my-vue3-project
```

- 创建以 typescript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```sh
npx degit dcloudio/uni-preset-vue#vite-ts my-vue3-project
```

> gitee 地址见上方的 `参考官网文档` 链接，点击跳转到 uni-app 官网即可

创建完成后，快速上手中的准备工作都完成之后，就可以便捷的注册了：

```js
// vite.config.[jt]s
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss-webpack-plugin/vite';
// uni 是 uni-app 官方插件， uvtw 一定要放在 uni 后，对生成文件进行处理
const vitePlugins = [uni(),uvwt()]

export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  // css: {
  //   postcss: {
  //     plugins: postcssPlugins,
  //   },
  // },
});

```

参考配置项文件链接: <https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template>
