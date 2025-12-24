/**
 * Button 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { button } from '../../src/variants'

// 由于实际组件是 Taro 实现，这里创建一个 Web 版本用于展示
interface ButtonProps {
  tone?: 'primary' | 'secondary' | 'success' | 'danger'
  appearance?: 'solid' | 'outline' | 'ghost' | 'tonal'
  size?: 'md' | 'sm' | 'icon'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: () => void
  children?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  tone = 'primary',
  appearance = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  leftIcon,
  rightIcon,
  onClick,
  children,
}) => {
  const classes = button({ tone, appearance, size, disabled: disabled || loading })
  const fullClasses = `${classes} ${block ? 'w-full' : ''}`

  return (
    <button type="button" className={fullClasses} onClick={onClick} disabled={disabled || loading}>
      {loading && <span className="mr-2">⏳</span>}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '按钮组件用于触发操作和跳转。支持多种视觉变体、尺寸和状态。',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: '按钮色调',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    appearance: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'tonal'],
      description: '按钮外观',
      table: {
        defaultValue: { summary: 'solid' },
      },
    },
    size: {
      control: 'select',
      options: ['md', 'sm', 'icon'],
      description: '按钮尺寸',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
      table: {
        defaultValue: { summary: false },
      },
    },
    loading: {
      control: 'boolean',
      description: '加载状态',
      table: {
        defaultValue: { summary: false },
      },
    },
    block: {
      control: 'boolean',
      description: '块级按钮（宽度100%）',
      table: {
        defaultValue: { summary: false },
      },
    },
    children: {
      control: 'text',
      description: '按钮文本',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// 默认按钮
export const Default: Story = {
  args: {
    children: '默认按钮',
  },
}

// 所有色调变体
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button tone="primary">Primary</Button>
      <Button tone="secondary">Secondary</Button>
      <Button tone="success">Success</Button>
      <Button tone="danger">Danger</Button>
    </div>
  ),
}

// 所有外观变体
export const Appearances: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button tone="primary" appearance="solid">
          Solid
        </Button>
        <Button tone="primary" appearance="outline">
          Outline
        </Button>
        <Button tone="primary" appearance="ghost">
          Ghost
        </Button>
        <Button tone="primary" appearance="tonal">
          Tonal
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button tone="danger" appearance="solid">
          Solid Danger
        </Button>
        <Button tone="danger" appearance="outline">
          Outline Danger
        </Button>
        <Button tone="danger" appearance="ghost">
          Ghost Danger
        </Button>
        <Button tone="danger" appearance="tonal">
          Tonal Danger
        </Button>
      </div>
    </div>
  ),
}

// 所有尺寸
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
}

// 禁用状态
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled</Button>
      <Button tone="primary" appearance="outline" disabled>
        Disabled Outline
      </Button>
      <Button tone="danger" disabled>
        Disabled Danger
      </Button>
    </div>
  ),
}

// 加载状态
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button loading>Loading...</Button>
      <Button tone="success" loading>
        Submitting
      </Button>
    </div>
  ),
}

// 块级按钮
export const Block: Story = {
  render: () => (
    <div className="space-y-4">
      <Button block>Block Button</Button>
      <Button tone="success" block>
        Success Block
      </Button>
    </div>
  ),
}

// 带图标
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon="👈">Left Icon</Button>
      <Button rightIcon="👉">Right Icon</Button>
      <Button leftIcon="✨" rightIcon="🚀">
        Both Icons
      </Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
}

// 交互示例
export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0)
    return (
      <div className="space-y-4">
        <p>
          点击次数:
          {count}
        </p>
        <Button onClick={() => setCount(count + 1)}>点击我 +1</Button>
      </div>
    )
  },
}

// Playground - 自由组合测试
export const Playground: Story = {
  args: {
    tone: 'primary',
    appearance: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
    children: 'Playground Button',
  },
}
