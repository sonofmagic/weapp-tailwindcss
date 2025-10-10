# AI 生成小程序代码

## 提升效率

本页面为使用 AI 快速构建小程序的专题，希望能够帮助大家不断的提升自己的开发效率

同时也希望大家一起讨论参与，快速的生成他个成百上千个小程序, APP, 和网站！

## 如何参与贡献

### 前置环境

1. `nodejs@22`
2. `pnpm@10`
3. `Github` 账号

### 开始

点击 [`fork weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss/fork), 然后 `git clone` 到本地在打开这个目录:

1. 执行 `pnpm i` 安装依赖
2. 执行 `pnpm build:pkg` 构建 `website` 的本地依赖包
3. 然后 `cd website && pnpm dev` (切换到 `website` 目录, 跑 `pnpm dev`，当然你也可以在 `vscode` 里面右键打开终端，然后 `pnpm dev` 运行)
4. 访问 `http://localhost:4000` 就是 `weapp-tailwindcss` 的官方文档网站了

然后，你可以在 `website/docs/ai` 目录下，新建 `md` / `mdx` 文件，进行写作，路由会自动映射到:

`http://localhost:4000/docs/ai/{your_doc_name}` 路径中去

> 比如你创建一个 `v0.md`，你的路由就是 `http://localhost:4000/docs/ai/v0`
>
> 假如你创建一个 `index.md`，比如这个页面就是一个 `index.md` 这个页面访问路径为 http://localhost:4000/docs/ai

假如你有素材，可以放在 `website/docs/ai/assets/{your_doc_name}` 目录下，然后在 `md` 文件中，进行引用

## 示例

### 网站

1. https://v0.dev/

2. https://docs.crewai.com/guides

3. https://bolt.new/

### 上传图片

比如要实现 `网页云音乐`，就手机上打开 `网页云音乐`，然后截长图，上传到 `v0.dev`

> 此处有截图

### 提示词

然后提示词为

- `技术栈为 uni-app vue3 tailwindcss, 实现这个页面`(根据你的需求自定义)

然后复制代码即可

> 此处有截图
