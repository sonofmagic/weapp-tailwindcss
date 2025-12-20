import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

import aiSidebar from './sidebars/ai'
import API from './sidebars/api'
import communitySidebar from './sidebars/community'
import issuesSidebar from './sidebars/issues'
import migrationsSidebar from './sidebars/migrations'
import optionsSidebar from './sidebars/options'
import tailwindcssSidebar from './sidebars/tailwindcss'
import tutorialSidebar from './sidebars/tutorial'

const sidebars: SidebarsConfig = {
  tutorialSidebar,
  optionsSidebar,
  issuesSidebar,
  API,
  aiSidebar,
  communitySidebar,
  migrationsSidebar,
  tailwindcssSidebar,
}

module.exports = sidebars
