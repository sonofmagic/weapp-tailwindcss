---
"weapp-tailwindcss": patch
---

修复 `weapp-tw patch` 默认工作目录解析，优先使用 WEAPP_TW_PATCH_CWD/INIT_CWD，避免 postinstall 未对真实子包打补丁导致运行时才补丁的问题。
