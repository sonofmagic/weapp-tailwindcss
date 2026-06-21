---
title: 技术演进
description: weapp-tailwindcss 从 patch 方案演进到 v5 生成模式后的核心处理链路。
keywords:
  - 技术演进
  - evolution
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---
# 技术演进

`weapp-tailwindcss@5` 的核心变化是：Tailwind CSS 生成在构建运行时完成，不再要求业务项目执行 `weapp-tw patch`。构建器拿到 Tailwind 产出的类名集合后，再对模板、脚本和样式做小程序目标转译。

当前主要处理链路：

- Tailwind CSS 4：由 `weapp-tailwindcss` 的生成器入口接管 CSS 生成
- 模板：使用 `htmlparser2` 解析 `wxml` / 类 HTML 模板
- 脚本：使用 Babel 解析语法，再通过精确位置替换改写类名
- 样式：使用 PostCSS 处理选择器、单位、CSS 变量和平台兼容逻辑
- HMR：watch 场景会重新收集类名集合，新增任意值类名后继续参与生成和转译

## wxml

使用 `htmlparser2` 是 `v2` 后期开始稳定下来的选择。

更早的时候使用过 `@vivaxy/wxml`。它是一个 `wxml` AST 工具，但维护停滞较久，遇到内联 `wxs` 时容易出错。

后来尝试过正则处理，但正则很难正确处理条件表达式，例如：

`<view class="{{2>1?'xxx':'yyy'}}"></view>`

这里的 `2>1` 会干扰简单的标签匹配。模板转译需要解析结构，不能只靠字符串截取。

`parse5` 更贴近 HTML5 规则，对小程序模板不够宽松。最终保留 `htmlparser2` 来处理这类模板。

## babel

脚本处理也经历过一次重要调整。早期链路是：

`@babel/parser`->`@babel/traverse`->`@babel/generator`

这种做法等于重新生成一遍用户脚本，容易改变格式，也会影响 sourcemap。

现在是 `@babel/parser` -> `@babel/traverse` -> `magic-string#replace`。Babel 负责定位，`magic-string` 只替换命中的片段。

JS 转译还会受 `classNameSet` 约束：只有 Tailwind 已生成或兼容命中的类名才会被转义，避免把普通字符串误改成小程序类名。

## postcss

样式处理仍以 PostCSS 为主。它负责选择器转义、长度单位处理、CSS 变量兼容、preflight 兼容和平台目标差异。

v5 之后，PostCSS 不再等同于“业务项目里注册 Tailwind 插件”。对于 Vite、Webpack、Gulp 等构建器接入方式，Tailwind CSS 的生成由 `weapp-tailwindcss` 自己接管；业务项目不需要再额外注册 `tailwindcss`、`@tailwindcss/postcss` 或 `@tailwindcss/vite` 来生成小程序目标 CSS。
