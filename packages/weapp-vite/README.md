# weapp-vite

> 给小程序现代化的开发体验

- [x] Vite 支持，带来了 `typescript` / `scss` / `less` 等等所有支持
- [x] 插件支持，可以使用 `weapp-tailwindcss` 等等插件，也可以自定义编写插件，方便扩展

## 使用方式

在你的小程序目录下，使用 `npm init -y` 创建一个 `package.json`

然后执行：

```sh
npm i -D weapp-vite
# 执行初始化命令
npx weapp-vite init
```

### 热更新开发命令

```sh
npm run dev
```

### 构建命令

```sh
npm run build
```

### 构建npm命令

```sh
npm run build-npm
```

### 打开微信开发者工具命令

```sh
npm run open
```

## 配置项

配置项可以与 `vite` 通用，同时加入了 `weapp-vite` 的扩展:

`vite.config.ts`:

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  // 其他的配置同
  weapp: {
    // 用来配置监听 app.json 所在的目录
    // 比如默认情况下 ts 创建的项目，app.json 所在为 './miniprogram'
    srcRoot: './miniprogram',
    // weapp-vite options
  },
})
```

## Contribute

我们邀请你来贡献和帮助改进 `weapp-vite` 💚💚💚

以下有几个方式可以参与:

- 报告错误：如果您遇到任何错误或问题，请提`issue`并提供完善的错误信息和复现方式。
- 建议：有增强 `weapp-vite` 的想法吗？请提 `issue` 来分享您的建议。
- 文档：如果您对文档有更好的见解或者更棒的修辞方式，欢迎 `pr`。
- 代码：任何人的代码都不是完美的，我们欢迎你通过 `pr` 给代码提供更好的质量与活力。

## License

[MIT](./LICENSE)
