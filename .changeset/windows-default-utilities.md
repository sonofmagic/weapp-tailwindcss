---
"weapp-tailwindcss": patch
"weapp-style-injector": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Windows 下 CSS import 转义路径导致默认源码扫描失效、标准 utility 与 spacing 变量缺失的问题。统一入口路径解析、CSS 请求序列化和主题文件定位。

Vite 清理已注入的样式产物时，在单次操作内复用主样式的比较索引，避免对每个候选产物重复解析同一份 CSS。索引绑定不可变内容，不跨 HMR 构建保留。

Vite 将原始用户样式与框架已处理的 bundle CSS 分开传递，生成 CSS 完成框架转换后再合并后者，避免 px/rpx 阶段差异导致依赖样式重复输出。保留用户覆盖顺序，并避免重放已执行的框架插件或恢复旧主题变量。

修正 Vite watch 删除模板时的源码与产物归属、符号链接路径身份和候选缓存失效；覆盖 quickapp qxml，并保证 Vite 开发服务中的新增任意值使用当前生成器验证集合，使 CSS 与 JS 类名一致。

修复没有 PostCSS loader 的 Webpack 预处理链路：在 Sass/Less/Stylus 输出 CSS 后再执行生成和 import 解析，兼容 Docusaurus 服务端丢弃样式的规则。

修复 Webpack 将 Windows 输出目录直接当作 Watchpack glob 导致忽略规则失效的问题。输出目录使用字面路径包含关系，兼容盘符、UNC、空格与 glob 特殊字符，避免生成产物反复触发 watch 构建。

Webpack 监听依赖通过构建器输入文件系统分类，避免把 Taro 虚拟入口误登记为缺失文件并循环重建；loader 等待异步依赖注册完成后再返回产物。

扩展所有 demo 的 Windows、macOS、Linux CLI 验收，覆盖生产、开发首编译、连续源码修改及 Web 刷新。修复百度小程序 CSS 产物身份与重放、入口 chunk 的独立样式引用、Webpack 生成前后的 CSS/JS 边界和 Rspack 已注册 loader 的增量生成；修复 uni 样式注入入口缓存跨构建失效。原生目标保持已有接入边界，仅验收 CLI 构建，不声明设备或 utility 样式覆盖。Refs #1159。
