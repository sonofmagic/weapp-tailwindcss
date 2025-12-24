/**
 * Switch 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

interface SwitchProps {
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

const Switch: React.FC<SwitchProps> = ({ checked = false, disabled = false }) => (
  <label className="inline-flex cursor-pointer items-center">
    <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} />
    <div className={`
      w-11 bg-gray-200 peer relative h-6 rounded-full
      peer-focus:ring-blue-300 peer-focus:ring-4 peer-focus:outline-none
      peer-checked:after:border-white peer-checked:after:translate-x-full
      after:bg-white after:border-gray-300 after:absolute after:top-[2px]
      after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border
      after:transition-all after:content-['']
      peer-checked:bg-blue-600
    `}
    />
  </label>
)

const meta: Meta<typeof Switch> = {
  title: 'Core/Switch',
  component: Switch,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
