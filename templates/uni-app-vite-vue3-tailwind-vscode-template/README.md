# uni-app-vite-vue3-tailwind-vscode-template

基于 `uni-app` 的 `vite` + `vue3` + `tailwindcss` 模板

假如你觉得好用，欢迎给我的 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 点个 `Star` 吧。

官网地址: <https://tw.icebreaker.top/>

## 特性

- ⚡️ [Vue 3](https://github.com/vuejs/core), [Vite](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/) - 快 & 稳定

- 🎨 [TailwindCSS](https://tailwindcss.com/) - 世界上最流行，生态最好的原子化CSS框架

- 😃 [集成 Iconify](https://github.com/egoist/tailwindcss-icons) - [icones.js.org](https://icones.js.org/) 中的所有图标都为你所用

- 📥 [API 自动加载](https://github.com/antfu/unplugin-auto-import) - 直接使用 Composition API 无需引入

- 🧬 [uni-app 条件编译样式](https://tw.icebreaker.top/docs/quick-start/uni-app-css-macro) - 帮助你在多端更灵活的使用 `TailwindCSS`

- 🦾 [TypeScript](https://www.typescriptlang.org/) & [ESLint](https://eslint.org/) & [Stylelint](https://stylelint.io/) - 样式，类型，统一的校验与格式化规则，保证你的代码风格和质量

## 快速开始

> [!IMPORTANT]
> 推荐使用 `"node": "^20.19.0 || >=22.12.0"` 的 Node.js 版本进行开发! 详见 [issues/29](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/29)
>
> 另外谨慎升级 `package.json` 中锁定的 `pinia`/`vue`/`@vue/*` 相关包的版本，新版本可能 `uni-app` 没有兼容，造成一些奇怪的 bug

### vscode

使用 `vscode` 的开发者，请先安装 [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 智能提示与感应插件

其他 IDE 请参考: <https://tw.icebreaker.top/docs/quick-start/intelliSense>

### 更换 Appid

把 `src/manifest.json` 中的 `appid`, 更换为你自己的 `appid`, 比如 `uni-app` / `mp-weixin` 平台。

## 升级依赖

- `pnpm up:pkg` 升级除了 `uni-app` 相关的其他依赖
- `pnpm up:uniapp` 升级 `uni-app` 相关的依赖

推荐先使用 `pnpm up:pkg` 升级, 再使用 `pnpm up:uniapp` 进行升级，因为 `pnpm up:uniapp` 很有可能会进行版本的降级已达到和 `uni-app` 版本匹配的效果

## 切换到国内镜像源

默认情况下，走的是官方 `npmjs` 源: `registry.npmjs.com`

假如你访问网速慢，要切换到淘宝镜像源，那就把目录下的 `.npmrc` 中的 `registry=http://registry.npmmirror.com/` **反注释**

然后再把 `registry=http://registry.npmjs.com/` 注释(前面加个 `#` 号即可)，然后重新进行 `pnpm i` 安装包即可

## 包管理器

本项目默认使用 `pnpm@10` 进行管理，当然你也可以切换到其他包管理器，比如 `yarn`, `npm`

你只需要把 `pnpm-lock.yaml` 删掉，然后把 `package.json` 中的 `packageManager` 字段去除或者换成你具体的包管理器版本，然后重新安装即可

## eslint 代码校验

本项目集成的是我自己封装的 `@icebreakers/eslint-config` 规则，你不喜欢完全可以更换，卸载掉它然后自行配置 `eslint`，把它变成你想要的样子

### weapp-ide-cli

本项目已经集成 `weapp-ide-cli` 可以通过 `cli` 对 `ide` 进行额外操作

- `pnpm open:dev` 打开微信开发者工具，引入 `dist/dev/mp-weixin`
- `pnpm open:build` 打开微信开发者工具，引入 `dist/build/mp-weixin`

[详细信息](https://www.npmjs.com/package/weapp-ide-cli)

## 其他模板

👉 [🔥 tarojs / 🔥 uni-app / 🔥 hbuilderx 等更多模板链接](https://tw.icebreaker.top/docs/community/templates)

## tailwindcss 生态

详见：https://github.com/aniftyco/awesome-tailwindcss

你可以在这里找到许多现成的UI，组件模板。

## 单位转换

- `rem` -> `rpx` (默认开启, 见 `vite.config.ts` 中 `uvtw` 插件的 `rem2rpx` 选项)
- `px` -> `rpx` (默认不开启，可在 `postcss.config.ts` 中引入 `postcss-pxtransform` 开启配置)

## Tips

- 升级 `uni-app` 依赖的方式为 `npx @dcloudio/uvm` 后，选择对应的 `Package Manager` 即可。而升级其他包的方式，可以使用 `pnpm up -Li`，这个是 `pnpm` 自带的方式。
- 使用 `vscode` 记得安装官方插件 `eslint`,`stylelint`,`tailwindcss`, 已在 `.vscode/extensions.json` 中设置推荐
