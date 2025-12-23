/**
 * Card 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { card } from '../../src/variants'

interface CardProps {
  shadow?: 'none' | 'sm' | 'md'
  border?: 'muted' | 'strong'
  children?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ shadow = 'sm', border = 'muted', children }) => {
  const classes = card({ shadow, border })
  return <div className={classes}>{children}</div>
}

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: '卡片内容',
  },
}

export const Shadows: Story = {
  render: () => (
    <div className="space-y-4">
      <Card shadow="none">No Shadow</Card>
      <Card shadow="sm">Small Shadow</Card>
      <Card shadow="md">Medium Shadow</Card>
    </div>
  ),
}
