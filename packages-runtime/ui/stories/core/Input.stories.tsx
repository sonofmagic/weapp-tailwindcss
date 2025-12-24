/**
 * Input 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { input } from '../../src/variants'

interface InputProps {
  state?: 'default' | 'success' | 'error'
  disabled?: boolean
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input: React.FC<InputProps> = ({ state = 'default', disabled = false, placeholder, value, onChange }) => {
  const classes = input({ state, disabled })
  return <input type="text" className={classes} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />
}

const meta: Meta<typeof Input> = {
  title: 'Core/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '输入框组件用于接收用户输入的文本内容。',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'success', 'error'],
      description: '输入框状态',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    placeholder: {
      control: 'text',
      description: '占位符文本',
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: '请输入内容',
  },
}

export const States: Story = {
  render: () => (
    <div className="space-y-4">
      <Input state="default" placeholder="默认状态" />
      <Input state="success" placeholder="成功状态" />
      <Input state="error" placeholder="错误状态" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '禁用状态',
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('')
    return (
      <div className="space-y-2">
        <Input value={value} onChange={e => setValue(e.target.value)} placeholder="受控输入" />
        <p className="text-gray-600 text-sm">
          当前值:
          {' '}
          {value}
        </p>
      </div>
    )
  },
}

export const Playground: Story = {
  args: {
    state: 'default',
    disabled: false,
    placeholder: 'Playground Input',
  },
}
