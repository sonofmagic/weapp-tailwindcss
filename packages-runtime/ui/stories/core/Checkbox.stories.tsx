/**
 * Checkbox 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

interface CheckboxProps {
  checked?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, disabled, children }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={checked} disabled={disabled} />
    {children}
  </label>
)

const meta: Meta<typeof Checkbox> = {
  title: 'Core/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    children: '复选框',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    children: '已选中',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '禁用状态',
  },
}
