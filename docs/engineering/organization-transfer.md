# 主仓库组织迁移记录

## 当前状态

准备目标：将 `sonofmagic/weapp-tailwindcss` 转为 `weapp-tailwindcss/weapp-tailwindcss`，保留公开属性、仓库名称、npm 包名及所有权、文档域名和独立模板仓库。

本轮基线为 `0bfb23912f59cfaf0b58b00353d7f08122d1f8f1`。**Transfer 尚未执行，此变更在后台放行条件完成前保持草稿，不应提前合并或发布。** npm 的实际信任配置和发布 Token 对组织仓库的访问权尚未核实，Cloudflare Git 集成与 Codecov 的组织授权也尚未核实。

迁移授权已由维护者明确给出；当前阻塞属于认证与验收缺证，不是等待再次批准迁移。

## 已准备的内容

- 30 个非私有包的 `repository`、`bugs` 与中文 patch change intent，供迁移后的计划内发布更新 npm 元数据。
- 根 README、包 README、文档站导航、结构化数据、贡献与源码入口、API 文档生成器、showcase 脚本和 Star 徽章的主仓库地址。
- 首页 Star 查询及 sessionStorage 使用新的 owner；浏览器回归验证旧 owner 缓存不会覆盖新仓库数据。
- 中英文 GEO 索引由文档构建重新生成。历史 Issue/PR/commit 引用、CHANGELOG、作者与赞助入口、AtomGit 镜像及其他独立仓库保持原有身份。
- 迁移前配置快照保存在本工作树忽略目录 `node_modules/.cache/organization-transfer/pre-transfer.json`，包含仓库身份、分支保护、rulesets、协作者、环境、webhook、Secret 名称、变量名称、工作流状态、组织策略、Pages 和 Issue 指派；不包含 Secret 值。切换窗口前必须重新保存并比较快照。

本轮没有修改 demo 页面或样式输出，因此不需要更新 demo static 基线；文档站索引已随构建更新。

## 后台放行清单

### GitHub

- 原仓库管理员与目标组织 Owner 身份已核实，目标组织没有同名仓库。
- 最新读取的组织 Actions 默认权限为 `read`，允许 Actions 创建及批准 PR。Release 已显式申请 `contents: write`、`pull-requests: write` 和 `id-token: write`，不需要为了迁移全局扩大默认权限。
- 原仓库 `main` 要求一次审核、严格的 `SEO Quality Gate`，禁止强推与删除。迁移后逐项对照快照，不绕过审核合并。
- 已记录 268 个带指派的 Issue/PR，指派对象均为组织 Owner `sonofmagic`。
- Release 工作流为 `active`；Sync Templates 为 `disabled_manually`。恢复时按快照恢复，不能将原本停用的模板同步自动启用。
- 最新 Release run `36843628878` 已失败，发布依赖协议修复 PR #1261 尚未合并，发布 PR #1255 仍需重新生成。先解决当前发布问题，再安排切换窗口。
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

本机 Chrome 原生入口两次返回 `timeoutReached`；备用浏览器入口返回 `Codex auth token is unavailable`，尚未进入 npm 后台。以下各包均不能标记为已配置：

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

切换前记录当前发布身份；在暂停发布的窗口内更新为上述组织身份。若后台支持并使用多个 Trusted Publisher，可先添加新身份并在成功验收后移除旧身份；不能假定所有包已经配置或共享同一配置。仓库 Secret 中的旧 `NPM_TOKEN` 不得注入发布步骤作为失败兜底。

### Cloudflare 与 Codecov

- Wrangler OAuth 可正常读取账户及 `weapp-tailwindcss` Worker 的现有部署；Pages 项目列表没有该文档站。主域名继续使用 `tw.weapp.dev`，Worker 配置及 Cloudflare 账户保持不变。
- 这些信息不能证明 Workers Builds 的 Git 仓库绑定已核实。仍需进入 Cloudflare 后台确认 Git 集成是否存在，并在存在时重新授权组织仓库。
- 直接 HTTP 检查主域名返回 403，next 域名出现 TLS EOF；尚不能据此判定真实浏览器访问正常。不得为了放行关闭站点安全策略。
- Codecov 旧仓库 API 可读取，但这不证明其 GitHub App 已获组织授权。迁移后必须验证新仓库身份和上报。
- GitHub Pages 当前源为 `gh-pages:/`，没有自定义域名。旧地址 `sonofmagic.github.io/weapp-tailwindcss/` 不随仓库重定向；继续以 `tw.weapp.dev` 为主入口，不在旧仓库位置创建同名仓库。

## 切换顺序

1. 恢复后台访问，逐包核实 npm，确认发布 Token、Cloudflare 与 Codecov 的授权和域名访问。解决既有发布失败，确认没有 Release 或模板同步任务正在运行。
2. 重新保存配置与工作流状态快照；临时停用原本启用的 Release 和模板同步，保留原本停用状态。停用触发入口并不会终止已有任务，必须再次确认队列和运行中任务为空。
3. 完成新 npm 发布身份准备后，使用原仓库的 Transfer 功能，目标 owner 为 `weapp-tailwindcss`，名称仍为 `weapp-tailwindcss`。请求响应不明确时先查询新旧仓库 ID，不能盲目重试。
4. 对照快照核对仓库 ID、历史、Star、Fork、Issue/PR、Release、协作者、分支保护、环境、Secrets 名称和工作流权限；更新维护者 checkout 的 origin，检查旧 Git 地址重定向与新地址可读取。
5. 完成第三方重新授权，核实迁移前草稿 PR 随仓库转移并保留审核。PR 经正常门禁审核合并到 `main`，保持 Release 暂停，避免中间状态触发发布。由 repoctl 重新生成发布分支，不手工修改 `release/pnpm-version`。
6. 本地检查与远端身份检查全部通过后，按快照恢复自动化。若仅 npm 发布通路仍未验收，明确记录为待下次计划内真实发布验证；dry-run 不是发布认证成功证据。
7. 下一次计划内发布逐包对账 npm 版本与 dist-tag、Git tag、GitHub Release 以及新组织来源的 provenance。部分成功时使用 repoctl 恢复缺失项，不能重发已发布版本。

异常时保持发布暂停，修复权限或配置；不把转回个人账户作为可靠回滚机制。停用状态和未完成项必须记录，不能留下无人知晓的暂停。

## 本地验证

- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/ci/workflows.test.ts test/ci/repoctl-release.test.ts --update=none`：67 项通过。
- `CI=1 pnpm --filter @weapp-tailwindcss/website build`：英文、中文构建通过，GEO 索引已更新。构建有 CSS 压缩的 missing font size 警告，未阻断生成。
- `CI=1 pnpm release status`：repoctl 正确识别 30 个发布包的 metadata change intent；没有执行版本写入或发布。
- `CI=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4188/zh-cn/ pnpm --filter @weapp-tailwindcss/website exec playwright test tests/index.spec.ts --project=chromium --grep 'GitHub badge requests|support signals retain' --retries=0`：新组织请求与旧缓存隔离、现有缓存与开关行为共 2 项通过；服务来自本工作树的构建产物。
- 修改过的 TypeScript/TSX 文件通过定向 `pnpm exec eslint`；未使用自动修复。
- 30 个非私有包逐项核对通过：仓库元数据与根配置一致，包名、版本、导出、依赖及其他非地址字段保持不变。
- `CI=1 pnpm agents:check`：53 份规则、98 份文档、501 条命令检查通过；`git diff --check` 通过。
- 未运行全仓多端测试、实际 npm 发布或迁移后 CI；本记录不将其标记为通过。

本轮不新增 AGENTS 规则；使用现有发布、隔离和验收约束。

参考：[GitHub 仓库转移](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)、[npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers/)。
