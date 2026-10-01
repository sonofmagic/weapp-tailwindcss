# 主仓库组织迁移记录

## 当前状态

2026-10-02 已将主仓库从 `sonofmagic/weapp-tailwindcss` 转移到 [weapp-tailwindcss/weapp-tailwindcss](https://github.com/weapp-tailwindcss/weapp-tailwindcss)。仓库名称与公开属性、npm 包名及所有权、文档域名和独立模板仓库保持不变。

代码准备基线为 `0bfb23912f59cfaf0b58b00353d7f08122d1f8f1`。维护者本轮要求开始迁移，已采用“先转移 GitHub、保持 npm 发布暂停”的分阶段交付。**GitHub Transfer 已完成；发布接通尚未完成。** npm 的实际信任配置和发布 Token 对组织仓库的访问权尚未核实，Cloudflare Git 集成与 Codecov 的组织授权也尚未核实。

Release 工作流在转移前停用，当前保持 `disabled_manually`。Sync Templates 原本即为 `disabled_manually`，保持原状。PR #1266 保存地址和元数据变更，待后台条件具备后经正常审核合并；不得直接触发 npm 发布。

### 转移验收

- 仓库 ID `448897619`、默认分支 `main`、1863 个 Star、103 个 Fork 保持不变。
- 10 个开放 PR 的编号、ID、head SHA、源/目标分支及草稿状态与切换前一致。
- 1221 条 Issue/PR 的编号、状态和指派逐项一致，268 条带指派记录保留。
- 1037 个 GitHub Release 的 ID、tag 和草稿状态一致；2549 条分支/标签引用及 SHA 一致。
- `main` 分支保护语义、rulesets、环境配置、webhook、Secret 名称和变量名称保持不变。
- Actions 默认权限按组织策略变为 `read`，允许创建及批准 PR 的设置保持开启。已检查所有工作流：权限均在 workflow 或 job 层显式声明，因此保留组织默认读权限。
- 本地共享 Git 配置中的 origin 已更新为 `git@github.com:weapp-tailwindcss/weapp-tailwindcss.git`，主 checkout 与附属 worktree 均使用新地址。新地址可读取全部分支/标签，旧地址可重定向读取 `main`。
- 转移刚完成时 SSH 曾短暂返回 `Repository ... is disabled`；随后 API 显示 `disabled: false`，SSH 读取恢复。迁移过程中的首次 Issue 分页清单不完整，稳定后按创建时间排序重新查询，全部 1221 条匹配；没有据临时列表重建或删除任何 Issue。

## 已准备的内容

- 30 个非私有包的 `repository`、`bugs` 与中文 patch change intent，供迁移后的计划内发布更新 npm 元数据。
- 根 README、包 README、文档站导航、结构化数据、贡献与源码入口、API 文档生成器、showcase 脚本和 Star 徽章的主仓库地址。
- 首页 Star 查询及 sessionStorage 使用新的 owner；浏览器回归验证旧 owner 缓存不会覆盖新仓库数据。
- 中英文 GEO 索引由文档构建重新生成。历史 Issue/PR/commit 引用、CHANGELOG、作者与赞助入口、AtomGit 镜像及其他独立仓库保持原有身份。
- 最初准备快照保存在本工作树忽略目录 `node_modules/.cache/organization-transfer/pre-transfer.json`，包含仓库身份、分支保护、rulesets、协作者、环境、webhook、Secret 名称、变量名称、工作流状态、组织策略、Pages 和 Issue 指派；不包含 Secret 值。本次切换前后已另存 `cutover-before.json` 与 `cutover-after.json`，用于上方逐项验收。

本轮没有修改 demo 页面或样式输出，因此不需要更新 demo static 基线；文档站索引已随构建更新。

## 后台放行清单

### GitHub

- 转移前已核实原仓库管理员与目标组织 Owner 身份，并确认目标组织无同名仓库；转移后 `sonofmagic` 保持仓库管理员。
- 最新读取的组织 Actions 默认权限为 `read`，允许 Actions 创建及批准 PR。Release 已显式申请 `contents: write`、`pull-requests: write` 和 `id-token: write`，不需要为了迁移全局扩大默认权限。
- 原仓库 `main` 要求一次审核、严格的 `SEO Quality Gate`，禁止强推与删除。转移后已逐项对照快照，不绕过审核合并。
- 已记录 268 个带指派的 Issue/PR，指派对象均为组织 Owner `sonofmagic`。
- 迁移前 Release 为 `active`，现已停用等待发布接通；Sync Templates 原本为 `disabled_manually`。恢复时按快照恢复，不能将原本停用的模板同步自动启用。
- 最新 Release run `36843628878` 已失败，发布依赖协议修复 PR #1261 尚未合并，发布 PR #1255 仍需重新生成。这些 PR 已随仓库保留，必须在恢复发布前解决既有发布问题。
- 当前工作流选用 `REPOCTL_RELEASE_TOKEN`、`CHANGESETS_RELEASE_TOKEN` 或 `github.token`。现有 Secret 清单含后者对应的 `CHANGESETS_RELEASE_TOKEN`，但不能从 Secret 名称推断其权限；需在授权后台核实它对目标组织仓库的访问权。不要复制或展示 Token 值。

### npm Trusted Publisher

每个发布包分别核实以下字段，不能只核对 `weapp-tailwindcss` 主包：

| 字段 | 迁移后目标 |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `weapp-tailwindcss` |
| Repository | `weapp-tailwindcss` |
| Workflow filename | `release.yml` |
| Environment | 当前工作流未声明 environment，配置应与其一致 |
| 发布权限 | 满足 repoctl 使用的直接发布及 dist-tag 操作；保留已有必要权限 |
| 运行环境 | GitHub-hosted runner、Node 24、OIDC、provenance |

本机 Chrome 原生入口多次返回 `timeoutReached`，实际迁移本轮复查仍未恢复；备用浏览器入口此前返回 `Codex auth token is unavailable`，尚未进入 npm 后台。以下各包均不能标记为已配置：

| 包 | Trusted Publisher 核实状态 |
| --- | --- |
| `@weapp-tailwindcss/cli` | 待后台核实 |
| `@weapp-tailwindcss/cn` | 待后台核实 |
| `@weapp-tailwindcss/cva` | 待后台核实 |
| `@weapp-tailwindcss/debug-uni-app-x` | 待后台核实 |
| `@weapp-tailwindcss/engine` | 待后台核实 |
| `@weapp-tailwindcss/escape` | 待后台核实 |
| `@weapp-tailwindcss/experimental` | 待后台核实 |
| `@weapp-tailwindcss/hbuilderx-runner` | 待后台核实 |
| `@weapp-tailwindcss/init` | 待后台核实 |
| `@weapp-tailwindcss/logger` | 待后台核实 |
| `@weapp-tailwindcss/lynx` | 待后台核实 |
| `@weapp-tailwindcss/merge` | 待后台核实 |
| `@weapp-tailwindcss/postcss` | 待后台核实 |
| `@weapp-tailwindcss/postcss-calc` | 待后台核实 |
| `@weapp-tailwindcss/react-native` | 待后台核实 |
| `@weapp-tailwindcss/reset` | 待后台核实 |
| `@weapp-tailwindcss/runtime` | 待后台核实 |
| `@weapp-tailwindcss/shared` | 待后台核实 |
| `@weapp-tailwindcss/source-scan` | 待后台核实 |
| `@weapp-tailwindcss/typography` | 待后台核实 |
| `@weapp-tailwindcss/ui` | 待后台核实 |
| `@weapp-tailwindcss/variants` | 待后台核实 |
| `tailwindcss-config` | 待后台核实 |
| `tailwindcss-core-plugins-extractor` | 待后台核实 |
| `tailwindcss-injector` | 待后台核实 |
| `theme-transition` | 待后台核实 |
| `weapp-style-injector` | 待后台核实 |
| `weapp-tailwindcss` | 待后台核实 |
| `weapp-tw` | 待后台核实 |
| `wetw` | 待后台核实 |

恢复发布前记录并核对当前发布身份；在保持发布暂停的窗口内更新为上述组织身份。若后台支持并使用多个 Trusted Publisher，可先添加新身份并在成功验收后移除旧身份；不能假定所有包已经配置或共享同一配置。仓库 Secret 中的旧 `NPM_TOKEN` 不得注入发布步骤作为失败兜底。

### Cloudflare 与 Codecov

- Wrangler OAuth 可正常读取账户及 `weapp-tailwindcss` Worker 的现有部署；Pages 项目列表没有该文档站。主域名继续使用 `tw.weapp.dev`，Worker 配置及 Cloudflare 账户保持不变。
- 这些信息不能证明 Workers Builds 的 Git 仓库绑定已核实。仍需进入 Cloudflare 后台确认 Git 集成是否存在，并在存在时重新授权组织仓库。
- 直接 HTTP 检查主域名返回 403，next 域名出现 TLS EOF；尚不能据此判定真实浏览器访问正常。不得为了放行关闭站点安全策略。
- Codecov 旧仓库 API 可读取，但这不证明其 GitHub App 已获组织授权。迁移后必须验证新仓库身份和上报。
- GitHub Pages 的 `gh-pages:/` 来源已保留，新站点地址为 `https://weapp-tailwindcss.github.io/weapp-tailwindcss/`，API 状态为 `built`，没有自定义域名。旧地址 `sonofmagic.github.io/weapp-tailwindcss/` 不随仓库重定向；继续以 `tw.weapp.dev` 为主入口，不在旧仓库位置创建同名仓库。

## 后续恢复顺序

1. 恢复 npm、Cloudflare 和 Codecov 后台访问，逐包核实并更新上述新组织身份，核实发布 Token 对新仓库的访问权及文档域名。整个过程中保持 Release 停用。
2. 完成既有发布修复 PR #1261，并将地址变更 PR #1266 经正常门禁审核合并到 `main`；不得绕过审核或手工修改 `release/pnpm-version`。
3. 后台身份与权限核对通过后，仅恢复切换前原本启用的 Release 工作流。通过 repoctl 的 prepare 流程重新生成发布 PR #1255，不能直接发布旧生成分支的产物。
4. 下一次计划内真实发布逐包核对 npm 版本与 dist-tag、Git tag、GitHub Release 及新组织来源的 provenance。dry-run 不是发布认证成功证据；部分成功时使用 repoctl 恢复缺失项，不能重发已发布版本。
5. Sync Templates 原本停用，本次不恢复。若今后单独启用，先验证 `TEMPLATE_SYNC_SSH_KEY` 对独立模板仓库的权限。

异常时保持发布暂停，修复权限或配置；不把转回个人账户作为可靠回滚机制。当前停用状态已在本记录和迁移交付中明确说明。

## 验证记录

- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/ci/workflows.test.ts test/ci/repoctl-release.test.ts --update=none`：67 项通过。
- `CI=1 pnpm --filter @weapp-tailwindcss/website build`：英文、中文构建通过，GEO 索引已更新。构建有 CSS 压缩的 missing font size 警告，未阻断生成。
- `CI=1 pnpm release status`：repoctl 正确识别 30 个发布包的 metadata change intent；没有执行版本写入或发布。
- `CI=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4188/zh-cn/ pnpm --filter @weapp-tailwindcss/website exec playwright test tests/index.spec.ts --project=chromium --grep 'GitHub badge requests|support signals retain' --retries=0`：新组织请求与旧缓存隔离、现有缓存与开关行为共 2 项通过；服务来自本工作树的构建产物。
- 修改过的 TypeScript/TSX 文件通过定向 `pnpm exec eslint`；未使用自动修复。
- 30 个非私有包逐项核对通过：仓库元数据与根配置一致，包名、版本、导出、依赖及其他非地址字段保持不变。
- `CI=1 pnpm agents:check` 与 `git diff --check`：准备阶段通过；本次迁移记录更新后重新验证。
- 本次只更新迁移记录，没有修改前一轮已验证的代码。未运行全仓多端测试或实际 npm 发布；PR 的远端检查结果以当前 head 为准，不将运行中、排队或跳过的检查标记为通过。

本轮不新增 AGENTS 规则；使用现有发布、隔离和验收约束。

参考：[GitHub 仓库转移](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)、[npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers/)。
