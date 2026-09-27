---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复微信 Tailwind CSS 4 固定 rpx 主题在默认配置下的 calc 尺寸偏差：新增自动模式，按完整产物作用域预计算并保留覆盖与缓存边界；动态主题可通过 cssOptions.cssCalc: false 退出。

修复 uni-app 小程序 watch 删除或清空整个 SFC 样式块后旧样式产物残留的问题：通过 CSS 输出插件已提交的资产归属补齐空资产写入，保留构建失败、多输出与其他生产者的边界。

保留调用阶段嵌套 CSS 配置的安全默认值，避免意外展开第三方组件变量；减少样式阶段配置复制，并在上下文和单位选项不变时复用最终资产结果。

修复已有等价目标值时原单位声明未被替换的问题，保留覆盖顺序和显式保留模式；将修正后的单位换算实现随 PostCSS 的 ESM/CJS 产物一起交付。

升级到包含上游修复的 postcss-plugin-shared 1.1.7 依赖链（rem 插件 7.0.7、pxtrans 1.0.6、unit-converter 0.2.5），移除临时 pnpm 补丁及锁文件登记，保留单位替换回归。

延后样式管线创建至首次处理，避免重复初始化；复用同次 preflight 的选择器拆分结果，并在解析变量作用域选择器前先检查声明，减少大样式表的无效工作。
