/**
 * Textarea 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

interface TextareaProps {
  placeholder?: string
  disabled?: boolean
  rows?: number
}

const Textarea: React.FC<TextareaProps> = ({ placeholder, disabled, rows = 4 }) => (
  <textarea className="wt-input" placeholder={placeholder} disabled={disabled} rows={rows} />
)

const meta: Meta<typeof Textarea> = {
  title: 'Core/Textarea',
  component: Textarea,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: '请输入多行文本',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '禁用状态',
  },
}
