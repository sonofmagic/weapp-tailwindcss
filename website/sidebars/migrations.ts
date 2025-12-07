import type { SidebarConfig } from './types'

/**
 * @description 迁移指南
 */
const migrationsSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'migrations/v3',
  },
  {
    type: 'doc',
    id: 'migrations/v2',
  },
  {
    type: 'doc',
    id: 'migrations/v1',
  },
  {
    type: 'doc',
    label: '旧有uni-app项目升级webpack5',
    id: 'upgrade/uni-app',
  },
  {
    type: 'doc',
    label: 'What\'s new in v2',
    id: 'releases/v2',
  },
]

export default migrationsSidebar
