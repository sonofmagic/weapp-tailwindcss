# API参考

<cite>
**本文档中引用的文件**  
- [weapp-tailwindcss/package.json](file://packages/weapp-tailwindcss/package.json)
- [weapp-tailwindcss/src/core.ts](file://packages/weapp-tailwindcss/src/core.ts)
- [weapp-tailwindcss/src/cli.ts](file://packages/weapp-tailwindcss/src/cli.ts)
- [weapp-tailwindcss/bin/weapp-tailwindcss.js](file://packages/weapp-tailwindcss/bin/weapp-tailwindcss.js)
- [postcss/package.json](file://packages/postcss/package.json)
- [postcss/src/index.ts](file://packages/postcss/src/index.ts)
- [weapp-style-injector/package.json](file://packages/weapp-style-injector/package.json)
- [weapp-style-injector/src/index.ts](file://packages/weapp-style-injector/src/index.ts)
</cite>

## 目录
1. [weapp-tailwindcss核心API](#weapp-tailwindcss核心api)
2. [CLI工具命令参考](#cli工具命令参考)
3. [PostCSS处理器API](#postcss处理器api)
4. [weapp-style-injector API](#weapp-style-injector-api)

## weapp-tailwindcss核心API

`weapp-tailwindcss` 核心包提供了处理小程序中Tailwind CSS集成的主要功能。其核心API包括 `createContext`、`process` 和 `build` 等函数，用于在不同构建环境中处理样式、模板和脚本。

### createContext
该函数用于创建一个上下文对象，该对象封装了处理小程序模板（WXML）、样式（WXSS）和脚本（JS）所需的所有转换方法。

**参数**
- `options`: `UserDefinedOptions` 类型的对象，包含用户定义的配置选项，如基础目录、Tailwind CSS配置文件路径等。

**返回值**
- 返回一个包含以下方法的对象：
  - `transformWxss`: 用于转换WXSS样式字符串。
  - `transformWxml`: 用于转换WXML模板字符串。
  - `transformJs`: 用于转换JS脚本字符串。

**异常情况**
- 如果在初始化过程中无法正确加载Tailwind CSS配置或相关依赖，可能会抛出错误。

**Section sources**
- [weapp-tailwindcss/src/core.ts](file://packages/weapp-tailwindcss/src/core.ts#L13-L76)

## CLI工具命令参考

`weapp-tailwindcss` 提供了一个CLI工具，用于在命令行中执行各种操作，如生成VS Code智能感知入口文件等。

### init
该命令用于初始化项目，自动配置Tailwind CSS相关的文件和设置。

### build
该命令用于构建项目，处理所有相关的样式和脚本文件，生成最终的输出。

### dev
该命令用于启动开发服务器，支持热重载和实时预览。

### vscode-entry
该命令用于生成一个VS Code辅助CSS文件，以支持Tailwind CSS的智能感知功能。

**选项**
- `--cwd <dir>`: 指定工作目录。
- `--css <file>`: 指定导入weapp-tailwindcss的CSS文件路径（必需）。
- `--output <file>`: 指定辅助文件的输出路径，默认为 `tailwind-intellisense.css`。
- `--source <pattern>`: 指定额外的@source glob模式（可重复）。
- `--force`: 如果辅助文件已存在，则覆盖它。

**使用示例**
```bash
weapp-tailwindcss vscode-entry --css ./src/tailwind.css --output ./tailwind-intellisense.css --force
```

**Section sources**
- [weapp-tailwindcss/src/cli.ts](file://packages/weapp-tailwindcss/src/cli.ts#L41-L75)
- [weapp-tailwindcss/bin/weapp-tailwindcss.js](file://packages/weapp-tailwindcss/bin/weapp-tailwindcss.js#L1-L9)

## PostCSS处理器API

`@weapp-tailwindcss/postcss` 包提供了一个PostCSS插件，用于在构建过程中处理Tailwind CSS样式。

### 插件接口
该插件实现了标准的PostCSS插件接口，可以在PostCSS配置中直接使用。

**处理流程**
1. 接收原始CSS代码作为输入。
2. 使用Tailwind CSS的核心功能生成原子化CSS类。
3. 对生成的CSS进行优化和转换，以适应小程序环境。
4. 输出处理后的CSS代码。

**配置选项**
- `baseDir`: 项目的基础目录。
- `configFile`: Tailwind CSS配置文件的路径。
- `mode`: 处理模式，如开发模式或生产模式。

**Section sources**
- [postcss/src/index.ts](file://packages/postcss/src/index.ts)
- [postcss/package.json](file://packages/postcss/package.json)

## weapp-style-injector API

`weapp-style-injector` 包提供了一种机制，用于在构建过程中自动注入样式文件。

### 注入机制
该机制通过分析项目的文件结构，自动将必要的样式文件注入到相应的页面或组件中。

### 配置选项
- `include`: 指定需要处理的文件模式，默认为所有相关文件。
- `exclude`: 指定不需要处理的文件模式。
- `importResolver`: 自定义导入解析器，用于处理特定框架（如Taro、uni-app）的子包导入。

**支持的框架**
- Taro
- uni-app
- Vite
- Webpack

**Section sources**
- [weapp-style-injector/src/index.ts](file://packages/weapp-style-injector/src/index.ts#L1-L37)
- [weapp-style-injector/package.json](file://packages/weapp-style-injector/package.json)