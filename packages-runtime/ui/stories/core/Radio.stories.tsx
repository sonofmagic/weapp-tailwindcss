/**
 * Radio 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

interface RadioProps {
  name?: string
  checked?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

const Radio: React.FC<RadioProps> = ({ name, checked, disabled, children }) => (
  <label className="flex items-center gap-2">
    <input type="radio" name={name} checked={checked} disabled={disabled} />
    {children}
  </label>
)

const meta: Meta<typeof Radio> = {
  title: 'Core/Radio',
  component: Radio,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Radio>

export const Default: Story = {
  args: {
    children: '单选框',
  },
}

export const Group: Story = {
  render: () => (
    <div className="space-y-2">
      <Radio name="group1">选项 1</Radio>
      <Radio name="group1">选项 2</Radio>
      <Radio name="group1">选项 3</Radio>
    </div>
  ),
}
