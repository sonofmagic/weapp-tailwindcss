/**
 * Badge 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { badge } from '../../src/variants'

interface BadgeProps {
  tone?: 'primary' | 'soft' | 'outline' | 'success' | 'warning' | 'danger'
  children?: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ tone = 'primary', children }) => {
  const classes = badge({ tone })
  return <span className={classes}>{children}</span>
}

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Tones: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge tone="primary">Primary</Badge>
      <Badge tone="soft">Soft</Badge>
      <Badge tone="outline">Outline</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
}
