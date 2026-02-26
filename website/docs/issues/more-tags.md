---
title: 生成样式只作用于view和text标签
description: '在微信小程序中，darkMode 设置为 class/ selector 后，dark:className 类选择器在 button 上无效，看生成样式只作用于 view 和 text 标签'
keywords:
  - 常见问题
  - 故障排查
  - 兼容性
  - 生成样式只作用于view和text标签
  - issues
  - more tags
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---
# 生成样式只作用于view和text标签

在微信小程序中，`darkMode` 设置为 `class`/ `selector` 后，`dark:className` 类选择器在 `button` 上无效，看生成样式只作用于 `view` 和 `text` 标签

这是由于小程序是不接受 `*` 这样一个选择器的。

默认情况下， `weapp-tailwindcss` 会把 `*` 选择器转化成 `view,text` 的选择器

这个配置可以通过 `cssSelectorReplacement.universal` 进行更改，从而适配更多标签。

详见 [cssSelectorReplacement.universal 文档](/docs/api/options/important#cssselectorreplacement)
