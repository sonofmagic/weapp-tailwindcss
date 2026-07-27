import { useUiManagement } from '@site/src/features/ui-management/context'
import { homepageUiControls } from '@site/src/features/ui-management/homepage'
import { navbarUiControls, navbarUiStorageKey } from '@site/src/features/ui-management/navbar'
import { useCurrentSiteLocale } from '@site/src/i18n/runtime'
import Layout from '@theme/Layout'

interface ControlMeta<TKey extends string> {
  className: string
  description: string
  key: TKey
  label: string
}

function ControlSection<TKey extends string>({
  controls,
  defaultButtonLabel,
  hiddenLabel,
  onReset,
  onToggle,
  visibleLabel,
  title,
  values,
}: {
  controls: Array<ControlMeta<TKey>>
  defaultButtonLabel: string
  hiddenLabel: string
  onReset: () => void
  onToggle: (key: TKey, visible: boolean) => void
  title: string
  values: Record<TKey, boolean>
  visibleLabel: string
}) {
  return (
    <section className="
      rounded-3xl border border-slate-200/70 bg-white/80 p-5
      shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur
      dark:border-slate-700/70 dark:bg-slate-900/75
    "
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="
          m-0 text-base font-semibold text-slate-900
          dark:text-slate-50
        "
        >
          {title}
        </h2>
        <button
          className="
            inline-flex items-center justify-center rounded-full border
            border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700
            transition
            hover:border-slate-400 hover:text-slate-900
            dark:border-slate-600 dark:text-slate-200
            dark:hover:border-slate-400
          "
          type="button"
          onClick={onReset}
        >
          {defaultButtonLabel}
        </button>
      </div>
      <div className="
        grid gap-3
        lg:grid-cols-2
      "
      >
        {controls.map(control => (
          <label
            key={control.key}
            className="
              flex cursor-pointer items-center gap-3 rounded-2xl border
              border-slate-200/80 px-3 py-3 transition
              hover:border-sky-300 hover:bg-sky-50/40
              dark:border-slate-700
              dark:hover:border-sky-500/50 dark:hover:bg-slate-800/70
            "
          >
            <input
              checked={values[control.key]}
              className="h-4 w-4 shrink-0 cursor-pointer accent-sky-500"
              type="checkbox"
              onChange={event => onToggle(control.key, event.currentTarget.checked)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="
                  truncate text-sm font-semibold text-slate-900
                  dark:text-slate-50
                "
                >
                  {control.label}
                </div>
                <span
                  className={`
                    inline-flex shrink-0 items-center justify-center
                    rounded-full px-2 py-0.5 text-[11px] font-semibold
                    ${values[control.key]
            ? `
              bg-emerald-500/15 text-emerald-600
              dark:text-emerald-300
            `
            : `
              bg-slate-200/80 text-slate-500
              dark:bg-slate-800 dark:text-slate-300
            `}
                    `}
                >
                  {values[control.key] ? visibleLabel : hiddenLabel}
                </span>
              </div>
              <p className="
                m-0 mt-1 line-clamp-2 text-xs leading-5 text-slate-600
                dark:text-slate-300
              "
              >
                {control.description}
              </p>
              <code className="
                mt-2 inline-flex max-w-full overflow-hidden text-ellipsis
                whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5
                text-[11px] text-slate-500
                dark:bg-slate-800 dark:text-slate-300
              "
              >
                {control.className}
              </code>
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}

function UiManagementPageContent() {
  const locale = useCurrentSiteLocale()
  const {
    hasHydrated,
    homepage,
    navbar,
    resetHomepageSettings,
    resetNavbarSettings,
    setHomepageVisibility,
    setNavbarVisibility,
  } = useUiManagement()
  const copy = locale === 'en'
    ? {
        badge: 'UI Management',
        title: 'UI management',
        description: 'Control the key navbar and homepage hero entry points. The panel now uses a more compact grouped layout so we can keep expanding options later, and state is persisted automatically in ',
        storageKeyLabel: 'Storage key:',
        hydrated: 'Loaded the current state from local settings.',
        hydrating: 'Reading local settings.',
        navbarTitle: 'Navbar',
        homepageTitle: 'Homepage Hero',
        defaultButtonLabel: 'Reset defaults',
        visibleLabel: 'Visible',
        hiddenLabel: 'Hidden',
        pageTitle: 'UI management',
        pageDescription: 'Manage website UI toggles and persist them to localStorage.',
        sentenceEnd: '.',
        navbarControls: {
          atomgit: { label: 'AtomGit icon', description: 'Show or hide the AtomGit link in the navbar.' },
          github: { label: 'GitHub icon', description: 'Show or hide the GitHub link in the navbar.' },
          weappVite: { label: 'Weapp-vite entry', description: 'Show or hide the Weapp-vite entry in the navbar.' },
        },
        homepageControls: {
          heroContent: { label: 'Hero content', description: 'Show or hide the main content block in the first screen.' },
          heroFeatureGrid: { label: 'Core capability area', description: 'Show or hide the core capability and pipeline explanation area.' },
          gstarBadge: { label: 'G-Star badge', description: 'Show or hide the G-Star certification badge on the hero title.' },
          heroBadge: { label: 'Hero top badge', description: 'Show or hide the Tailwind CSS 4 generation badge next to the logo.' },
          heroTitle: { label: 'Hero title', description: 'Show or hide the homepage title weapp-tailwindcss.' },
          heroSubtitlePrimary: { label: 'Hero subtitle 1', description: 'Show or hide the primary hero subtitle line.' },
          heroSubtitleSecondary: { label: 'Hero subtitle 2', description: 'Keep the legacy secondary subtitle toggle for compatibility.' },
          primaryCta: { label: 'Primary CTA', description: 'Show or hide the main setup CTA button.' },
          aiEntry: { label: 'AI entry', description: 'Show or hide the AI entry button in the hero area.' },
          communityEntry: { label: 'Community entry', description: 'Show or hide the community entry in the docs entry section.' },
          githubBadge: { label: 'GitHub star badge', description: 'Show or hide the GitHub Star badge in the support matrix.' },
          npmVersionBadge: { label: 'npm version badge', description: 'Show or hide the latest npm version badge in the support matrix.' },
          platformTags: { label: 'Support matrix', description: 'Show or hide the platform matrix and route links below the hero.' },
          buildToolsCard: { label: 'Builder card', description: 'Show or hide the large builder compatibility card.' },
          versionsCard: { label: 'Version card', description: 'Show or hide the multi-version support capability card.' },
          frameworksCard: { label: 'Framework card', description: 'Show or hide the framework and native support capability card.' },
        },
      }
    : {
        badge: 'UI Management',
        title: 'UI 管理',
        description: '当前支持 navbar 与首页 hero 区域的关键入口开关。面板已经改成更紧凑的分组结构，方便后续继续扩更多配置项，状态会自动持久化到 ',
        storageKeyLabel: '存储 key：',
        hydrated: '已从本地配置加载当前状态。',
        hydrating: '正在读取本地配置。',
        navbarTitle: 'Navbar',
        homepageTitle: 'Homepage Hero',
        defaultButtonLabel: '恢复默认',
        visibleLabel: '显示',
        hiddenLabel: '隐藏',
        pageTitle: 'UI 管理',
        pageDescription: '管理站点 UI 开关，并持久化到 localStorage。',
        sentenceEnd: '。',
        navbarControls: {
          atomgit: { label: 'AtomGit 图标', description: '控制导航栏中的 AtomGit 图标链接是否显示。' },
          github: { label: 'GitHub 图标', description: '控制导航栏中的 GitHub 图标链接是否显示。' },
          weappVite: { label: 'Weapp-vite 入口', description: '控制导航栏中的 Weapp-vite 图标入口是否显示。' },
        },
        homepageControls: {
          heroContent: { label: 'Hero 主区', description: '控制首页首屏主内容区域整体显示。' },
          heroFeatureGrid: { label: '核心能力区', description: '控制首页核心能力与构建链路说明区域整体显示。' },
          gstarBadge: { label: 'G-Star 角标', description: '控制首页标题区域右上角的 G-Star 认证角标。' },
          heroBadge: { label: 'Hero 顶部标签', description: '控制 logo 右侧的 Tailwind CSS 4 生成链路标签。' },
          heroTitle: { label: 'Hero 主标题', description: '控制首页主标题 weapp-tailwindcss。' },
          heroSubtitlePrimary: { label: 'Hero 副标题一', description: '控制“Web 与小程序两端样式”这一行文案。' },
          heroSubtitleSecondary: { label: 'Hero 副标题二', description: '保留旧版副文案开关，用于兼容 UI 管理配置。' },
          primaryCta: { label: '首页主按钮', description: '控制“开始接入”主 CTA。' },
          aiEntry: { label: 'AI 文档入口', description: '控制首页 hero 区域的 AI 学习入口按钮。' },
          communityEntry: { label: '技术交流群入口', description: '控制首页文档入口区域的技术交流群入口。' },
          githubBadge: { label: 'GitHub Star 徽章', description: '控制支持矩阵区域的 GitHub Star 徽章。' },
          npmVersionBadge: { label: 'npm 版本徽章', description: '控制支持矩阵区域的 npm 最新版本徽章。' },
          platformTags: { label: '支持与接入路线区', description: '控制首页首屏下方的支持矩阵与接入路线入口。' },
          buildToolsCard: { label: '构建工具卡片', description: '控制“多构建工具适配”展示卡片。' },
          versionsCard: { label: '版本矩阵卡片', description: '控制 Tailwind 多版本支持展示卡片。' },
          frameworksCard: { label: '生态支持卡片', description: '控制主流框架与原生开发支持展示卡片。' },
        },
      }
  const localizedNavbarControls = navbarUiControls.map(control => ({
    ...control,
    ...copy.navbarControls[control.key],
  }))
  const localizedHomepageControls = homepageUiControls.map(control => ({
    ...control,
    ...copy.homepageControls[control.key],
  }))

  return (
    <main className="container py-12">
      <section className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="
          rounded-3xl border border-slate-200/70 bg-white/85 p-6
          shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur
          dark:border-slate-700/70 dark:bg-slate-900/80
        "
        >
          <div className="space-y-3">
            <span className="
              inline-flex w-fit items-center rounded-full border
              border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold
              uppercase tracking-[0.18em] text-sky-600
              dark:text-sky-300
            "
            >
              {copy.badge}
            </span>
            <div className="space-y-2">
              <h1 className="
                text-2xl font-semibold tracking-tight text-slate-900
                dark:text-slate-50
              "
              >
                {copy.title}
              </h1>
              <p className="
                max-w-3xl text-sm leading-6 text-slate-600
                dark:text-slate-300
              "
              >
                {copy.description}
                {' '}
                <code>localStorage</code>
                {copy.sentenceEnd}
              </p>
            </div>
          </div>

          <div className="
            mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3
            text-sm text-slate-600
            dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300
          "
          >
            <div>
              {copy.storageKeyLabel}
              <code>{navbarUiStorageKey}</code>
            </div>
            <div>{hasHydrated ? copy.hydrated : copy.hydrating}</div>
          </div>
        </div>

        <ControlSection
          controls={localizedNavbarControls}
          defaultButtonLabel={copy.defaultButtonLabel}
          hiddenLabel={copy.hiddenLabel}
          title={copy.navbarTitle}
          values={navbar}
          visibleLabel={copy.visibleLabel}
          onReset={resetNavbarSettings}
          onToggle={(key, visible) => setNavbarVisibility(key, visible)}
        />
        <ControlSection
          controls={localizedHomepageControls}
          defaultButtonLabel={copy.defaultButtonLabel}
          hiddenLabel={copy.hiddenLabel}
          title={copy.homepageTitle}
          values={homepage}
          visibleLabel={copy.visibleLabel}
          onReset={resetHomepageSettings}
          onToggle={(key, visible) => setHomepageVisibility(key, visible)}
        />
      </section>
    </main>
  )
}

export default function UiManagementPage() {
  const locale = useCurrentSiteLocale()
  const copy = locale === 'en'
    ? {
        title: 'UI management',
        description: 'Manage website UI toggles and persist them to localStorage.',
      }
    : {
        title: 'UI 管理',
        description: '管理站点 UI 开关，并持久化到 localStorage。',
      }

  return (
    <Layout title={copy.title} description={copy.description}>
      <UiManagementPageContent />
    </Layout>
  )
}
