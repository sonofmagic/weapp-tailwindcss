/**
 * Divider 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const Divider: React.FC = () => <hr className="border-gray-200 my-4" />

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Divider>

export const Default: Story = {}

export const InContent: Story = {
  render: () => (
    <div>
      <p>上方内容</p>
      <Divider />
      <p>下方内容</p>
    </div>
  ),
}
