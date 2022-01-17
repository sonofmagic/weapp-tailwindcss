# npm-lib-template

本人用于编写的一个 `npm` 包的一个模板

- 使用 `tsc` 或者 `rollup` 打包
- 使用 `jest` 设置作为单元测试
- 使用 `eslint` 来规范代码风格，默认风格为 `standard`
- 输出 `dist` -> `cjs`,`esm` and `.d.ts`

## scripts

执行 `npm run init:rename`
 
作用为替换 `package.json` 中默认包含的所有名称为 `npm-lib-template` 的字段

默认替换为新建代码仓库的文件夹名称！
