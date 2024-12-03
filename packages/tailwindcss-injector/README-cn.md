# TailwindCSS Injector

**[English](/README.md) | 中文**

- [TailwindCSS Injector](#tailwindcss-injector)
  - [概述](#概述)
  - [功能](#功能)
  - [安装](#安装)
  - [使用方法](#使用方法)
    - [基本示例](#基本示例)
  - [配置选项](#配置选项)
    - [示例配置](#示例配置)
  - [工作原理](#工作原理)
  - [许可证](#许可证)

---

## 概述

`tailwindcss-injector` 是一个用于动态注入 TailwindCSS 指令和配置的库。它包含一个 PostCSS 插件，支持多种文件扩展名、动态配置和灵活的文件过滤，可以无缝集成到现代构建管道中。

---

## 功能

- **动态指令注入**：自动插入 TailwindCSS 指令，例如 `@tailwind base`、`@tailwind components` 和 `@tailwind utilities`。
- **支持多种扩展名**：处理具有自定义扩展名的文件（例如 `.html`、`.js`、`.ts`）。
- **内联或外部配置**：支持内联配置对象或配置文件路径。
- **可定制文件过滤**：通过过滤函数选择需要处理的文件。
- **与 TailwindCSS 集成**：根据文件动态调整 TailwindCSS 配置。

---

## 安装

安装此库及其依赖项：

```bash
npm install tailwindcss-injector tailwindcss postcss --save-dev
```

---

## 使用方法

要使用 PostCSS 插件，请从 `tailwindcss-injector/postcss` 引入：

### 基本示例

```javascript
const tailwindInjector = require('tailwindcss-injector/postcss')

module.exports = {
  plugins: [
    tailwindInjector({
      cwd: process.cwd(),
      config: './tailwind.config.js',
      directiveParams: ['base', 'components', 'utilities'],
      extensions: ['html', 'js', 'ts'],
      filter: input => !!input?.file && input.file.endsWith('.css'),
    }),
  ],
}
```

---

## 配置选项

该插件支持以下配置项：

| 配置项            | 类型                                                               | 描述                                     |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| `cwd`             | `string`                                                           | 当前工作目录。                           |
| `config`          | `string \| Partial<Config> \| (input) => InlineTailwindcssOptions` | TailwindCSS 配置文件路径或内联配置对象。 |
| `directiveParams` | `('base' \| 'components' \| 'utilities' \| 'variants')[]`          | 要注入的 TailwindCSS 指令数组。          |
| `extensions`      | `string[]`                                                         | 支持的文件扩展名数组。                   |
| `filter`          | `(input?: postcss.Input) => boolean`                               | 自定义文件过滤函数。                     |

### 示例配置

```javascript
{
  cwd: process.cwd(), // 设置当前工作目录
  config: './tailwind.config.js', // 使用外部 TailwindCSS 配置文件
  directiveParams: ['base', 'components', 'utilities'], // 动态注入的指令
  extensions: ['html', 'js', 'ts'], // 处理特定文件扩展名
  filter: (input) => !!input?.file && input.file.endsWith('.css'), // 仅处理 CSS 文件
}
```

---

## 工作原理

1. **指令注入**：
   插件确保在 CSS 文件中注入指定的 TailwindCSS 指令（例如 `@tailwind base`、`@tailwind components`）。

2. **动态配置**：
   根据处理的文件动态调整 TailwindCSS 配置，包括自定义扩展名支持。

3. **文件过滤**：
   可以通过 `filter` 选项指定需要处理的文件。

4. **PostCSS 处理**：
   插件与 PostCSS 集成，应用 TailwindCSS 转换。

---

## 许可证

此项目采用 **MIT 许可证**。有关详细信息，请参阅 `LICENSE` 文件。
