![](https://cdn.jsdelivr.net/gh/sonofmagic/static/mbpv4-release.png)

# weapp-tailwindcss v4.0 发布了！

## 总结

经过一段时间的开发之后，`weapp-tailwindcss` `v4.0` 终于发布了!

在清理了一些自己拉的的屎山代码，我终于把心心念念的 `2` 个功能做出来了

1. 支持 `tailwindcss@4.x` 版本
2. 支持 `tailwind-merge`

> 因为 `tailwindcss@4` 直接变成了一个样式预处理器，定位上和 `sass` / `less` 类似，所以相关的功能改动还是比较多的。

想要了解使用方式的话，就访问 [weapp-tailwindcss 官网](https://tw.icebreaker.top/) 吧!

假如你还想了解更多的话，不如看一下下面这个示例吧。

## uni-app 快速集成示例

这里我们以 `uni-app vue3 vite` 版本为例

### 1. 安装依赖

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

> 这是为了给 `tailwindcss@4` 打上支持 `rpx` 单位的补丁，否则 `tailwindcss` 在校验单位的时候，由于 `rpx` 非标准长度单位，就会把 `rpx` 认为是一种颜色单位了。

### 2. 配置 `vite.config.ts`

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

### 3. 添加样式

在项目目录下，创建一个 `main.css`，然后添加以下内容：

```css title="main.css"
@import 'weapp-tailwindcss';
```

然后直接运行 `npm run dev:mp-weixin` 即可看到效果

## 参考链接

- [weapp-tailwindcss 迁移文档](https://tw.icebreaker.top/docs/migrations/v3)
- [Tailwindcss@4 各个框架集成方式](https://tw.icebreaker.top/docs/quick-start/v4)
- [Tailwindcss@4 升级指南](https://tailwindcss.com/docs/upgrade-guide)
- [uni-app-tailwindcss-v4 参考模板](https://github.com/icebreaker-template/uni-app-tailwindcss-v4)
