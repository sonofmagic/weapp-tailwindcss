# uni-app vue3 vite

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

创建完成后，快速上手中的准备工作都完成之后，就可以便捷的注册了：

```js
// vite.config.[jt]s
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
