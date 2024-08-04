# weapp-ide-cli

微信开发者工具的命令行(v2) 的一个二次封装的包裹实现，来让开发者更加方便的使用微信开发者工具。

> 要使用命令行，注意首先需要在开发者工具的设置 -> 安全设置中开启服务端口。

## 快速安装

```bash
npm i -g weapp-ide-cli
# or
yarn global add weapp-ide-cli
```

### 执行命令

```bash
weapp open
# 等价
weapp-ide-cli open

# 在当前命令行所在位置，打开微信开发者工具
weapp open -p
# 等价
weapp open --project

# 在相对的路径，打开微信开发者工具
# 比如 uni-app 就可以在项目目录执行
weapp open -p dist/dev/mp-weixin
# 工具会把相对路径转化为绝对路径，然后打开(绝对路径不转化)
```

## 常用命令

1. `weapp login` 在命令行进行微信扫码登录
2. `weapp open -p` 启动工具进行调试开发
3. `weapp preview` 开始预览
4. `weapp upload` 上传代码
5. `weapp quit` 关闭开发者工具

### 自定义配置

`weapp config` 可以对微信开发者工具的 `cli` 目录进行配置，而配置文件就存放在用户的 `${homedir}/.weapp-ide-cli/config.json` 中，您可以随时进行更改。

> 比如 windows 存放位置就在 `C:\Users\${你的用户名}\.weapp-ide-cli/config.json`

### 更多命令

这个工具本质是一个 `cli` 二次处理工具，所以绝大部分命令都是透传的。

全部的命令请查看 <https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html>
