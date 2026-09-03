## Issue #1144 uni-app x Web HMR 复现项目

此目录完整保留 [Gitee 复现仓库](https://gitee.com/my_hujinchen/weapp-tailwind-test-uniappx) 的页面与主题源码，登记为 [weapp-tailwindcss#1144](https://github.com/sonofmagic/weapp-tailwindcss/issues/1144) 的独立回归 demo。

仓库锁定的 HBuilderX 5.22 Web 编译器无法运行该仓库原有的 `script setup lang="uts"` descriptor 代码，因此仅将 App 和首页脚本改为等价的经典 UTS options 写法；模板、样式块和 `@apply` 复现内容保持不变。

### 复现步骤

1. 使用 Node.js 22.12+ 和 HBuilderX（包含 uni-app x Web 工具链）安装仓库依赖。
2. 在仓库根目录执行 `pnpm --filter @weapp-tailwindcss-demo/issue-1144-uni-app-x-web run dev:h5`。真实 HBuilderX 回归分别运行 `HBUILDERX_CHANNEL=stable E2E_HBUILDERX_CASE=issue-1144-uni-app-x-web pnpm e2e:hbuilderx:h5` 和 `HBUILDERX_CHANNEL=alpha E2E_HBUILDERX_CASE=issue-1144-uni-app-x-web pnpm e2e:hbuilderx:h5`；切换前先关闭另一个 HBuilderX 实例。
3. 打开首页后编辑 `pages/index/index.uvue` 模板中的文字并保存。

首次加载和保存后的 HMR 页面都应正常更新；Vite 页面不应出现错误遮罩，HBuilderX/Vite 日志不应出现 `Unknown word` 或 `[plugin:vite:css]` PostCSS 警告，生成 CSS 也不应残留 Tailwind 原始指令。

### 在 UTS 中读取主题变量

主题只需在 `main.css` 中维护。构建和热更新时会自动生成 `theme.uts`：

```uts
import { getThemeValue } from '@/theme.uts'

const radius = getThemeValue('--radius-xl')
const pageColor = getThemeValue('--theme-page')
console.log(radius.value) // 12px
```

`getThemeValue()` 返回 `ComputedRef<string>`。`@theme` 中的公共 token 返回声明值；`--theme-*` 变量会根据当前 `themeClass` 自动更新为 `.light`、`.dark` 或对应皮肤类中的具体值。在脚本中通过 `.value` 读取，在模板中会自动解包；变量不存在时会输出警告并返回空字符串。

### 多皮肤与暗黑模式

运行时主题位于 `stores/theme.uts`，支持 `default`、`ocean` 两套皮肤，以及浅色、深色、跟随系统三种模式：

```uts
import { setThemeMode, setThemeSkin, useTheme } from '@/stores/theme.uts'

const theme = useTheme()
setThemeSkin('ocean')
setThemeMode('system')
```

页面根节点绑定最终主题类，组件使用引用 CSS 变量的稳定语义类：

```vue
<view :class="[theme.themeClass, 'bg-page']">
	<view class="border border-line bg-surface">
		<text class="text-content">内容</text>
	</view>
</view>
```

`light`、`dark`、`ocean-light`、`ocean-dark` 在 `main.css` 中维护相同的 `--theme-*` 变量；`@theme inline` 将它们映射为 `bg-page`、`text-content`、`border-line` 等 Tailwind 类。新增页面时必须在页面根 `view` 或 `scroll-view` 绑定 `theme.themeClass`，新增皮肤时必须补齐全部语义变量。
