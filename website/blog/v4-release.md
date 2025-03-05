# weapp-tailwindcss v4 发布！

## 功能更新

- 支持 `tailwindcss` `v4` 版本
- 支持 `tailwind-merge`

## Tailwindcss 4 版本改进了那些内容?

Tailwind CSS v4.0 相较于 v3 进行了多项改进，

tailwindcss@4 直接变成了一个样式预处理器，和 sass / less 类似，所以你不应该让 tailwindcss@4 和 sass, less 一起使用。

**主要改进：**

1. **全新高性能引擎**：v4.0 重写了框架核心，构建速度显著提升，完整构建速度提高至 5 倍，增量构建速度提高超过 100 倍。

2. **面向现代 Web 的设计**：利用最新的 CSS 特性，如级联层（cascade layers）、注册自定义属性（`@property`）和 `color-mix()`，简化了框架内部结构，减少了潜在的错误。

3. **简化安装流程**：无需复杂配置，只需在 CSS 文件中添加一行 `@import "tailwindcss"` 即可开始使用。

4. **官方 Vite 插件**：提供了官方的 Vite 插件，集成更紧密，性能更佳，配置更少。

5. **自动内容检测**：自动检测模板文件，无需手动配置内容路径，简化了设置过程。

6. **内置导入支持**：无需额外工具，即可在 CSS 中使用 `@import` 导入其他 CSS 文件。

7. **CSS 优先的配置方式**：通过在 CSS 文件中使用 `@theme` 直接进行配置，无需使用 JavaScript 配置文件。

8. **CSS 主题变量**：设计令牌作为原生 CSS 变量公开，可在任何地方访问，增强了灵活性。

9. **动态实用工具值和变体**：支持动态实用工具值和变体，无需猜测或扩展配置即可使用新的间距或数据属性。

10. **现代化的 P3 色彩调色板**：重新设计的更生动的色彩调色板，充分利用现代显示技术。

11. **容器查询**：无需插件即可根据容器大小对元素进行样式设置，提供了对容器查询的原生支持。

12. **新的 3D 变换实用工具**：可直接在 HTML 中对元素进行 3D 空间变换。

13. **扩展的渐变 API**：支持径向和圆锥渐变、插值模式等，增强了渐变效果的灵活性。

14. **`@starting-style` 支持**：可用于创建进入和退出过渡效果，无需使用 JavaScript。

15. **`not-*` 变体**：仅在元素不匹配其他变体、自定义选择器或媒体或功能查询时对其进行样式设置。

## 各个框架集成方式

这里我们以 `uni-app vue3 vite` 版本为例

# uni-app cli vue3 vite

## 1. 安装

```bash npm2yarn
npm install -D tailwindcss @tailwindcss/vite weapp-tailwindcss
```

然后把下列脚本，添加进你的 `package.json` 的 `scripts` 字段里:

```json title="package.json"
{
  "scripts": {
    // highlight-next-line
    "postinstall": "weapp-tw patch"
  }
}
```

这是为了给 `tailwindcss@4` 打上支持 `rpx` 单位的补丁，否则它会把 `rpx` 认为是一种颜色

## 2. 配置 `vite.config.ts`

```ts title="vite.config.ts"
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig(async () => {
  // 这里必须这样引用，因为 uni 只提供了 cjs 的版本且 uni-app 默认 cjs，而 @tailwindcss/vite 只提供了 esm 版本
  const { default: tailwindcss } = await import('@tailwindcss/vite')
  return {
    plugins: [
      uni(),
      tailwindcss(),
      UnifiedViteWeappTailwindcssPlugin(
        {
          rem2rpx: true
        }
      )
    ],
  }
})
```

## 3. 添加样式

在项目目录下，创建一个 `main.css`，然后添加以下内容：

```css title="main.css"
@import 'weapp-tailwindcss';
```

然后直接运行 `npm run dev:mp-weixin` 即可看到效果

:::warning
这里必须创建一个额外的 `css` 文件，而不是直接在 `App.vue` 里的 `style` 标签下直接写，

这是因为 `@tailwindcss/vite` 目前只转化 `.css` 文件。后续可能会支持更多格式的文件，比如 `vue` 编译的中间文件

详见 http://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-vite/src/index.ts#L122 中的 `isCssFile` 判断
:::

## 参考链接

[weapp-tailwindcss 迁移文档](https://tw.icebreaker.top/docs/migrations/v3)
[Tailwindcss@4 各个框架集成方式](https://tw.icebreaker.top/docs/quick-start/v4)
[Tailwindcss@4 升级指南](https://tailwindcss.com/docs/upgrade-guide)
[uni-app-tailwindcss-v4 参考模板](https://github.com/icebreaker-template/uni-app-tailwindcss-v4)
