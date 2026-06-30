# weapp-style-injector

> English | [简体中文](./README.md)

This package injects style entries into mini program build artifacts across common Vite, Webpack, uni-app, and Taro scenarios.

## Recommended Entries

| Scenario | Entry |
| --- | --- |
| Generic Vite plugin | `weapp-style-injector/vite` |
| Generic Webpack plugin | `weapp-style-injector/webpack` |
| uni-app Vite preset | `weapp-style-injector/vite/uni-app` |
| uni-app Webpack preset | `weapp-style-injector/webpack/uni-app` |
| Taro Vite preset | `weapp-style-injector/vite/taro` |
| Taro Webpack preset | `weapp-style-injector/webpack/taro` |
| Simple Vite default entry | `weapp-style-injector` |

The `uni-app`, `taro`, and `subpackage` parser modules are internal implementation details, not public entry points for application projects.

## Zero Config

The uni-app, Taro, and Mpx presets auto-detect common app entries. By default, subpackage styles reference the main app style entry:

```ts
StyleInjector()
```

To narrow the injected files, put filters in `styleEntries`:

```ts
StyleInjector({
  styleEntries: {
    include: ['pages/**/*.wxss'],
    exclude: ['pages/legacy/**/*.wxss'],
  },
})
```

## Website

For setup guides, configuration references, and framework examples, see the [official weapp-tailwindcss documentation](https://tw.icebreaker.top).
