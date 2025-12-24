# packages-runtime/ui 架构设计文档

## 目标定位

将 `packages-runtime/ui` 打造为**跨端 shadcn/ui**，提供统一的组件 API，自动适配三个主流小程序框架：
- **Native** - 微信小程序原生
- **Taro** - 多端开发框架 (React)
- **uni-app** - 跨端开发框架 (Vue)

## 架构优化总结

### 1. 增强的适配器系统 (`src/adapters/`)

#### 新增功能
- **组件映射** - 定义不同平台的基础组件名称
- **样式适配** - 处理不同平台的样式差异
- **能力检测** - 检查平台支持的 CSS 和 API 特性
- **批量事件处理** - `getEventProps()` 方法批量转换事件

#### 接口扩展
```typescript
interface PlatformAdapter {
  name: 'native' | 'taro' | 'uni-app'
  events: PlatformEventMap
  components: PlatformComponentMap  // 新增
  styleConfig: PlatformStyleConfig  // 新增
  capabilities: PlatformCapabilities // 新增

  getEventPropName: (eventName) => string
  getEventProps: (eventNames, handlers) => Record<string, EventHandler> // 新增
  normalizeEvent: (event) => T
  getEventDetail: (event) => any
  getEventValue: (event) => any

  adaptStyle?: (style) => style  // 新增
  adaptClassName?: (className) => string  // 新增
  supportsCssFeature: (feature) => boolean  // 新增
  supportsApiFeature: (feature) => boolean  // 新增
}
```

### 2. 统一的组件逻辑层 (`src/hooks/`)

#### 新增 Hooks

| Hook | 用途 |
|------|------|
| `usePlatformEvents` | 平台事件处理，自动转换事件名 |
| `useInputLike` | 输入类组件通用逻辑 (Input, Textarea) |
| `useButtonLike` | 按钮/开关类组件通用逻辑 |
| `useInteractive` | 交互状态管理 (hover, active, focus) |

#### 使用示例
```typescript
// useInputLike - 统一输入类组件逻辑
const { value, handleInput, handleClear, showClearButton } = useInputLike({
  value: valueProp,
  defaultValue,
  onChange,
  clearable,
  maxLength,
})

// useButtonLike - 统一按钮类组件逻辑
const { isDisabled, handleClick } = useButtonLike({
  disabled,
  loading,
  onClick,
  debounceDelay: 300,
})
```

### 3. 跨平台组件工厂 (`src/utils/component-factory.ts`)

提供三种工厂函数模式：

#### A. 基础组件工厂
```typescript
const Button = createComponentFactory({
  name: 'Button',
  eventNames: ['click', 'longPress'],
  transformProps: (props, adapter) => {
    return adapter.getEventProps(['click'], { onClick: props.onClick })
  },
  platformRenders: {
    taro: (props) => <View {...props} />,
    native: (props) => ({ type: 'view', props }),
    'uni-app': (props) => ({ template: '...' }),
  },
})
```

#### B. 逻辑组件工厂 (推荐)
```typescript
const Button = createLogicalComponentFactory({
  name: 'Button',
  useLogic: useButton,
  render: (logic, props) => <View {...logic} {...props} />,
  platformRenders: {
    taro: (logic, props) => <View {...logic} {...props} />,
    native: (logic, props) => ({ ... }),
    'uni-app': (logic, props) => ({ ... }),
  },
})
```

#### C. 事件感知组件工厂
```typescript
const Button = createEventAwareComponentFactory({
  name: 'Button',
  events: {
    onClick: 'click',
    onLongPress: 'longPress',
  },
  render: (props, eventProps) => <View {...props} {...eventProps} />,
})
```

### 4. 组件目录结构优化

```
components/
  core/
    button/
      types.ts              # 类型定义
      use-button.ts         # 组件逻辑 (新增)
      render.tsx            # 跨平台渲染层 (新增)
      button.taro.tsx       # Taro 实现
      button.native.ts      # Native 实现 (待实现)
      button.uni-app.ts     # uni-app 实现 (待实现)
      index.ts              # 导出
```

#### 核心文件职责

| 文件 | 职责 |
|------|------|
| `types.ts` | TypeScript 类型定义 |
| `use-xxx.ts` | 组件通用逻辑 (跨平台共享) |
| `render.tsx` | 跨平台渲染层 (三个平台的渲染实现) |
| `xxx.taro.tsx` | Taro 平台特定实现 |
| `xxx.native.ts` | Native 平台特定实现 |
| `xxx.uni-app.ts` | uni-app 平台特定实现 |
| `index.ts` | 统一导出 |

## 开发指南

### 创建新组件

#### 方式一：使用逻辑组件工厂（推荐）

```typescript
// 1. 定义类型
export interface CardProps {
  title?: string
  extra?: string
  children: any
}

// 2. 创建逻辑 Hook
export function useCard(props: CardProps) {
  const { title, extra } = props

  const className = cn('wt-card', {
    'wt-card--has-title': !!title,
  })

  return { className }
}

// 3. 创建渲染函数
export function CardTaro(props: CardProps) {
  const logic = useCard(props)
  const { title, extra, children } = props

  return (
    <View className={logic.className}>
      {title && <View className="wt-card__header">{title}</View>}
      <View className="wt-card__body">{children}</View>
    </View>
  )
}

// 4. 导出
export { CardTaro, useCard }
export type { CardProps }
```

#### 方式二：使用共享 Hooks

```typescript
import { useInputLike } from '../../../hooks/use-input-like'

export function SearchInput(props: SearchInputProps) {
  const { value, handleInput, handleClear, showClearButton } = useInputLike({
    value: props.value,
    clearable: true,
    onChange: props.onSearch,
  })

  return (
    <View className="wt-search">
      <View className="wt-search__icon">🔍</View>
      <Input value={value} onInput={handleInput} />
      {showClearButton && <View onClick={handleClear}>✕</View>}
    </View>
  )
}
```

### 适配器使用

```typescript
import { adapter } from '../adapters'

// 获取平台事件名
const clickEventName = adapter.getEventPropName('click')
// Taro: 'onClick'
// Native: 'bindtap'
// uni-app: '@click'

// 批量获取事件属性
const eventProps = adapter.getEventProps(
  ['click', 'longPress'],
  { onClick: handleClick, onLongPress: handleLongPress }
)

// 检查平台能力
if (adapter.supportsCssFeature('cssVariables')) {
  // 使用 CSS 变量
}
```

## 下一步工作

### 待实现功能

1. **完善剩余组件实现** - 24 个占位组件需要完整实现
2. **Native 平台支持** - 创建 `.native.ts` 渲染函数
3. **uni-app 平台支持** - 创建 `.uni-app.ts` Vue 组件
4. **构建配置优化** - 支持条件编译和平台特定产物

### 构建配置更新

需要配置 Vite/Webpack 支持：
- 条件编译 (`ifdef` / `ifdef-loader`)
- 平台特定入口文件
- 类型定义自动生成

### 组件实现优先级

**高优先级 (核心组件)** ✅ 已完成
- ✅ Switch - 开关组件
- ✅ Checkbox - 复选框组件
- ✅ Radio - 单选框组件
- ⏳ Dialog, Modal - 反馈组件
- ⏳ Card - 展示组件
- ✅ Badge - 徽章组件
- ✅ Tag - 标签组件

**中优先级 (常用组件)**
- ⏳ Tabs, Menu - 导航组件
- ⏳ List, Collapse - 数据展示
- ⏳ Alert, Toast - 反馈组件
- ⏳ Divider - 布局组件

**低优先级 (高级组件)**
- ⏳ Table, Pagination - 复杂组件
- ⏳ Progress, Loading - 状态组件
- ⏳ Avatar, Select - 其他组件

### 已实现组件详情

| 组件 | 状态 | 文件 |
|------|------|------|
| Button | ✅ | `button/use-button.ts`, `button/render.tsx` |
| Input | ✅ | `input/use-input.ts` |
| Textarea | ✅ | `textarea/use-textarea.ts` |
| Switch | ✅ | `switch/use-switch.ts`, `switch/render.tsx` |
| Checkbox | ✅ | `checkbox/use-checkbox.ts`, `checkbox/render.tsx` |
| Radio | ✅ | `radio/use-radio.ts`, `radio/render.tsx` |
| Badge | ✅ | `badge/use-badge.ts`, `badge/render.tsx` |
| Tag | ✅ | `tag/use-tag.ts`, `tag/render.tsx` |

## 设计原则

1. **API 优先** - 先设计统一 API，再考虑平台差异
2. **渐进增强** - 基础功能全平台一致，高级特性按能力降级
3. **逻辑复用** - 共享逻辑抽离到 Hooks，渲染层分离
4. **类型安全** - 全面的 TypeScript 类型支持
5. **零依赖** - 组件逻辑层不依赖特定框架（适配器模式）

## 参考

- [shadcn/ui](https://ui.shadcn.com/) - 组件复制粘贴理念
- [Radix UI](https://www.radix-ui.com/) - 无样式组件模式
- [Ark UI](https://ark-ui.com/) - 跨框架组件库经验
