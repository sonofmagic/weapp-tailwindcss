/**
 * Avatar 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { avatar } from '../../src/variants'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg'
  src?: string
  alt?: string
  children?: React.ReactNode
}

const Avatar: React.FC<AvatarProps> = ({ size = 'md', src, alt = 'Avatar', children }) => {
  const classes = avatar({ size })
  if (src) {
    return <img className={classes} src={src} alt={alt} />
  }
  return <div className={classes}>{children || '👤'}</div>
}

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    children: '👤',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">S</Avatar>
      <Avatar size="md">M</Avatar>
      <Avatar size="lg">L</Avatar>
    </div>
  ),
}
