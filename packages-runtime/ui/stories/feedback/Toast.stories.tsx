/**
 * Toast 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { toast } from '../../src/variants'

interface ToastProps {
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
  children?: React.ReactNode
}

const Toast: React.FC<ToastProps> = ({ tone = 'neutral', children }) => {
  const classes = toast({ tone })
  return <div className={classes}>{children}</div>
}

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    children: '这是一条提示',
  },
}

export const Tones: Story = {
  render: () => (
    <div className="space-y-2">
      <Toast tone="neutral">普通提示</Toast>
      <Toast tone="success">成功提示</Toast>
      <Toast tone="warning">警告提示</Toast>
      <Toast tone="danger">错误提示</Toast>
    </div>
  ),
}
