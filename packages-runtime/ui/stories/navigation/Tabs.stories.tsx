/**
 * Tabs 组件 Stories
 * @author ice breaker <1324318532@qq.com>
 */
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

interface TabsProps {
  tabs: string[]
  activeTab?: number
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab = 0 }) => (
  <div className="flex border-b">
    {tabs.map((tab, index) => (
      <button
        key={tab}
        type="button"
        className={`px-4 py-2 ${index === activeTab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
      >
        {tab}
      </button>
    ))}
  </div>
)

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  args: {
    tabs: ['Tab 1', 'Tab 2', 'Tab 3'],
    activeTab: 0,
  },
}
