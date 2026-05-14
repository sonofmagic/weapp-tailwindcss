---
title: Rax (react)
description: 在根目录下创建一个 build.plugin.js 文件，然后在 build.json 中注册：
keywords:
  - 快速开始
  - 安装
  - 配置
  - Rax
  - react
  - quick start
  - frameworks
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---
# Rax (react)

本文是 `weapp-tailwindcss@5` 配合 `tailwindcss@3` 的 Rax 接入方式。Tailwind CSS 3.x 入口 CSS 使用 `@tailwind` 指令，扫描范围继续写在 `tailwind.config.js` 的 `content` 中。

在根目录下创建一个 `build.plugin.js` 文件，然后在 `build.json` 中注册：

```json title="build.json"
{
  "plugins": [
    "./build.plugin.js"
  ],
}
```

回到 `build.plugin.js`

```js title="build.plugin.js"
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')
const path = require('node:path')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.plugin('WeappTailwindcss').use(WeappTailwindcss, [
      {
        rem2rpx: true,
        cssEntries: [
          path.resolve(process.cwd(), 'src/app.css'),
        ],
      },
    ]);
  });
};

```

`src/app.css` 继续写 Tailwind CSS 3.x 的 `@tailwind base; @tailwind components; @tailwind utilities;`。生成模式下不要再在 PostCSS 中注册 `tailwindcss`。
