export type HomepageUiControlKey
  = | 'heroContent'
    | 'heroFeatureGrid'
    | 'gstarBadge'
    | 'heroBadge'
    | 'heroTitle'
    | 'heroSubtitlePrimary'
    | 'heroSubtitleSecondary'
    | 'primaryCta'
    | 'aiEntry'
    | 'communityEntry'
    | 'githubBadge'
    | 'npmVersionBadge'
    | 'platformTags'
    | 'buildToolsCard'
    | 'versionsCard'
    | 'frameworksCard'

export interface HomepageUiSettings {
  heroContent: boolean
  heroFeatureGrid: boolean
  gstarBadge: boolean
  heroBadge: boolean
  heroTitle: boolean
  heroSubtitlePrimary: boolean
  heroSubtitleSecondary: boolean
  primaryCta: boolean
  aiEntry: boolean
  communityEntry: boolean
  githubBadge: boolean
  npmVersionBadge: boolean
  platformTags: boolean
  buildToolsCard: boolean
  versionsCard: boolean
  frameworksCard: boolean
}

export interface HomepageUiControlMeta {
  key: HomepageUiControlKey
  label: string
  description: string
  className: string
  htmlAttribute: string
}

export const defaultHomepageUiSettings: HomepageUiSettings = {
  heroContent: true,
  heroFeatureGrid: true,
  gstarBadge: true,
  heroBadge: true,
  heroTitle: true,
  heroSubtitlePrimary: true,
  heroSubtitleSecondary: true,
  primaryCta: true,
  aiEntry: true,
  communityEntry: true,
  githubBadge: true,
  npmVersionBadge: true,
  platformTags: true,
  buildToolsCard: true,
  versionsCard: true,
  frameworksCard: true,
}

export const homepageUiControls: HomepageUiControlMeta[] = [
  {
    key: 'heroContent',
    label: 'Hero 主区',
    description: '控制首页首屏主内容区域整体显示。',
    className: 'ui-homepage-hero-content',
    htmlAttribute: 'data-ui-homepage-hero-content',
  },
  {
    key: 'heroFeatureGrid',
    label: 'Hero 下方卡片区',
    description: '控制首页首屏下方三张展示卡片区域整体显示。',
    className: 'ui-homepage-hero-feature-grid',
    htmlAttribute: 'data-ui-homepage-hero-feature-grid',
  },
  {
    key: 'gstarBadge',
    label: 'G-Star 角标',
    description: '控制首页标题区域右上角的 G-Star 认证角标。',
    className: 'ui-homepage-gstar-badge',
    htmlAttribute: 'data-ui-homepage-gstar-badge',
  },
  {
    key: 'heroBadge',
    label: 'Hero 顶部标签',
    description: '控制 logo 右侧的“小程序 · Tailwind 精准适配”标签。',
    className: 'ui-homepage-hero-badge',
    htmlAttribute: 'data-ui-homepage-hero-badge',
  },
  {
    key: 'heroTitle',
    label: 'Hero 主标题',
    description: '控制首页主标题 weapp-tailwindcss。',
    className: 'ui-homepage-hero-title',
    htmlAttribute: 'data-ui-homepage-hero-title',
  },
  {
    key: 'heroSubtitlePrimary',
    label: 'Hero 副标题一',
    description: '控制“降低团队维护成本，加速交付节奏的”这一行文案。',
    className: 'ui-homepage-hero-subtitle-primary',
    htmlAttribute: 'data-ui-homepage-hero-subtitle-primary',
  },
  {
    key: 'heroSubtitleSecondary',
    label: 'Hero 副标题二',
    description: '控制“小程序使用 tailwindcss 一站式解决方案”这一行文案。',
    className: 'ui-homepage-hero-subtitle-secondary',
    htmlAttribute: 'data-ui-homepage-hero-subtitle-secondary',
  },
  {
    key: 'primaryCta',
    label: '首页主按钮',
    description: '控制“立即开始体验”主 CTA。',
    className: 'ui-homepage-primary-cta',
    htmlAttribute: 'data-ui-homepage-primary-cta',
  },
  {
    key: 'aiEntry',
    label: 'AI 学习入口',
    description: '控制首页 hero 区域的 AI 学习入口按钮。',
    className: 'ui-homepage-ai-entry',
    htmlAttribute: 'data-ui-homepage-ai-entry',
  },
  {
    key: 'communityEntry',
    label: '技术交流群入口',
    description: '控制首页 hero 区域的技术交流群按钮。',
    className: 'ui-homepage-community-entry',
    htmlAttribute: 'data-ui-homepage-community-entry',
  },
  {
    key: 'githubBadge',
    label: 'GitHub Star 徽章',
    description: '控制首页 hero 区域的 GitHub Star 徽章。',
    className: 'ui-homepage-github-badge',
    htmlAttribute: 'data-ui-homepage-github-badge',
  },
  {
    key: 'npmVersionBadge',
    label: 'npm 版本徽章',
    description: '控制首页 hero 区域的 npm 最新版本徽章。',
    className: 'ui-homepage-npm-version-badge',
    htmlAttribute: 'data-ui-homepage-npm-version-badge',
  },
  {
    key: 'platformTags',
    label: '平台图标区',
    description: '控制首页 hero 区域底部的平台支持图标。',
    className: 'ui-homepage-platform-tags',
    htmlAttribute: 'data-ui-homepage-platform-tags',
  },
  {
    key: 'buildToolsCard',
    label: '构建工具卡片',
    description: '控制“多构建工具适配”展示卡片。',
    className: 'ui-homepage-build-tools-card',
    htmlAttribute: 'data-ui-homepage-build-tools-card',
  },
  {
    key: 'versionsCard',
    label: '版本矩阵卡片',
    description: '控制 Tailwind 多版本支持展示卡片。',
    className: 'ui-homepage-versions-card',
    htmlAttribute: 'data-ui-homepage-versions-card',
  },
  {
    key: 'frameworksCard',
    label: '生态支持卡片',
    description: '控制主流框架与原生开发支持展示卡片。',
    className: 'ui-homepage-frameworks-card',
    htmlAttribute: 'data-ui-homepage-frameworks-card',
  },
]

export function mergeHomepageUiSettings(value: unknown): HomepageUiSettings {
  if (!value || typeof value !== 'object') {
    return defaultHomepageUiSettings
  }

  const candidate = value as Partial<Record<HomepageUiControlKey, unknown>>

  return {
    heroContent: typeof candidate.heroContent === 'boolean' ? candidate.heroContent : defaultHomepageUiSettings.heroContent,
    heroFeatureGrid: typeof candidate.heroFeatureGrid === 'boolean' ? candidate.heroFeatureGrid : defaultHomepageUiSettings.heroFeatureGrid,
    gstarBadge: typeof candidate.gstarBadge === 'boolean' ? candidate.gstarBadge : defaultHomepageUiSettings.gstarBadge,
    heroBadge: typeof candidate.heroBadge === 'boolean' ? candidate.heroBadge : defaultHomepageUiSettings.heroBadge,
    heroTitle: typeof candidate.heroTitle === 'boolean' ? candidate.heroTitle : defaultHomepageUiSettings.heroTitle,
    heroSubtitlePrimary: typeof candidate.heroSubtitlePrimary === 'boolean' ? candidate.heroSubtitlePrimary : defaultHomepageUiSettings.heroSubtitlePrimary,
    heroSubtitleSecondary: typeof candidate.heroSubtitleSecondary === 'boolean' ? candidate.heroSubtitleSecondary : defaultHomepageUiSettings.heroSubtitleSecondary,
    primaryCta: typeof candidate.primaryCta === 'boolean' ? candidate.primaryCta : defaultHomepageUiSettings.primaryCta,
    aiEntry: typeof candidate.aiEntry === 'boolean' ? candidate.aiEntry : defaultHomepageUiSettings.aiEntry,
    communityEntry: typeof candidate.communityEntry === 'boolean' ? candidate.communityEntry : defaultHomepageUiSettings.communityEntry,
    githubBadge: typeof candidate.githubBadge === 'boolean' ? candidate.githubBadge : defaultHomepageUiSettings.githubBadge,
    npmVersionBadge: typeof candidate.npmVersionBadge === 'boolean' ? candidate.npmVersionBadge : defaultHomepageUiSettings.npmVersionBadge,
    platformTags: typeof candidate.platformTags === 'boolean' ? candidate.platformTags : defaultHomepageUiSettings.platformTags,
    buildToolsCard: typeof candidate.buildToolsCard === 'boolean' ? candidate.buildToolsCard : defaultHomepageUiSettings.buildToolsCard,
    versionsCard: typeof candidate.versionsCard === 'boolean' ? candidate.versionsCard : defaultHomepageUiSettings.versionsCard,
    frameworksCard: typeof candidate.frameworksCard === 'boolean' ? candidate.frameworksCard : defaultHomepageUiSettings.frameworksCard,
  }
}

export function isHomepageItemVisible(
  key: HomepageUiControlKey,
  settings: HomepageUiSettings,
): boolean {
  return settings[key]
}

export function applyHomepageUiSettingsToDocument(settings: HomepageUiSettings) {
  if (typeof document === 'undefined') {
    return
  }

  for (const control of homepageUiControls) {
    if (settings[control.key]) {
      document.documentElement.removeAttribute(control.htmlAttribute)
    }
    else {
      document.documentElement.setAttribute(control.htmlAttribute, 'hidden')
    }
  }
}
