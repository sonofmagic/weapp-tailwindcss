---
'weapp-tailwindcss': patch
---

修复在 uni-app x 与其它 Vue 模板中，`:class` 使用对象、数组或三元表达式时，`border-[#ff0000] bg-blue-600/50` 这类带空格/特殊字符的类名无法被 weapp-tailwindcss 转译的问题。现在会自动在需要时以表达式模式解析并转义这些原子类。
