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
  {
    type: 'category',
    label: '📚 AI 基础知识',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: '核心概念',
        collapsed: false,
        items: [
          {
            type: 'doc',
            id: 'ai/basics/token',
            label: 'Token（词元）',
          },
          {
            type: 'doc',
            id: 'ai/basics/context-window',
            label: '上下文窗口（Context Window）',
          },
          {
            type: 'doc',
            id: 'ai/basics/llms-txt',
            label: 'LLMs.txt（LLM 友好文档）',
          },
        ],
      },
      {
        type: 'category',
        label: '协议与工具',
        collapsed: false,
        items: [
          {
            type: 'doc',
            id: 'ai/basics/mcp',
            label: 'MCP（Model Context Protocol）',
          },
          {
            type: 'doc',
            id: 'ai/basics/skill',
            label: 'Skill（技能系统）',
          },
          {
            type: 'doc',
            id: 'ai/basics/agent',
            label: 'AI Agent（智能体）',
          },
          {
            type: 'doc',
            id: 'ai/basics/rag',
            label: 'RAG（检索增强生成）',
          },
          {
            type: 'doc',
            id: 'ai/basics/power',
            label: 'Power（规范驱动编程能力）',
          },
        ],
      },
      {
        type: 'category',
        label: '安全与隔离',
        collapsed: false,
        items: [
          {
            type: 'doc',
            id: 'ai/basics/ai-sandbox',
            label: 'AI 沙箱（Sandbox）',
          },
        ],
      },
      {
        type: 'category',
        label: '开发方法',
        collapsed: false,
        items: [
          {
            type: 'doc',
            id: 'ai/basics/spec-driven-development',
            label: 'Spec-Driven Development（规范驱动开发）',
          },
          {
            type: 'doc',
            id: 'ai/basics/vibe-coding',
            label: 'Vibe Coding（直觉编程）',
          },
          {
            type: 'doc',
            id: 'ai/basics/prompt-engineering',
            label: 'Prompt Engineering（提示词工程）',
          },
        ],
      },
    ],
  },
  {
    type: 'category',
    label: '📊 模型对比',
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'ai/ai-coding-deployment-guide',
        label: 'AI 编程助手落地实施方案',
      },
      {
        type: 'doc',
        id: 'ai/international-ai-models-comparison',
        label: '国外编程模型/工具选型建议',
      },
      {
        type: 'doc',
        id: 'ai/qoder-vs-glm47-cursor-claude-comparison',
        label: '国内编程模型/工具选型建议',
      },
    ],
  },
]

export default aiSidebar
