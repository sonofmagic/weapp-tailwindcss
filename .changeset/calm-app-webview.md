---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

完善经典 uni-app app-plus 的默认 WebView 兼容转换，并在 `legacy-web` 现有处理链中为文本渐变补充 WebKit 前缀；Tailwind CSS v4 运行时间距变量和间距反转语义保持不变，使 Android 与 iOS App 无需业务侧兼容插件即可使用对应工具类。
