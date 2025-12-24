/**
 * Loading 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const Loading: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className={`
      animate-spin border-blue-600 h-8 w-8 rounded-full border-b-2
    `}
    />
  </div>
)

const meta: Meta<typeof Loading> = {
  title: 'Feedback/Loading',
  component: Loading,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Loading>

export const Default: Story = {}
