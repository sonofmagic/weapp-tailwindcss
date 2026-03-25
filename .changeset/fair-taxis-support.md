"weapp-tailwindcss": patch
---

- 正式支持 `uni-app x + HBuilderX 5 + styleIsolationVersion=2` 下组件级 Tailwind 局部样式注入，修复 `components/**/*.uvue` 内部子节点 class 在组件隔离模式下不生效的问题
- 在 `uniAppX` 配置中新增对象形态与 `componentLocalStyles` 细粒度控制，preset 默认开启该能力，并默认仅在 `manifest.json` 的 `styleIsolationVersion=2` 时生效
- `manifest.json` 改为使用 `comment-json` 解析，兼容 HBuilderX 常见的注释写法，并补充 issue #822 回归测试覆盖静态与动态 class 场景
