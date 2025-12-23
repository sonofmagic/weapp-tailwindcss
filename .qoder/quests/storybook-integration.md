# Storybook 集成设计文档

## 项目目标

在 `packages-runtime/ui` 中集成 Storybook，用于展示和测试所有组件的各种用法和状态变体。

## 背景与动机

`@weapp-tailwindcss/ui` 是一个跨端的原子化组件库，目前已实现基础架构和部分核心组件（Button、Input、Textarea、Checkbox、Radio、Switch等），以及数据展示、反馈和布局组件。为了提升开发体验和组件质量，需要建立一个可视化的组件展示和测试平台。

Storybook 能够提供：
- 组件的可视化展示
- 各种属性和状态的交互式测试
- 组件文档的自动生成
- 设计系统的统一展示平台
- 开发过程中的组件隔离测试环境

## 技术选型

### Storybook 版本与框架
- **Storybook 版本**: 8.x（最新稳定版）
- **框架适配器**: React + TypeScript
- **渲染器**: @storybook/react
- **构建工具**: Vite（与项目保持一致）

### 选型理由
1. UI组件库已声明 React 为 peerDependency
2. 项目已使用 Vite 作为构建工具
3. TypeScript 与现有代码栈完全一致
4. Storybook 8.x 提供更好的性能和 TypeScript 支持

## 目录结构设计

```
packages-runtime/ui/
├── .storybook/                    # Storybook 配置目录
│   ├── main.ts                    # 主配置文件
│   ├── preview.ts                 # 全局预览配置
│   ├── preview-head.html          # 自定义头部内容（可选）
│   └── manager.ts                 # UI 定制配置（可选）
├── stories/                       # Story 文件目录
│   ├── Introduction.mdx           # 文档首页
│   ├── core/                      # 核心组件 Stories
│   │   ├── Button.stories.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Textarea.stories.tsx
│   │   ├── Checkbox.stories.tsx
│   │   ├── Radio.stories.tsx
│   │   └── Switch.stories.tsx
│   ├── data-display/              # 数据展示组件 Stories
│   │   ├── Avatar.stories.tsx
│   │   ├── Badge.stories.tsx
│   │   ├── Card.stories.tsx
│   │   ├── Tag.stories.tsx
│   │   ├── List.stories.tsx
│   │   ├── Table.stories.tsx
│   │   └── Collapse.stories.tsx
│   ├── feedback/                  # 反馈组件 Stories
│   │   ├── Alert.stories.tsx
│   │   ├── Toast.stories.tsx
│   │   ├── Modal.stories.tsx
│   │   ├── Dialog.stories.tsx
│   │   ├── Loading.stories.tsx
│   │   └── Progress.stories.tsx
│   ├── layout/                    # 布局组件 Stories
│   │   ├── Divider.stories.tsx
│   │   ├── Flex.stories.tsx
│   │   └── Grid.stories.tsx
│   └── navigation/                # 导航组件 Stories
│       ├── Menu.stories.tsx
│       ├── Tabs.stories.tsx
│       └── Pagination.stories.tsx
├── src/
│   └── ... (现有组件代码)
└── package.json
```

## Storybook 配置设计

### 主配置文件 (main.ts)

配置内容包括：

1. **Stories 文件匹配规则**
   - 匹配所有 `stories/` 目录下的 `.stories.tsx` 和 `.mdx` 文件
   - 支持嵌套目录结构

2. **插件与扩展**
   - @storybook/addon-essentials: 核心功能集合（Controls、Actions、Viewport等）
   - @storybook/addon-interactions: 交互测试
   - @storybook/addon-a11y: 无障碍检查
   - @storybook/addon-themes: 主题切换（如需支持）

3. **框架配置**
   - 使用 @storybook/react-vite 框架
   - 集成项目现有的 Vite 配置

4. **TypeScript 支持**
   - 启用 TypeScript 文档生成
   - 自动提取组件属性类型

5. **构建优化**
   - 配置别名指向 src 目录
   - 排除不必要的依赖打包

### 预览配置 (preview.ts)

全局配置内容：

1. **样式导入**
   - 导入 Tailwind CSS 样式文件（dist/index.css）
   - 导入组件库的全局样式

2. **全局装饰器**
   - 添加容器包装器，提供合适的布局环境
   - 配置主题切换装饰器（如需要）

3. **参数配置**
   - 设置默认视口（移动端/桌面端）
   - 配置 Actions 面板行为
   - 设置组件文档排序规则

4. **Controls 配置**
   - 定义全局 Controls 类型映射
   - 配置特定属性的控制器类型

## Story 编写规范

### Story 文件结构

每个组件的 Story 文件应包含：

1. **默认导出（Meta 对象）**
   - 组件标题和分类
   - 组件引用
   - ArgTypes 定义（属性控制器）
   - 全局参数配置

2. **命名导出（Story 实例）**
   - Default: 默认状态展示
   - Variants: 展示所有变体（tone、appearance、size等）
   - States: 展示所有状态（disabled、loading、error等）
   - Interactive: 交互式示例
   - Playground: 自由组合测试

### 通用 Story 模板结构

```
组件名.stories.tsx
├── Meta 定义
│   ├── title: 分类路径（如 "Core/Button"）
│   ├── component: 组件引用
│   ├── tags: 自动文档标签
│   └── argTypes: 属性控制器定义
├── Default Story
│   └── 基础用法展示
├── Variants Story
│   └── 所有变体组合展示
├── States Story
│   └── 所有状态展示
├── Sizes Story（如适用）
│   └── 尺寸变体展示
├── WithIcons Story（如适用）
│   └── 图标组合展示
├── Interactive Story
│   └── 交互行为测试
└── Playground Story
    └── 自由参数组合
```

### 覆盖的用法类型

每个组件应展示：

1. **基础变体 (Variants)**
   - tone: primary, secondary, success, danger等
   - appearance: solid, outline, ghost, tonal等
   - size: sm, md, lg, icon等

2. **状态 (States)**
   - 默认状态
   - disabled: 禁用状态
   - loading: 加载状态
   - error: 错误状态
   - success: 成功状态

3. **布局选项 (Layout)**
   - block: 块级元素（宽度100%）
   - inline: 行内元素

4. **特殊属性 (Special)**
   - 带图标（leftIcon, rightIcon）
   - 自定义类名（className）
   - 自定义样式（style）

5. **交互行为 (Interactions)**
   - onClick 事件
   - onLongPress 事件
   - 其他特定事件回调

6. **组合使用 (Compositions)**
   - 与其他组件组合
   - 在表单中使用
   - 在列表中使用

## 核心组件 Story 清单

### Core 组件（6个）

| 组件 | 主要展示内容 | Story 数量 |
|------|------------|-----------|
| Button | tone变体、appearance变体、size、disabled、loading、block、图标组合 | 8+ |
| Input | state状态、disabled、placeholder、clearable、带前后缀 | 6+ |
| Textarea | state状态、disabled、autoHeight、字数统计 | 5+ |
| Checkbox | checked状态、disabled、indeterminate、单选/多选 | 5+ |
| Radio | checked状态、disabled、单选组 | 4+ |
| Switch | checked状态、disabled、size | 4+ |

### Data Display 组件（7个）

| 组件 | 主要展示内容 | Story 数量 |
|------|------------|-----------|
| Avatar | size变体、图片/文字/图标、形状、分组 | 5+ |
| Badge | tone变体、count、dot、位置 | 5+ |
| Card | shadow变体、border变体、带header/footer | 4+ |
| Tag | tone变体、closable、size | 4+ |
| List | 基础列表、interactive、带图标、分组 | 5+ |
| Table | 基础表格、带边框、斑马纹、固定表头 | 4+ |
| Collapse | 手风琴、多个展开、带图标 | 3+ |

### Feedback 组件（6个）

| 组件 | 主要展示内容 | Story 数量 |
|------|------------|-----------|
| Alert | tone变体、closable、带图标、带标题 | 5+ |
| Toast | tone变体、duration、position | 4+ |
| Modal | 基础用法、大小、footer、拖拽 | 5+ |
| Dialog | 基础用法、confirm、alert、custom | 4+ |
| Loading | size、fullscreen、带文字 | 3+ |
| Progress | 基础进度条、circular、颜色、百分比 | 4+ |

### Layout 组件（3个）

| 组件 | 主要展示内容 | Story 数量 |
|------|------------|-----------|
| Divider | 水平/垂直、文字、虚线 | 3+ |
| Flex | 方向、对齐、间距、换行 | 4+ |
| Grid | 列数、间距、响应式 | 3+ |

### Navigation 组件（3个）

| 组件 | 主要展示内容 | Story 数量 |
|------|------------|-----------|
| Menu | 基础菜单、子菜单、图标、选中状态 | 4+ |
| Tabs | 基础标签、位置、size、卡片式 | 4+ |
| Pagination | 基础分页、simple、size、跳转 | 4+ |

## 依赖包管理

### 新增依赖

**开发依赖（devDependencies）：**

```
storybook: ^8.x
@storybook/react: ^8.x
@storybook/react-vite: ^8.x
@storybook/addon-essentials: ^8.x
@storybook/addon-interactions: ^8.x
@storybook/addon-a11y: ^8.x
@storybook/addon-themes: ^8.x（可选）
@storybook/test: ^8.x
react: ^18.x（已有 peerDependencies）
react-dom: ^18.x
```

### package.json Scripts 新增

```
"storybook": "storybook dev -p 6006"
"storybook:build": "storybook build"
"storybook:test": "test-storybook"
```

## 样式集成方案

### 样式导入策略

1. **在 preview.ts 中全局导入**
   - 导入 `../dist/index.css` 作为基础样式
   - 确保所有 Story 共享相同的样式基础

2. **组件隔离样式**
   - 每个 Story 应使用组件的 variant 函数生成类名
   - 避免直接硬编码类名

3. **样式调试**
   - 利用 Storybook 的 inspect 工具查看生成的类名
   - 在不同主题下测试组件样式

### Tailwind CSS 配置

需要确保 Storybook 能够正确识别 Tailwind CSS：

1. **引入预设**
   - 在 preview.ts 中说明需要使用 weappTailwindcssUIPreset
   - 确保设计令牌正确应用

2. **支持 rpx 单位**
   - 在文档中说明 rpx 单位的转换机制
   - 提供 Web 环境下的查看效果

## 文档与指南

### 首页文档 (Introduction.mdx)

内容包括：

1. **组件库概述**
   - 介绍 @weapp-tailwindcss/ui 的定位
   - 说明跨端支持能力

2. **快速开始**
   - 安装指南
   - 基础配置示例

3. **设计原则**
   - 原子化设计理念
   - Headless 组件架构

4. **浏览导航**
   - 组件分类说明
   - 如何查找所需组件

### 每个组件的文档要求

在 Story 文件中通过 MDX 或注释提供：

1. **组件描述**
   - 组件用途和使用场景
   - 何时使用该组件

2. **API 文档**
   - 自动从 TypeScript 类型生成
   - 属性表格展示

3. **使用示例**
   - 代码示例与实际渲染对比
   - 最佳实践说明

4. **无障碍说明**
   - ARIA 属性使用
   - 键盘交互支持

5. **平台差异**
   - Taro、uni-app、原生小程序的差异说明
   - 不同平台的注意事项

## 交互测试策略

### 测试覆盖范围

1. **用户交互**
   - 点击事件触发
   - 键盘导航
   - 长按操作

2. **状态变化**
   - 受控组件值更新
   - 非受控组件内部状态
   - 加载状态切换

3. **表单行为**
   - 输入验证
   - 提交行为
   - 重置功能

### 交互测试工具

使用 @storybook/addon-interactions 和 @storybook/test：

1. **在 Story 中定义 play 函数**
   - 模拟用户操作序列
   - 断言预期结果

2. **测试用例组织**
   - 为关键交互创建独立 Story
   - 使用 test-storybook 运行自动化测试

## 无障碍测试

### 集成 A11y Addon

1. **自动检查**
   - 在所有 Story 中启用无障碍检查
   - 自动识别常见问题（对比度、ARIA 属性等）

2. **手动验证**
   - 键盘导航测试
   - 屏幕阅读器友好性

3. **文档记录**
   - 在组件文档中说明无障碍特性
   - 提供无障碍最佳实践

## 构建与部署

### 本地开发

启动 Storybook 开发服务器：
- 默认端口：6006
- 支持热重载
- 实时查看组件变化

### 构建静态站点

构建产物：
- 生成静态 HTML 站点
- 输出到 storybook-static 目录
- 可部署到任意静态托管服务

### 部署选项

可选的托管平台：
1. Chromatic（推荐，Storybook 官方）
2. Netlify
3. Vercel
4. GitHub Pages

## 维护与扩展

### 新增组件流程

1. 开发组件实现
2. 编写组件 Story 文件
3. 覆盖所有变体和状态
4. 添加交互测试
5. 运行无障碍检查
6. 更新文档

### 更新现有组件

1. 修改组件实现
2. 同步更新 Story
3. 验证现有 Story 正常运行
4. 补充新增功能的 Story
5. 更新组件文档

### 质量保障

1. **Story 覆盖率检查**
   - 确保每个组件都有对应的 Story
   - 验证所有属性组合都被展示

2. **视觉回归测试**
   - 使用 Chromatic 或类似工具
   - 对比组件视觉变化

3. **定期审查**
   - 检查文档完整性
   - 更新过时的示例
   - 优化 Story 性能

## 成功标准

完成以下目标表示集成成功：

1. **基础设施完备**
   - ✅ Storybook 配置文件就位
   - ✅ 构建和开发脚本可运行
   - ✅ 样式正确加载

2. **组件覆盖完整**
   - ✅ 所有已实现组件都有 Story
   - ✅ 每个组件至少 3+ Story 实例
   - ✅ 覆盖所有重要变体和状态

3. **文档完善**
   - ✅ 首页文档清晰
   - ✅ 每个组件有描述和 API 文档
   - ✅ 提供使用示例

4. **测试集成**
   - ✅ 交互测试覆盖核心功能
   - ✅ 无障碍检查通过
   - ✅ 自动化测试可运行

5. **可维护性**
   - ✅ Story 文件结构清晰
   - ✅ 组件更新流程明确
   - ✅ 代码风格一致

## 技术约束与注意事项

### 跨端兼容性考虑

1. **组件实现差异**
   - Button 等组件有 Taro、uni-app、原生版本
   - Story 中展示的是 React（Taro）版本
   - 需在文档中说明跨平台差异

2. **样式单位转换**
   - rpx 单位在 Web 环境的展示效果
   - 可能需要额外的说明或转换工具

3. **平台特有功能**
   - open-type 等小程序特有属性在 Web 中不可用
   - 在 Story 中标注平台限制

### 性能优化

1. **按需加载**
   - Story 文件较多时考虑懒加载
   - 避免在 preview.ts 中引入过多全局逻辑

2. **构建优化**
   - 排除不必要的依赖
   - 优化 Vite 配置

3. **Story 编写**
   - 避免在单个 Story 中渲染过多组件
   - 合理拆分复杂示例

### 依赖管理

1. **版本兼容**
   - 确保 React 版本与项目 peerDependencies 一致
   - Storybook 版本与 Vite 兼容

2. **Monorepo 集成**
   - 利用 pnpm workspace
   - 共享项目通用配置和依赖

3. **构建流程**
   - 不应影响现有的 `pnpm build` 流程
   - Storybook 构建作为独立任务

## 实施计划建议

### 阶段一：基础设施搭建

1. 安装 Storybook 及相关依赖
2. 创建配置文件（main.ts, preview.ts）
3. 设置样式导入和全局配置
4. 验证 Storybook 可正常启动

### 阶段二：核心组件 Stories

1. 创建 Introduction.mdx 首页文档
2. 为 Button 创建完整 Story（作为模板）
3. 依次完成 Input、Textarea、Checkbox、Radio、Switch 的 Story
4. 验证所有核心组件 Story 正常运行

### 阶段三：扩展组件 Stories

1. 完成 Data Display 组件 Stories
2. 完成 Feedback 组件 Stories
3. 完成 Layout 组件 Stories
4. 完成 Navigation 组件 Stories

### 阶段四：测试与文档完善

1. 为关键组件添加交互测试
2. 运行无障碍检查并修复问题
3. 完善组件文档和使用说明
4. 编写维护指南

### 阶段五：部署与发布

1. 构建静态站点
2. 选择托管平台并部署
3. 更新项目 README 添加 Storybook 链接
4. 宣布 Storybook 上线

## 参考资源

### 官方文档
- Storybook 官方文档: https://storybook.js.org
- Storybook React 指南: https://storybook.js.org/docs/react/get-started/introduction
- Vite 集成: https://storybook.js.org/docs/react/builders/vite

### 社区最佳实践
- Component Story Format (CSF): https://storybook.js.org/docs/react/api/csf
- 交互测试: https://storybook.js.org/docs/react/writing-tests/interaction-testing
- 无障碍测试: https://storybook.js.org/docs/react/writing-tests/accessibility-testing

### 相关工具
- Chromatic: https://www.chromatic.com/
- Tailwind Variants: https://www.tailwind-variants.org/
- Testing Library: https://testing-library.com/
