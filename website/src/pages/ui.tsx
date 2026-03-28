import type { HomepageUiControlKey } from '@site/src/features/ui-management/homepage'
import type { NavbarUiControlKey } from '@site/src/features/ui-management/navbar'
import { useUiManagement } from '@site/src/features/ui-management/context'
import { homepageUiControls } from '@site/src/features/ui-management/homepage'
import { navbarUiControls, navbarUiStorageKey } from '@site/src/features/ui-management/navbar'
import Layout from '@theme/Layout'

interface ControlMeta {
  className: string
  description: string
  key: string
  label: string
}

function ControlSection({
  controls,
  onReset,
  onToggle,
  title,
  values,
}: {
  controls: ControlMeta[]
  onReset: () => void
  onToggle: (key: string, visible: boolean) => void
  title: string
  values: Record<string, boolean>
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
          恢复默认
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
                  {values[control.key] ? '显示' : '隐藏'}
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
  const {
    hasHydrated,
    homepage,
    navbar,
    resetHomepageSettings,
    resetNavbarSettings,
    setHomepageVisibility,
    setNavbarVisibility,
  } = useUiManagement()

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
              UI Management
            </span>
            <div className="space-y-2">
              <h1 className="
                text-2xl font-semibold tracking-tight text-slate-900
                dark:text-slate-50
              "
              >
                UI 管理
              </h1>
              <p className="
                max-w-3xl text-sm leading-6 text-slate-600
                dark:text-slate-300
              "
              >
                当前支持 navbar 与首页 hero 区域的关键入口开关。面板已经改成更紧凑的分组结构，方便后续继续扩更多配置项，状态会自动持久化到
                {' '}
                <code>localStorage</code>
                。
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
              存储 key：
              <code>{navbarUiStorageKey}</code>
            </div>
            <div>{hasHydrated ? '已从本地配置加载当前状态。' : '正在读取本地配置。'}</div>
          </div>
        </div>

        <ControlSection
          controls={navbarUiControls}
          title="Navbar"
          values={navbar}
          onReset={resetNavbarSettings}
          onToggle={(key, visible) => setNavbarVisibility(key as NavbarUiControlKey, visible)}
        />
        <ControlSection
          controls={homepageUiControls}
          title="Homepage Hero"
          values={homepage}
          onReset={resetHomepageSettings}
          onToggle={(key, visible) => setHomepageVisibility(key as HomepageUiControlKey, visible)}
        />
      </section>
    </main>
  )
}

export default function UiManagementPage() {
  return (
    <Layout title="UI 管理" description="管理站点 UI 开关，并持久化到 localStorage。">
      <UiManagementPageContent />
    </Layout>
  )
}
