import { useUiManagement } from '@site/src/features/ui-management/context'
import { navbarUiControls, navbarUiStorageKey } from '@site/src/features/ui-management/navbar'
import Layout from '@theme/Layout'

function UiManagementPageContent() {
  const {
    hasHydrated,
    navbar,
    resetNavbarSettings,
    setNavbarVisibility,
  } = useUiManagement()

  return (
    <main className="container py-12">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="
          rounded-3xl border border-slate-200/70 bg-white/85 p-8
          shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur
          dark:border-slate-700/70 dark:bg-slate-900/80
        "
        >
          <div className="
            flex flex-col gap-4
            sm:flex-row sm:items-start sm:justify-between
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
                  text-3xl font-semibold tracking-tight text-slate-900
                  dark:text-slate-50
                "
                >
                  导航栏图标管理
                </h1>
                <p className="
                  max-w-2xl text-sm leading-7 text-slate-600
                  dark:text-slate-300
                "
                >
                  当前先管理 navbar 中带 icon 的几个入口，每个项目都可以单独控制显示状态，修改后会自动持久化到
                  {' '}
                  <code>localStorage</code>
                  。
                </p>
              </div>
            </div>
            <button
              className={`
                inline-flex items-center justify-center rounded-full border
                border-slate-300 px-4 py-2 text-sm font-medium text-slate-700
                transition
                hover:-translate-y-0.5 hover:border-slate-400
                hover:text-slate-900
                dark:border-slate-600 dark:text-slate-200
                dark:hover:border-slate-400 dark:hover:text-white
              `}
              type="button"
              onClick={resetNavbarSettings}
            >
              恢复默认
            </button>
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

        <section className="grid gap-4">
          {navbarUiControls.map(control => (
            <label
              key={control.key}
              className={`
                flex cursor-pointer flex-col gap-4 rounded-3xl border
                border-slate-200/70 bg-white/80 p-6 transition
                hover:-translate-y-0.5 hover:border-sky-300
                hover:shadow-[0_16px_40px_rgba(14,165,233,0.12)]
                dark:border-slate-700/70 dark:bg-slate-900/75
                dark:hover:border-sky-500/60
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="
                    text-lg font-semibold text-slate-900
                    dark:text-slate-50
                  "
                  >
                    {control.label}
                  </div>
                  <p className="
                    m-0 text-sm leading-7 text-slate-600
                    dark:text-slate-300
                  "
                  >
                    {control.description}
                  </p>
                  <code className="
                    inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs
                    text-slate-500
                    dark:bg-slate-800 dark:text-slate-300
                  "
                  >
                    {control.className}
                  </code>
                </div>
                <span
                  className={`
                    inline-flex min-w-[76px] items-center justify-center
                    rounded-full px-3 py-1 text-xs font-semibold
                    ${navbar[control.key]
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
                  {navbar[control.key] ? '显示中' : '已隐藏'}
                </span>
              </div>

              <div className="
                flex items-center justify-between rounded-2xl border
                border-slate-200/80 px-4 py-3
                dark:border-slate-700
              "
              >
                <span className="
                  text-sm font-medium text-slate-700
                  dark:text-slate-200
                "
                >
                  显示该 navbar 项
                </span>
                <input
                  checked={navbar[control.key]}
                  className="h-5 w-5 cursor-pointer accent-sky-500"
                  type="checkbox"
                  onChange={event => setNavbarVisibility(control.key, event.currentTarget.checked)}
                />
              </div>
            </label>
          ))}
        </section>
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
