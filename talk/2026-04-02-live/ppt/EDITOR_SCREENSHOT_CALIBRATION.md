# Google Slides 编辑器截图校准流程

## 为什么不用 `gws` 做视觉验收

`gws-slides` 适合：

- 创建和更新元素
- 检查对象是否存在
- 读取文本与坐标

`gws-slides` 不适合：

- 判断编辑器画布里是否“视觉居中”
- 判断自动换行后的真实重心
- 替代真实浏览器截图

结论：

- `gws-slides` 负责改
- 浏览器编辑器截图负责验

## 为什么会出现“我看到的”和“脚本看到的”不一致

之前偏差的根因不是用户看错，而是验收源错了：

- `htmlpresent` 不是 Google Slides 编辑器的真实排版引擎
- Google Slides 会按自己的字体度量、自动换行和文本框规则重新排版
- 主标题是否“视觉居中”，还会被右侧素材、断行长度、编辑器画布缩放共同影响

所以以后要把下面这条当硬规则：

- 结构检查可以用 `gws-slides`
- 视觉验收必须看真实 `edit?slide=id...` 编辑器截图

## 验收环境约束

为了让截图更接近用户肉眼看到的结果，校准时固定以下条件：

- 使用真实 Google Slides 编辑器链接
- 保持左侧缩略图栏展开
- 使用编辑器默认 `适合大小`
- 每次只校准一个目标页，不同时滚动别的页
- 同一轮迭代里尽量保持同一浏览器窗口尺寸

## 当前文件

- `apply-google-slides-keynote-pass.mjs`
  用于应用关键页 statement 布局
- `keynote-layout-overrides.json`
  存放单页校准参数，优先改这里
- `print-google-slides-calibration-links.mjs`
  输出需要逐页校准的编辑器链接
- `inspect-google-slides-layout.mjs`
  用于读回对象结构，排查重复元素或残留图层

## 标准校准步骤

1. 输出待校准链接

```bash
node talk/2026-04-02-live/ppt/print-google-slides-calibration-links.mjs
```

2. 在浏览器中打开目标 `edit?slide=id...` 链接

只看真实编辑器画布，不看 `htmlpresent`。

3. 截图观察问题类型

- 横向偏左 / 偏右
- 纵向太散 / 太挤
- 断行不均衡
- 右侧素材打断视觉中心

4. 只改 `keynote-layout-overrides.json`

优先调：

- `headline.x`
- `headline.w`
- `subline.x`
- `subline.y`
- `kicker.x`

如果断行本身不平衡，再调 `headlineText`。

推荐顺序：

- 先调 `headline.x`
- 再调 `headline.w`
- 最后才调 `headlineText`

5. 重新应用

```bash
node talk/2026-04-02-live/ppt/apply-google-slides-keynote-pass.mjs
```

6. 回到同一个编辑器链接再次截图

不要切到其他视图，不要用 `htmlpresent` 代替。

7. 如果仍不对，继续单页迭代

规则：

- 一次只修一页
- 一次只改一个方向
- 先修第 2 页，确认方法有效后再复制到其他页

## 单页校准判定标准

满足下面 4 条，才算这页通过：

- 主标题视觉中心接近画布中心线
- `kicker` 与主标题中心基本一致
- 副标题不被看成“右下角挂件”
- 不依赖 `htmlpresent`、API 坐标或对象列表做替代验收

## 第 18 页经验

- 右侧 `Repo Asset` 会破坏主张页重心，必要时删除
- 单行主标题通常比“两行一长一短”更稳定
- 编辑器里“文本框居中”不等于“视觉上居中”，需要看真实截图
- 如果标题已经接近中轴，但副标题仍显得偏右，优先左移 `subline.x`
