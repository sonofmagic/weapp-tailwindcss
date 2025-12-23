/**
 * Tag 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { tag } from '../../src/variants'

interface TagProps {
  tone?: 'default' | 'active' | 'danger' | 'ghost'
  children?: React.ReactNode
}

const Tag: React.FC<TagProps> = ({ tone = 'default', children }) => {
  const classes = tag({ tone })
  return <span className={classes}>{children}</span>
}

const meta: Meta<typeof Tag> = {
  title: 'Data Display/Tag',
  component: Tag,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tag>

export const Default: Story = {
  args: {
    children: 'Tag',
  },
}

export const Tones: Story = {
  render: () => (
    <div className="flex gap-2">
      <Tag tone="default">Default</Tag>
      <Tag tone="active">Active</Tag>
      <Tag tone="danger">Danger</Tag>
      <Tag tone="ghost">Ghost</Tag>
    </div>
  ),
}
