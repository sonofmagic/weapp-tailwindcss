import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import React from 'react'

const cardBase = `
  rounded-2xl border border-slate-200/60 bg-white/80
  p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]
  backdrop-blur
  dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_16px_50px_rgba(0,0,0,0.45)]
`

const txtFiles = [
  { label: 'llms.txt', path: '/llms.txt', desc: '全站文档链接索引（llmstxt.org 规范）' },
  { label: 'llms-full.txt', path: '/llms-full.txt', desc: '全量内容（适合离线/一次性载入）' },
  { label: 'llms-quickstart.txt', path: '/llms-quickstart.txt', desc: '入门、模板、AI 工作流合集' },
  { label: 'llms-api.txt', path: '/llms-api.txt', desc: '配置、API、迁移与常见问题' },
]

const markdownExamples = [
  { label: 'intro.md', path: '/intro.md', desc: '文档首页内容副本' },
  { label: 'quick-start/install.md', path: '/quick-start/install.md', desc: 'Tailwind CSS 3.x 安装指南' },
  { label: 'quick-start/v4/uni-app-vite.md', path: '/quick-start/v4/uni-app-vite.md', desc: 'Tailwind CSS 4.x / uni-app Vite 示例' },
  { label: 'tools/weapp-tw-cli.md', path: '/tools/weapp-tw-cli.md', desc: 'CLI 用法' },
  { label: 'ai/index.md', path: '/ai/index.md', desc: 'AI 生成小程序专题' },
]

function useBaseUrl() {
  const { siteConfig } = useDocusaurusContext()
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const siteUrl = (siteConfig?.url || browserOrigin || '').replace(/\/$/, '')
  const base = (siteConfig?.baseUrl || '/').replace(/\/$/, '')
  return `${siteUrl}${base === '/' ? '' : base}`
}

export default function LLMSPage() {
  const baseUrl = useBaseUrl()

  return (
    <Layout title="LLM / Skill 文档入口" description="为大模型准备的 llms 文档入口与 weapp-tailwindcss skill 安装说明">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className={`
            absolute left-[-10%] top-[-10%] size-[520px] rounded-full
            bg-sky-400/10 blur-3xl
          `}
          />
          <div className={`
            absolute right-[-12%] top-[5%] size-[480px] rounded-full
            bg-emerald-400/10 blur-3xl
          `}
          />
          <div className={`
            absolute bottom-[-25%] left-[20%] size-[540px] rounded-full
            bg-indigo-400/10 blur-3xl
          `}
          />
        </div>
        <div className="container relative z-[1] flex flex-col gap-8 py-12">
          <header
            className={`
              ${cardBase}
              flex flex-col gap-3 border-slate-200/70
            `}
          >
            <span className={`
              inline-flex w-fit items-center gap-2 rounded-full bg-sky-100 px-3
              py-1 text-xs font-semibold text-sky-700
              dark:bg-sky-900/40 dark:text-sky-200
            `}
            >
              🤖 AI 入口
            </span>
            <h1 className={`
              text-3xl font-bold
              md:text-4xl
            `}
            >
              LLM / Skill 文档入口
            </h1>
            <p className={`
              max-w-4xl text-slate-600
              dark:text-slate-200/80
            `}
            >
              构建后会生成一组便于大模型消费的文件：索引型 txt、全量 txt 以及去除 MDX import 的 Markdown 副本。
              本页同时包含 weapp-tailwindcss skill 安装指令，方便直接接入 AI 工作流。
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className={`
                  inline-flex items-center gap-2 rounded-full bg-slate-900 px-4
                  py-2 text-sm font-semibold text-white shadow-lg
                  shadow-sky-500/25 transition
                  hover:-translate-y-0.5 hover:bg-slate-800
                  dark:bg-white dark:text-slate-900
                  dark:hover:bg-slate-100
                `}
                href={`${baseUrl}/llms-quickstart.txt`}
                target="_blank"
                rel="noreferrer"
              >
                直接查看 llms-quickstart.txt
                <span aria-hidden className="text-lg">↗</span>
              </a>
              <a
                className={`
                  inline-flex items-center gap-2 rounded-full border
                  border-slate-300/70 bg-white px-4 py-2 text-sm font-semibold
                  text-slate-800 shadow-sm transition
                  hover:-translate-y-0.5 hover:border-slate-400
                  dark:border-white/15 dark:bg-slate-900 dark:text-white
                  dark:hover:border-white/30
                `}
                href={`${baseUrl}/llms-full.txt`}
                target="_blank"
                rel="noreferrer"
              >
                获取全量 llms-full.txt
                <span aria-hidden className="text-lg">↗</span>
              </a>
            </div>
          </header>

          <section className={`
            grid gap-6
            md:grid-cols-2
          `}
          >
            <div className={cardBase}>
              <h2 className="mb-3 text-xl font-semibold">可用 txt 文件</h2>
              <ul className="space-y-2">
                {txtFiles.map(item => (
                  <li
                    className={`
                      flex items-start gap-2 rounded-xl bg-slate-50/80 px-3 py-2
                      text-sm text-slate-700
                      dark:bg-white/5 dark:text-slate-200
                    `}
                    key={item.label}
                  >
                    <span className="mt-0.5 text-base">📄</span>
                    <div className="flex flex-col gap-0.5">
                      <a
                        className={`
                          font-semibold text-sky-600
                          hover:text-sky-500
                          dark:text-sky-300
                          dark:hover:text-sky-200
                        `}
                        href={`${baseUrl}${item.path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label}
                      </a>
                      <span className={`
                        text-xs text-slate-500
                        dark:text-slate-400
                      `}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cardBase}>
              <h2 className="mb-3 text-xl font-semibold">Markdown 副本（示例）</h2>
              <p className={`
                text-sm text-slate-600
                dark:text-slate-300
              `}
              >
                每篇文档都会生成纯 Markdown（路径同原始 docs，只是后缀改为 .md）。完整列表见
                {' '}
                <a
                  className={`
                    font-semibold text-sky-600
                    hover:text-sky-500
                    dark:text-sky-300
                    dark:hover:text-sky-200
                  `}
                  href={`${baseUrl}/llms.txt`}
                  target="_blank"
                  rel="noreferrer"
                >
                  llms.txt
                </a>
                。
              </p>
              <ul className="mt-3 space-y-2">
                {markdownExamples.map(item => (
                  <li
                    className={`
                      flex items-start gap-2 rounded-xl bg-slate-50/80 px-3 py-2
                      text-sm text-slate-700
                      dark:bg-white/5 dark:text-slate-200
                    `}
                    key={item.label}
                  >
                    <span className="mt-0.5 text-base">📘</span>
                    <div className="flex flex-col gap-0.5">
                      <a
                        className={`
                          font-semibold text-sky-600
                          hover:text-sky-500
                          dark:text-sky-300
                          dark:hover:text-sky-200
                        `}
                        href={`${baseUrl}${item.path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.label}
                      </a>
                      <span className={`
                        text-xs text-slate-500
                        dark:text-slate-400
                      `}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={cardBase}>
            <h2 className="mb-3 text-xl font-semibold">Skill 安装与使用</h2>
            <p className={`
              text-sm text-slate-600
              dark:text-slate-300
            `}
            >
              如果你希望 AI 在业务项目中按 weapp-tailwindcss 最佳实践输出配置与排障流程，可以先安装官方 skill：
            </p>
            <div className={`
              mt-3 rounded-xl border border-dashed border-slate-300/70
              bg-slate-50/70 p-3 text-sm text-slate-700
              dark:border-white/15 dark:bg-white/5 dark:text-slate-200
            `}
            >
              <p className="font-semibold">安装命令</p>
              <code className={`
                mt-2 block whitespace-pre-wrap rounded-lg bg-black/90 px-3 py-3
                text-xs text-emerald-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              `}
              >
                npx skills add sonofmagic/weapp-tailwindcss --skill weapp-tailwindcss
              </code>
              <p className="mt-3 font-semibold">查看可安装 Skill 列表</p>
              <code className={`
                mt-2 block whitespace-pre-wrap rounded-lg bg-black/90 px-3 py-3
                text-xs text-emerald-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              `}
              >
                npx skills add sonofmagic/weapp-tailwindcss --list
              </code>
              <p className="mt-3 font-semibold">本地仓库调试安装</p>
              <code className={`
                mt-2 block whitespace-pre-wrap rounded-lg bg-black/90 px-3 py-3
                text-xs text-emerald-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              `}
              >
                npx skills add . --skill weapp-tailwindcss
              </code>
            </div>

            <div className={`
              mt-4 grid gap-3
              md:grid-cols-2
            `}
            >
              <div className={`
                rounded-xl bg-slate-50/80 px-3 py-3 text-sm text-slate-700
                dark:bg-white/5 dark:text-slate-200
              `}
              >
                <p className="font-semibold">推荐提示词（新项目）</p>
                <code className={`
                  mt-2 block whitespace-pre-wrap rounded-lg bg-black/90 px-3
                  py-3 text-xs text-emerald-200
                  shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                `}
                >
                  我现在是 uni-app cli vue3 vite 项目，目标端是微信小程序 + H5。请按 weapp-tailwindcss skill 给我最小可用配置，输出需要包含安装命令、完整配置文件、验证步骤。
                </code>
              </div>
              <div className={`
                rounded-xl bg-slate-50/80 px-3 py-3 text-sm text-slate-700
                dark:bg-white/5 dark:text-slate-200
              `}
              >
                <p className="font-semibold">文档入口</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    <a
                      className={`
                        font-semibold text-sky-600
                        hover:text-sky-500
                        dark:text-sky-300
                        dark:hover:text-sky-200
                      `}
                      href={`${baseUrl}/docs/ai/basics/skill`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Skill（技能系统）文档
                    </a>
                  </li>
                  <li>
                    <a
                      className={`
                        font-semibold text-sky-600
                        hover:text-sky-500
                        dark:text-sky-300
                        dark:hover:text-sky-200
                      `}
                      href={`${baseUrl}/docs/ai/basics/skill-release`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Skill 发布与版本化
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className={cardBase}>
            <h2 className="mb-3 text-xl font-semibold">推荐加载顺序</h2>
            <div className={`
              grid gap-4
              md:grid-cols-2
            `}
            >
              <div className={`
                space-y-2 text-sm text-slate-700
                dark:text-slate-200
              `}
              >
                <p className="font-semibold">在线模式</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>
                    入门/模板/AI 工作流：加载
                    {' '}
                    <code>
                      {baseUrl}
                      /llms-quickstart.txt
                    </code>
                  </li>
                  <li>
                    配置、API、兼容与迁移：加载
                    {' '}
                    <code>
                      {baseUrl}
                      /llms-api.txt
                    </code>
                  </li>
                  <li>
                    需要导航：先读取
                    {' '}
                    <code>
                      {baseUrl}
                      /llms.txt
                    </code>
                    {' '}
                    拿到章节与链接
                  </li>
                  <li>
                    完整知识库：读取
                    {' '}
                    <code>
                      {baseUrl}
                      /llms-full.txt
                    </code>
                  </li>
                </ol>
              </div>
              <div className={`
                space-y-2 text-sm text-slate-700
                dark:text-slate-200
              `}
              >
                <p className="font-semibold">离线/批量模式</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>下载 llms-full.txt 或构建产出的 Markdown 文件整体打包。</li>
                  <li>向量化时可按章节拆分，使用 llms.txt 里的标题做元信息。</li>
                  <li>生成回答时引用具体链接或标题，便于追溯来源。</li>
                </ul>
              </div>
            </div>
            <div className={`
              mt-4 rounded-xl border border-dashed border-slate-300/70
              bg-slate-50/70 p-3 text-sm text-slate-700
              dark:border-white/15 dark:bg-white/5 dark:text-slate-200
            `}
            >
              <p className="font-semibold">示例提示词</p>
              <code className={`
                mt-2 block whitespace-pre-wrap rounded-lg bg-black/90 px-3 py-3
                text-xs text-emerald-200 shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              `}
              >
                {`你可以从 ${baseUrl}/llms-quickstart.txt 和 ${baseUrl}/llms-api.txt 读取 weapp-tailwindcss 的入门、配置和常见问题，回答时请引用对应链接。`}
              </code>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}
