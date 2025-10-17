---
weapp-tailwindcss: patch
---

修复 Gulp 打包流程在解析本地模块时漏掉目录形式的 `index.*` 文件，确保跨文件模块图能够正确跟进依赖，并补充对应单测验证行为。
