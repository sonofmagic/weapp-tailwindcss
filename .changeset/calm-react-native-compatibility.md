---
'@weapp-tailwindcss/react-native': patch
---

收紧 React Native 样式编译边界，只生成平台明确支持的属性和条件变体，并补充比例值、百分比透明度、项目根目录及 CSS 入口类型支持，避免未知 CSS 属性或浏览器 selector 变体被误报为可用原生样式。

稳定 Babel 静态 lookup 使用的 StyleSheet ID，避免 TSX 或 CSS HMR 改变规则顺序后串用其他 class 的样式；同时加入 Expo Web、Android、iOS 共用的 118 项兼容性报告、截图和独立 TSX/CSS HMR 门禁。

Metro transformer 在未透传自定义 id 或 manifest 路径时也会按项目根目录等待异步样式生成完成，并通过跨进程 ready 标记同步 manifest 与 virtual module，避免构建速度较慢或 HMR 刷新时使用空 manifest 导致静态 className 未被转换。
