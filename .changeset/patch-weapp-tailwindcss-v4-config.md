---
'weapp-tailwindcss': patch
---

修复 v4 patcher 在提供 cssEntries 時錯誤覆寫 base 導致 @config 解析失效，補充回歸確保 runtime class set 正確收集並轉義，並依賴升級至修復版 tailwindcss-patch@8.6.1。
