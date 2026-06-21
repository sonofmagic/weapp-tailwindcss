---
title: 写在 js 中的 tailwindcss 任意值失效
description: weapp-tailwindcss 是允许你在 js 中编写任意值的，而且 weapp-tailwindcss 会自动帮你做好任意值的转译。
keywords:
  - 常见问题
  - 故障排查
  - 兼容性
  - 写在
  - js
  - 中的
  - tailwindcss
  - 任意值失效
  - issues
  - js string invalid
  - weapp-tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
---
# 写在 js 中的 tailwindcss 任意值失效

`weapp-tailwindcss` 是允许你在 `js` 中编写任意值的，而且 `weapp-tailwindcss` 会自动帮你做好任意值的转译。

比如:

```js title="src/pages/index/index.js"
const xs = {
  wrapper: 'px-[4px] h-[40px]',
}
```

那么在最终的产物中，编译结果会自动变为

```js title="dist/pages/index/index.js"
const xs = {
  wrapper: 'px-_4px_ h-_40px_',
}
```

但是你这个文件，必须被 `tailwindcss` 感知到，并从里面提取到这 `2` 个 `class`。`weapp-tailwindcss` 才能通过和 `tailwindcss` 的通信，来完成这 `2` 个 `class` 的转译。

所以你这个源文件必须被 `@source` 包括到，这个自动转译的流程才能走完。

否则就会出现 `js` 转译没有进行, 导致开发者工具中审查元素时，出现:

```html
<view class="px- 4px  h- 40px "></view>
```

这种类名被切断的情况。

## 解决方案

检查你的 `@source`，确认你出现类名被切断的源文件，被 `@source` 包括。

文档地址: https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources

如果项目必须继续使用 `tailwindcss@3`，请安装 `weapp-tailwindcss@4` 并查看 [v4 文档站](https://v4.tw.icebreaker.top/)。

<!-- 因为 `tailwindcss` 和 `weapp-tailwindcss` 的转化规则 ，是根据你的源代码里提取出来的 `token` 决定的 -->
