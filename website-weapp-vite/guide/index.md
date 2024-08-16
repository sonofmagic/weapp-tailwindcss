# 快速开始 {#getting-started}

## 使用方式

打开微信开发者工具, 创建一个 `js`/`ts` 项目

然后，假如你这个项目没有 `package.json`，在你的小程序目录下，使用 `npm init -y` 创建一个 `package.json`

然后执行：

```sh
npm i -D weapp-vite
# 执行初始化命令
npx weapp-vite init
```

于是就成功了！

### 开发命令

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
