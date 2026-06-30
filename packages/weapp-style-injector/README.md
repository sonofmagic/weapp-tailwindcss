# weapp-style-injector

> 简体中文 | [English](./README.en.md)

这个包用于在小程序构建产物中注入样式入口，覆盖 Vite、Webpack、uni-app、Taro 等常见构建场景。

## 推荐入口

| 场景 | 入口 |
| --- | --- |
| 通用 Vite 插件 | `weapp-style-injector/vite` |
| 通用 Webpack 插件 | `weapp-style-injector/webpack` |
| uni-app Vite 预设 | `weapp-style-injector/vite/uni-app` |
| uni-app Webpack 预设 | `weapp-style-injector/webpack/uni-app` |
| Taro Vite 预设 | `weapp-style-injector/vite/taro` |
| Taro Webpack 预设 | `weapp-style-injector/webpack/taro` |
| 简单 Vite 默认入口 | `weapp-style-injector` |

`uni-app`、`taro`、`subpackage` 等解析模块属于包内实现细节，不作为应用项目的公开接入入口。

## 开箱即用

uni-app、Taro、Mpx 预设会自动探测常见入口。默认启用时，分包样式会引用主包样式入口：

```ts
StyleInjector()
```

需要限定注入范围时，把过滤规则写在 `styleEntries` 里：

```ts
StyleInjector({
  styleEntries: {
    include: ['pages/**/*.wxss'],
    exclude: ['pages/legacy/**/*.wxss'],
  },
})
```

## 官网

更多接入方式、配置说明和框架示例见 [weapp-tailwindcss 官方文档](https://tw.icebreaker.top)。
