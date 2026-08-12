---
id: ai-programming-plan
title: AI Programming Solution Selection Guide
sidebar_label: Comparison of AI programming solutions
description: Comparison of the capabilities and subscription plans of international and domestic AI programming platforms, IDEs and plug-ins, with budget and scenario-based selection recommendations.
sidebar: aiSidebar
keywords:
  - AI programming
  - LLM
  - Workflow
  - AI
  - Programming Solution Selection Guide
  - ai programming plan
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# AI programming solution selection guide

## 1. Plan Overview

This document aims to provide companies with a comprehensive AI programming tool selection reference, covering international mainstream and domestic excellent solutions, from subscription services, IDE tools to plug-in extensions, to help decision-makers make the optimal choice based on team needs, budget and usage scenarios.

---

## 2. Detailed comparison documents

For a more in-depth comparative analysis of models and tools, please refer to the following documents:

| Documentation                                               | Description                                                                                                                                                                             | Links                                                                                      |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Top foreign programming model selection recommendations** | An in-depth comparison of the three major models of Claude Opus 4.5, GPT-5.2, and Gemini 3 Pro, including price, refresh cycle, and how to continue using it after the quota is used up | [international-ai-models-comparison.md](./international-ai-models-comparison.md)           |
| **AI Programming Tool Selection Recommendation**            | Best combination of GLM-4.7 + Claude Code CLI, Qoder vs Cursor IDE comparison, including detailed explanation of refresh cycle and quota limit                                          | [qoder-vs-glm47-cursor-claude-comparison.md](./qoder-vs-glm47-cursor-claude-comparison.md) |

> **Core Points**:
>
> - **Refresh cycle comparison**: GLM-4.7/ChatGPT every **5 hours** (fastest) > Gemini Code Assist every **day** > GitHub Copilot/Qoder/Cursor every **month** > Claude Code every **7 days** (slowest)
> - **Plan after the quota is used up**: Wait for the refresh cycle / Use API KEY for pay-as-you-go / Switch to other subscription accounts / Upgrade to a higher version of the package

---

## 3. Summary of core platform features

- **AI Programming Ability Ranking**: You can view **[LLM Stats](https://llm-stats.com/)** at any time to obtain the latest model list and scores for quick comparison of model iteration effects.
- **Comprehensive list (capability/price/context)**: For a more comprehensive horizontal comparison, please refer to **[Vellum Leaderboard](https://www.vellum.ai/llm-leaderboard)**.
- **Real engineering bug repair benchmark**: SWE-bench (including real GitHub Issues) can refer to **[Official website](https://www.swebench.com)**.
- **Domestic model evaluation list**: OpenCompass (one of the authoritative domestic evaluation systems) can be viewed at **[Ranking](https://rank.opencompass.org.cn/home)**.
- **Domestic model international ranking entrance**: AI Rank summarizes the results of domestic models from multiple international evaluations. You can visit **[AI Rank](https://airank.dev/)**.
- **Shanghai Artificial Intelligence Laboratory-Domestic Model Evaluation Project**: The open source evaluation framework OpenCompass (self-developed by Chinese people, covering multi-dimensional comparison) warehouse can be found at **[github.com/open-compass/opencompass](https://github.com/open-compass/opencompass)**.

### 2.1 International mainstream AI platform

#### **ChatGPT (OpenAI)**

- **Core Advantages**: GPT-5.2 reaches 55.6% in SWE-Bench Pro, o1 pro mode is optimized for complex programming
- **Applicable scenarios**: Plus version ($20/month) is suitable for individual developers, Pro version ($200/month) is suitable for high-intensity professional users, and the API call limit is 15-20 times higher
- **Evaluation**: o The series of models have outstanding performance in programming, mathematics, and scientific problem solving, and are highly recognized by the industry.

**ChatGPT subscription gradient (subject to the official website)**

| Features            | Plus ($20/month)                          | Pro ($200/month)                                                      | Team ($25/person/month, ≥5 people)                                           |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Price               | $20/month                                 | $200/month                                                            | $30/person/month (monthly) <br/> $25/person/month (annual) (minimum 5 seats) |
| Model access        | GPT-5.2/GPT-5.2 mini, o1-mini lightweight | GPT-5.2/GPT-5.2 mini, o1-pro & o3-mini higher quota                   | GPT-5.2/GPT-5.2 mini, team shared quota                                      |
| Advanced reasoning  | o1-mini low frequency                     | o1-pro high frequency, long context                                   | o1-pro team quota, seats can be allocated                                    |
| Context/File        | Higher file size and context              | Highest file size/context, suitable for long documents and code bases | Similar to Pro, can be shared by teams                                       |
| Code Interpreter    | Higher concurrency and usage              | Highest concurrency / usage, suitable for data analysis and scripting | Team concurrency / usage sharing                                             |
| Custom tools/Memory | ✓                                         | ✓ (Higher capacity)                                                   | ✓ (Team sharing, controllable permissions)                                   |
| Team/Organization   | Personal subscription                     | Can be linked with Team/Enterprise                                    | Seat system, including team management/audit entrance                        |

- Pricing calculation: [OpenAI Pricing](https://openai.com/pricing) / [API Pricing](https://openai.com/api/pricing)

#### **Claude (Anthropic)**

- **Core Advantages**: Claude Code’s programming capabilities are among the best in the industry. Developers use it to complete 95% of coding work, increasing efficiency by more than 3 times.
- **Applicable scenarios**: Pro version ($20/month) provides Sonnet models, Max version ($100/$200/month) exclusively uses Opus 4 models in the IDE
- **Evaluation**: Used by 115,000 developers, processing 195 million lines of code in a single week, and rated as a "super value" programming assistant

**Claude subscription gradient (subject to the official website)**

| Features                | Pro ($20/month)                              | Team Standard Seat ($25/person/month, ≥5 people)      | Team Premium Seat ($150/person/month)                           |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Price                   | $20/month                                    | $30/person/month (monthly basis)                      |
| Model access            | Sonnet high limit, limited Opus/Opus preview | Sonnet/Opus high limit, priority for new models       | Sonnet/Opus high limit + Premium priority queue                 |
| Message quota           | ~5x free usage, priority queue               | Higher team usage, shared pool                        | Higher quota, suitable for high-frequency review/refactoring    |
| Context/file            | Longer context/file upload                   | Highest context/file limit                            | Highest limit, suitable for refactoring across large warehouses |
| Artifacts / Projects    | ✓                                            | ✓ (Team Projects/Shared Space)                        | ✓ (Shared with Premium)                                         |
| Management and auditing | ✗                                            | Management backend, member management, single sign-on | Management backend, auditing, Premium support                   |

- Pricing calculation: [Claude Pricing](https://claude.com/pricing)

#### **Gemini Pro 3 / Flash (Google)**

- **Core Advantages**: Long context (millions of levels, subject to official release), both tool calling and code completion, multi-modal (text/image/audio) understanding; the Flash version focuses on low latency and low cost, suitable for real-time interaction and batch scripts.
- **Applicable scenarios**: Pro 3 is used for complex reasoning, cross-file reconstruction, and code review; Flash is used for low-latency completion, conversational Q&A, and batch generation; the AI Pro/Ultra package significantly increases the amount of creative multi-modality (image generation, video generation) and in-depth research.
- **Billing/Hosting**: Google AI Studio provides subscription (AI Pro $20/month, AI Ultra $250/month, both include free trial periods) and free tiers. Enterprises can obtain VPC-SC, CMEK, auditing and private service access through Vertex AI (subject to official pricing); some features are limited to the United States.
- **Evaluation**: It has obvious advantages in inference speed/cost-effectiveness, and combined with Vertex AI's security and compliance capabilities, it is suitable for teams with compliance requirements; AI Ultra's exclusive Deep Think/Project Mariner is suitable for heavy research or creative teams.

**Gemini Pro 3 Subscription Gradient**

| Features                   | AI Pro ($20/month)           | AI Ultra ($250/month)            |
| -------------------------- | ---------------------------- | -------------------------------- |
| Price                      | $20/month (first month free) | $250/month (first 3 months $125) |
| Gemini 3 Pro Chat          | Higher Permissions           | Maximum Usage                    |
| Deep Think                 | ✗                            | ✓ (Ultra exclusive)              |
| Gemini Agent               | ✗                            | ✓ (US only)                      |
| Deep Research              | 20 copies/day                | 200 copies/day                   |
| Gemini Code Assist/CLI     | Higher limit                 | Highest limit                    |
| Jules (Programming Agency) | Higher Limit                 | Maximum Limit                    |

- Pricing calculation: [Google AI Studio Pricing](https://ai.google.dev/pricing) / [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
  | Project Mariner | ✗ | ✓ (Early Access, US only) |

**ChatGPT vs Claude vs Gemini Pro 3 comparison (Team encoding scenario)**

| Dimensions           | ChatGPT                                             | Claude                                                       | Gemini Pro 3                                                                  |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Starting price       | Plus $25/person/month (yearly)                      | Pro $25/person/month (yearly)                                | AI Pro $20/month                                                              |
| Reasoning/Code       | o1-pro strong reasoning, Code Interpreter is stable | Sonnet/Opus code review and long context performance is good | Pro 3 long context, reasoning is cost-effective, pure code is slightly weaker |
| Long context/file    | Pro version highest context and file upload         | Team version highest context and team sharing files          | Ultra higher context, suitable for cross-file refactoring                     |
| Code Tools/Agents    | Code Interpreter, Tools/Memories                    | Artifacts/Projects, Team Collaboration                       | Gemini Code Assist/CLI, Jules (Programming Agent)                             |
| Applicable scenarios | Complex coding/data analysis/scripting              | Code review, cross-file reconstruction, team cooperation     | Long context reconstruction + research/Agent orchestration                    |

### 2.2 Domestic Coding Plan Platform

#### **GLM Zhipu Qingyan (Zhipu AI)**

- **Core Advantages**: GLM-4.6 code capabilities are aligned with Claude Sonnet 4, the strongest coding model in China, and token consumption is 30% less than the previous generation.
- **Value for money**: lowest ¥40/month, about 1/7 of Claude’s price, performance up to 9/10 of Claude’s
- **Evaluation**: Excellent performance in 7 authoritative tests such as CC-Bench, surpassing Claude Sonnet 4 in real programming tests
- **Pricing**: [bigmodel.cn/pricing](https://bigmodel.cn/pricing)

#### **MiniMax M2**

- **Core Advantages**: Designed for Agent and code, SWE-bench champion (44% success rate exceeds GPT-5 Codex), the price is only 8% of Claude, and the speed is 2 times
- **Technical parameters**: 10 billion activation parameters, 230 billion total parameters, 200,000+ context windows
- **Evaluation**: Ranked first in open source, with particularly outstanding performance in front-end design and interaction solutions
- **Pricing**: [MiniMax Pricing](https://platform.minimaxi.com/docs/guides/pricing?key=68aec7e84c75b9c918ccd10d)

#### **Kimi K2 Thinking (Dark Side of the Moon)**

- **Core Advantages**: Trillion-parameter hybrid expert architecture, supports 256K contexts, and can execute 200-300 consecutive tool calls
- **Technical Features**: Native INT4 quantization, 2x speedup in low latency mode without loss of performance
- **Evaluation**: NIST evaluated it as the strongest AI model in China at the time, with a SWE-Multilingual score of 61.1%
- **Pricing**: [Kimi Pricing](https://kimi.moonshot.cn/pricing)

#### **Tongyi Qianwen (Alibaba Cloud Qwen Series)**

- **Latest model family**: Qwen3 (universal)/Qwen3-Coder (code)/Qwen3-VL (multi-modal)/Qwen-Long (ultra-long context) and lightweight reasoning model QwQ; covering reasoning, code, vision and long document requirements
- **Core capabilities**: Native function/tool calling, retrieval/networking, code completion and cross-file reconstruction, multi-modal understanding (graphics/tables/formulas), long context version can support cross-file and long document analysis
- **Applicable scenarios**: Bailian platform can arrange multiple models and tools with one click, which is suitable for multiple rounds of reasoning scenarios such as e-commerce/content/customer service/code; the performance of long documents and multi-modal (design draft restoration, table analysis) scenarios is robust
- **Billing/Hosting**: Bailian provides pay-as-you-go/subscription and enterprise versions (VPC, auditing, CMEK, data not exported), supporting privatization or hybrid cloud deployment to facilitate domestic compliance
- **Evaluation**: The Chinese corpus and industry scenarios are mature, engineering and cost-effective are both considered, and it is the main model that domestic teams can rely on for a long time.
- **Pricing**: [Bailing Model Market-Qwen](https://bailian.console.aliyun.com/#/model-market/detail/qwen-max)

#### **Volcano Ark (Doubao-Seed-Code)**

- **Core Advantages**: The first programming model in China that supports visual understanding, which can generate code based on UI design drafts/screenshots. In the TRAE environment, SWE-Bench Verified reaches 78.80% (SOTA)
- **Cost Advantage**: The overall cost in the industry is reduced by 62.7%, the lowest price in China. The cost of the same task is only 8% of Claude and 44% of GLM.
- **Evaluation**: Front-end page replication capability is "far ahead", compatible with Anthropic API, and easy to migrate
- **Pricing**: [Doubao Pricing](https://www.volcengine.com/product/doubao)

### 2.3 IDE and development environment

#### **Cursor**

- **Market Position**: Valued at $9.9 billion, annualized revenue of $500 million doubling every two months, industry leader
- **Core Features**: Predictive code completion (predict lines 5-10), cross-file reconstruction engine, interactive debugging
- **Evaluation**: v1.0/v1.1 adds BugBot review, Background Agent, and Memory capabilities, and the community ecosystem is the most complete

#### **GitHub Copilot**

- **Core Advantages**: Deep integration with GitHub, complete ecosystem, new organization-level code review function in December 2025
- **Premium Requests**: Pro version 300 times/month, Pro+ version 1,500 times/month, overage $0.04/time
- **Evaluation**: The timeout rate has been reduced from 4.3% to 1.1%, the stability has been significantly improved, and it is suitable for heavy GitHub users.

#### **Windsurf (Codeium)**

- **Technological Innovation**: The world's first AI Flow paradigm IDE, Cascade technology enables multi-step collaboration, Supercomplete predicts high-level intentions
- **Pricing Advantage**: Free version 25 points/month, Pro version $15/month (500 points), free use of GPT-4o and Claude 3.5 Sonnet
- **Evaluation**: Contextual understanding ability is better than Cursor, suitable for teams that require in-depth code base understanding

#### **Trae (ByteDance)**

- **Local advantage**: China's first AI native IDE, native Chinese support, configured with Doubao-1.5-pro/DeepSeek R1/V3
- **Core functions**: Builder mode (build projects from scratch), Solo mode (full process automation)
- **Evaluation**: Currently completely free, efficiency increased by 300%, but performance issues are obvious in low configuration environments

#### **Qoder (Alibaba)**

- **Positioning**: A full-stack AI IDE launched by Alibaba, emphasizing cross-file reconstruction and code review
- **Core functions**: Long context completion, Agent-style task decomposition, project-level search and reconstruction, terminal/tool invocation
- **Pricing**: Pro+ $30/month, Ultra $100/month (higher context and Agent concurrency)

#### **Kiro (AWS)**

- **Core Features**: Spec-Driven, enforced "plan first, build later", Agent Hooks automation triggers
- **Technical Architecture**: Dedicated Claude Sonnet 3.7/4.0 model
- **Evaluation**: Suitable for enterprise-level project management and process standardization, currently free in the public beta stage

### 2.4 VSCode plug-in

#### **Augment**

- **Core Advantage**: SWE-Bench Verified Champion (65.4%), 200,000 token context window, based on Claude Sonnet 4
- **Features**: Agent mode, persistent memory learning coding style, support for multi-modal input (screenshot/Figma)
- **Multiple IDE support**: JetBrains, VS Code, GitHub, Slack, Vim all covered
- **Pricing**: Half-month free trial for new users, then $60/month

---

## 3. Selection suggestions

### 3.0 Decision-making points for teams of different sizes

- **Efficiency improvement first conclusion**: When pursuing the best AI programming efficiency improvement, give priority to Claude Code (AI engineering is the most complete, $100/month is enough to cover heavy development); if you are cost-sensitive, codex (engineering is slightly weaker, about $20/month can meet most scenarios).
- **Multi-modal advantages**: Gemini Pro 3 is leading in image/visual understanding and is suitable for teams involved in design draft restoration or multi-modal requirements. Its pure programming ability is weaker than Claude Code/codex.
- **Ultimate Cost Reduction Path**: In addition to SaaS subscriptions, you can also combine open source projects to build your own transfer stations and account pools to further reduce call costs (compliance and operation and maintenance costs need to be evaluated).
- **Individual / 1-10 people**: Prioritize ChatGPT Plus, Claude Pro, Cursor Pro (or Windsurf Free/Pro) + Copilot Pro; focus on ease of use and cost cap.
- **10-50 people**: Cursor Pro/Pro+ + Claude Max / ChatGPT Pro; Doubao Lite/Pro + Windsurf Pro is optional in China; unify 1-2 IDEs and create a library of prompt words and code snippets.
- **50-200 people**: International (Cursor Pro+/Ultra + Claude Max/ChatGPT Pro) + Domestic (Doubao Pro or GLM Pro/Max + Windsurf/Trae); start to enable SSO, auditing, intranet agent, and quota management by team.
- **200-300 people (large-scale R&D)**: international + domestic dual-stack parallelization, enterprise version or Team/Business version enables SSO/SCIM, audit logs, VPC/dedicated lines; indicator review (rejection rate, hallucination rate, code review hit rate).
- **More than 300 people/Cross-border listed companies**: Must meet SOX/internal control, data sovereignty, GDPR/CCPA, penetration and security assessment; adopt enterprise contract (DPA/BAA/SOW), dual Region data isolation, DLP + local search, and key outputs need to be manually reviewed to leave traces.
- **Common Actions**: Unify IDE/plug-ins, hierarchical warehouse access, prohibit public endpoints for sensitive projects, monthly cost and quality review, and gradually upgrade models and quotas.

### 3.1 Classification by budget

- **Low-cost plan**: MiniMax M2 (from ¥29), Volcano Ark (from ¥40), Trae (free)
- **Mid-Budget**: GLM (from ¥40), Windsurf Pro ($15), GitHub Copilot Pro ($10)
- **High-End Plans**: Cursor Ultra ($200), ChatGPT Pro ($200), Claude Max ($200)

### 3.2 Classification by usage scenarios

- **Individual Developer**: ChatGPT Plus, Claude Pro, GLM Lite
- **Small and medium-sized teams**: Cursor Pro, Trae, Windsurf, MiniMax
- **Enterprise-level teams**: Cursor Teams, GitHub Copilot Enterprise, Kiro, Augment
- **Front-end development first**: Volcano Ark (visual understanding), MiniMax M2
- **Chinese environment is preferred**: Trae, GLM, Volcano Ark, Kimi

### 3.3 Classification by technology stack

- **VSCode Ecosystem**: Augment, Trae, Windsurf plug-ins
- **JetBrains users**: Augment, Windsurf plug-ins
- **GitHub heavy user**: GitHub Copilot
- **Multi-language projects**: Cursor, Kimi K2, GLM-4.6

### 3.4 Recommended combination examples (applicable to multiple scales)

| Requirements                             | Recommended combinations                                        | Description                                                                              |
| ---------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Code generation + review (international) | Cursor Pro+/Ultra + Claude Max / ChatGPT Pro                    | Large context + strong agent scheduling, covering multi-language and complex refactoring |
| Code generation + review (domestic)      | Windsurf Pro or Trae + Doubao Seed-Code / GLM-4.6               | Convenient for intranet agents and Chinese context, cost controllable                    |
| IDE lightweight completion               | GitHub Copilot Business/Enterprise                              | Unify GitHub permissions and auditing, mature team management                            |
| Agent-style automation                   | Cursor Background Agent / Trae Solo mode / MiniMax Agent        | Suitable for batch scaffolding, refactoring, test generation                             |
| Compliance/Isolation                     | OpenAI/Anthropic Enterprise or Doubao/GLM privatization options | Supports SSO, auditing, VPC/dedicated lines, model packaging                             |

### 3.5 Summary table of models and solutions (quick overview of model selection)

| Category                  | Representative model/scheme             | Right to scale          | Key benefits                                            | Price level | Compliance points                                                                |
| ------------------------- | --------------------------------------- | ----------------------- | ------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Internationally available | ChatGPT Pro / Claude Max                | Individual - 200 people | All-round generation, complex reasoning, high API limit | $$$         | Enable SSO/log control; upload small amounts to sensitive warehouses             |
| International enterprise  | OpenAI/Anthropic Enterprise             | More than 200 people    | Compliance contract (DPA/BAA), audit, private endpoint  | $$$$        | Support dedicated line/VPC, data isolation, signable SOW                         |
| Domestic main force       | Doubao Seed-Code / GLM-4.6              | 10-300 people           | Strong Chinese/visual understanding, low cost           | $$          | Enterprise version supports dedicated line, domestic data compliance is required |
| Cost-effective            | MiniMax M2 / Kimi K2                    | 1-200 people            | Low price, long context                                 | $-$$        | Avoid uploading sensitive code to public endpoints                               |
| IDE/Agent                 | Cursor Pro+/Ultra / Windsurf Pro / Trae | 10-300 people           | IDE deep integration, Agent/Flow collaboration          | $-$$$       | Enterprise agent, minimal telemetry, private warehouse index                     |
| Completion/Review         | GitHub Copilot Business/Enterprise      | 10-300 people           | GitHub permissions and auditing are mature              | $$          | Bind organization SSO/SCIM, prohibit external private warehouse code             |
| VSCode plug-in            | Augment                                 | 10-200 people           | Big context, Agent/multi-modality                       | $$          | Control upload scope and logs, local retrieval if necessary                      |

---

## Subscription plan

### ChatGPT

| **Package Level** | **Monthly**   |
| ----------------- | ------------- |
| **Plus**          | $20           |
| **Pro**           | $200          |
| **Business/Team** | $30/person    |
| **Enterprise**    | Sales Contact |

### Claude

[Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

| **Package Level** | **Monthly** |
| ----------------- | ----------- |
| **Pro**           | $20         |
| **Max 5x**        | $100        |
| **Max 20x**       | $200        |

## IDE/plug-in

## Coding Plan

Provides API that can be used in Claude Code, Cline and Chat software.

### GLM (z.ai) (Zhipu Qingyan)

[Pricing](https://bigmodel.cn/glm-coding)

Latest model: GLM-4.6 GLM-4.6V

| **Package level** | **Monthly** | **Quarterly** | Yearly | **Usage description (every 5 hours)** | **Corresponding Claude quota** |
| ----------------- | ----------- | ------------- | ------ | ------------------------------------- | ------------------------------ |
| **Lite**          | ¥40         | ¥120          | ¥480   | ~120 Prompts                          | 3x Claude Pro                  |
| **Pro**           | ¥200        | ¥600          | ¥2400  | ~600 Prompts                          | 5x Lite                        |
| **Max**           | ¥400        | ¥1200         | ¥4800  | ~2400 Prompts                         | 4x Pro                         |

### MiniMax M2

[Pricing](https://platform.minimaxi.com/docs/pricing/coding-plan)
Latest model: MiniMax M2

| **Package level** | **Monthly** | **Quarterly** | **Yearly** | **Usage description (every 5 hours)** | **Corresponding to Claude quota**  |
| ----------------- | ----------- | ------------- | ---------- | ------------------------------------- | ---------------------------------- |
| **Starter**       | ¥29         | ¥87           | ¥348       | 40 Prompts                            | About 1x that of Claude Pro        |
| **Plus**          | ¥49         | ¥147          | ¥588       | 100 Prompts                           | About 2.5 times that of Claude Pro |
| **Max**           | ¥119        | ¥357          | ——         | 300 Prompts                           | About 7.5 times that of Claude Pro |

## Kimi

[Pricing](https://www.kimi.com/membership/pricing)
Latest Model: Kimi K2 Thinking

| **Package level** | **Monthly** | **Quarterly** | **Yearly** | **Usage description (every 5 hours)** | **Corresponding to Claude quota** |
| ----------------- | ----------- | ------------- | ---------- | ------------------------------------- | --------------------------------- |
| **Andante**       | ¥49         | ——            | ——         | 1024 Prompts                          | ——                                |
| **Moderato**      | ¥99         | ——            | ——         | 2048 Prompts                          | ——                                |
| **Allegretto**    | ¥119        | ——            | ——         | 7168 Prompts                          | ——                                |

## Volcano Ark (bean bag)

[Pricing](https://www.volcengine.com/activity/codingplan)
Latest model: Doubao-Seed-Code DeepSeek-V3.2

| **Package level** | **Monthly** | **Quarterly** | **Yearly** | **Usage description (every 5 hours)** | **Corresponding to Claude quota** |
| ----------------- | ----------- | ------------- | ---------- | ------------------------------------- | --------------------------------- |
| **Lite**          | ¥40         | ¥120          | ¥480       | ~120 Prompts                          | 3x Claude Pro                     |
| **Pro**           | ¥200        | ¥600          | ¥2400      | ~600 Prompts                          | 5x Lite                           |

## IDE

### Cursor

[Pricing](https://www.cursor.com/pricing)

| **Package** | **Monthly (USD)** | **Quota**                                                            |
| ----------- | ----------------- | -------------------------------------------------------------------- |
| Hobby       | $0                | 1 week trial + limited Agent/Tab                                     |
| Pro         | $20               | Unlimited Tab/Auto + $20 frontier model credit (~225 times Sonnet 4) |
| Pro+        | $60               | 3x model usage credit for Pro                                        |
| Ultra       | $200              | 20x model usage credit for Pro                                       |
| Teams       | $40/person        | Pro quota + team management                                          |

### Github Copilot

[Pricing](https://github.com/features/copilot/plans)

| **Package** | **Monthly (USD)** | **Quota**                                                 |
| ----------- | ----------------- | --------------------------------------------------------- |
| Free        | $0                | 2,000 completions/month + 50 premium requests/month       |
| Pro         | $10               | Unlimited completions + 300 premium requests/month        |
| Pro+        | $39               | Unlimited completions + 1,500 premium requests/month      |
| Business    | $19/person        | Unlimited completions + 300 premium requests/user/month   |
| Enterprise  | $39/person        | Unlimited completions + 1,000 premium requests/user/month |

#### Winsurf

[Pricing](https://windsurf.com/pricing)

| **Package** | **Monthly (USD)** | **Quota**                          |
| ----------- | ----------------- | ---------------------------------- |
| Free        | $0                | 25 credits/month                   |
| Pro         | $15               | 500 credits/month                  |
| Teams       | $30/person        | 500 credits/person/month           |
| Enterprise  | Contact Sales     | Higher Limit + Enterprise Features |

#### Trae

[Pricing](https://www.trae.ai/pricing)
[Billing](https://docs.trae.ai/ide/billing)

| **Package** | **Monthly (USD)** | **Quota**                                         |
| ----------- | ----------------- | ------------------------------------------------- |
| Free        | $0                | Basic features (limited)                          |
| Pro         | $10               | First month for new users $3 (original price $10) |

#### Kiro

[Pricing](https://kiro.dev/pricing)

| **Package** | **Monthly (USD)** | **Quota**                                  |
| ----------- | ----------------- | ------------------------------------------ |
| Free        | $0                | 50 credits                                 |
| Pro         | $20               | 1,000 credits/month (overage $0.04/credit) |
| Pro+        | $40               | 2,000 credits/month (overage $0.04/credit) |
| Power       | $200              | 10,000 credits/month (excess $0.04/credit) |
| Enterprise  | Contact Sales     | Custom Quota + Enterprise Functions        |

### VSCode plug-in

#### Augment

[Pricing](https://augmentcode.com/pricing)

| **Package** | **Monthly (USD)** | **Quota**                           |
| ----------- | ----------------- | ----------------------------------- |
| Indie       | $20               | 40,000 credits/month                |
| Standard    | $60               | 130,000 credits/month               |
| Max         | $200              | 450,000 credits/month               |
| Enterprise  | Contact Sales     | Custom Quota + Enterprise Functions |

## Sharing plan

### New API

[GitHub](https://github.com/QuantumNous/new-api)

If the coding plan above provides the apikey method, you can add the apikey to the new api for aggregation and then distribute it.

### Claude Relay Service

[GitHub](https://github.com/Wei-Shaw/claude-relay-service)

If the key is not provided directly, such as Claude Code, Codex, etc., you can deploy CRS to log in to Claude Code and OpenAI accounts for distribution

## Notes

Claude Code has strict environmental requirements and is prone to account closure. Therefore, the deployment environment requires at least the use of a US home broadband agent, otherwise it is easy to get the account banned (although refunds will be issued).

## Promotions

- The current business plan of chatgpt is $0 per month, and there is a team plan with 5 seats. There are merchants on the market that offer ￥10/seat and provide warranty. The end time depends on the official policy of openai.

- GLM has first-year/quarterly/annual discounts, which can be purchased using multiple accounts and shared and distributed through the methods above.

### Claude code/Codex transfer station

There are currently Claude Code/Codex transfer stations on the market. Taking Claude Code as an example, the price is generally between ￥0.3-￥1 per knife. Since the price calculation involves multiple rates/transfer station internal billing rules, it is not listed.
