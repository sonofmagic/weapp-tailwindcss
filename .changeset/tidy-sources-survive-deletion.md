---
"@weapp-tailwindcss/engine": patch
---

修复生成扫描在枚举后遇到文件或父目录删除时抛出 ENOENT、ENOTDIR 的竞态。忽略本轮已消失的候选来源，保留依赖身份供文件重建使用；权限和 I/O 错误仍正常抛出。
