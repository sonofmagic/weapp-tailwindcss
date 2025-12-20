import type { SidebarConfig } from './types'

const aiSidebar: SidebarConfig = [
  {
    type: 'category',
    label: '🤖 AI 工作流',
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'ai/index',
        label: 'AI 生成小程序代码',
      },
      {
        type: 'doc',
        id: 'ai/ai-programming-plan',
        label: 'AI 编程方案对比',
      },
      {
        type: 'doc',
        id: 'ai/llms',
        label: 'LLM 友好文档',
      },
    ],
  },
]

export default aiSidebar
