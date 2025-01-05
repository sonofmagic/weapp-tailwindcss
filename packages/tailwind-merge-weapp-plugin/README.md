# Tailwind CSS Merge Weapp 插件使用说明

## 1. 概述

`tailwind-merge-weapp-plugin` 是一个用于在小程序中整合 `Tailwind CSS` 样式类的和 `weapp-tailwindcss` 对应的插件。

## 2. 安装

首先，确保你已经安装了 `tailwindcss` 和 `tailwind-merge`。

然后可以通过 `npm` 或 `yarn` 或者 `pnpm` 安装本插件：

```bash
npm install tailwind-merge-weapp-plugin
# or
yarn add tailwind-merge-weapp-plugin
# or
pnpm install tailwind-merge-weapp-plugin
```

## 3. 配置

### 3.1 引入插件

```javascript
import { extendTailwindMerge } from 'tailwind-merge'
import { withWeapp } from 'tailwind-merge-weapp-plugin'

const twMerge = extendTailwindMerge(withWeapp)
```
