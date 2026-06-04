---
title: "TailwindCssPatchOptions"
description: "Tailwind CSS 补丁运行器的根配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "TailwindCssPatchOptions"
  - "TailwindCssPatchOptions 接口"
  - "TailwindCssPatchOptions 类型定义"
  - "TypeScript"
---

# TailwindCssPatchOptions

Tailwind CSS 补丁运行器的根配置。

## 属性

### projectRoot?

> 可选 | **projectRoot**: `string`

解析 Tailwind 资源时使用的项目根目录。默认是 `process.cwd()`。

***

### tailwindcss?

> 可选 | **tailwindcss**: `TailwindCssOptions`

Tailwind 运行时配置。

#### config?

> 可选 | **config**: `string`

Tailwind 配置文件路径。自动识别不够准确时可以显式传入。
#### cwd?

> 可选 | **cwd**: `string`

解析 Tailwind 配置相对路径时使用的工作目录。
#### postcssPlugin?

> 可选 | **postcssPlugin**: `string`

自定义 PostCSS 插件名称。未传入时使用默认名称。
#### version?

> 可选 | **version**: `3 | 4 | 2`

当前项目使用的 Tailwind CSS 主版本。未传入时会从已安装包推断。
#### packageName?

> 可选 | **packageName**: `string`

Tailwind 包名。项目使用分支包时可以改这里。
#### resolve?

> 可选 | **resolve**: `PackageResolvingOptions`

传给 `local-pkg` 的包解析配置。
#### v2?

> 可选 | **v2**: `TailwindV2Options`

Tailwind CSS v2 补丁选项。
#### v3?

> 可选 | **v3**: `TailwindV3Options`

Tailwind CSS v3 补丁选项。
#### v4?

> 可选 | **v4**: `TailwindV4Options`

Tailwind CSS v4 补丁选项。

***

### apply?

> 可选 | **apply**: `ApplyOptions`

补丁行为开关。

#### overwrite?

> 可选 | **overwrite**: `boolean`

是否允许覆盖磁盘上已经打过补丁的文件。
#### exposeContext?

> 可选 | **exposeContext**: `boolean | ExposeContextOptions`

是否暴露运行时 Tailwind context，或配置具体暴露方式。
#### extendLengthUnits?

> 可选 | **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

扩展长度单位补丁，传入 `false` 可完全关闭。

***

### extract?

> 可选 | **extract**: `ExtractOptions`

类名提取结果输出配置。

#### write?

> 可选 | **write**: `boolean`

是否写出提取结果文件。
#### file?

> 可选 | **file**: `string`

输出文件路径，可传绝对路径或相对路径。
#### format?

> 可选 | **format**: `"json" | "lines"`

输出格式。未传入时使用 JSON。
#### pretty?

> 可选 | **pretty**: `number | boolean`

JSON 格式化缩进。传入可判定为真的值会启用缩进。
#### removeUniversalSelector?

> 可选 | **removeUniversalSelector**: `boolean`

是否从最终列表中移除通配选择器 `*`。

***

### filter()?

> 可选 | **filter()**: `(className: string) => boolean`

过滤最终类名的函数。

#### 参数

##### className

`string`

#### 返回

`boolean`

***

### cache?

> 可选 | **cache**: `boolean | CacheOptions`

缓存配置。传入布尔值可快速启用或关闭。
