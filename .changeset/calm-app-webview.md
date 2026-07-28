---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

完善 uni-app app-plus 默认 WebView 兼容转换，在保留 Tailwind CSS v4 运行时间距变量和间距反转语义的同时，为文本渐变补充 WebKit 前缀，使 Android 与 iOS App 无需业务侧兼容插件即可使用对应工具类。
