---
"theme-transition": patch
---

修复圆形主题切换收尾闪烁，并在 View Transition 完成后释放动画资源，避免反复切换时 Chrome 合成资源持续占用。
