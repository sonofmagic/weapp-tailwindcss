---
id: ai-coding-three-solutions
title: Selection guide for five major AI coding assistant solutions
sidebar_label: Cursor / Copilot / Claude / Codex / Kiro five major solutions
description: 'In-depth comparison of the prices, quotas and applicable scenarios of the five major AI programming solutions: Cursor IDE, GitHub Copilot, Claude Code, OpenAI Codex and AWS Kiro'
sidebar: aiSidebar
keywords:
  - AI programming
  - LLM
  - Workflow
  - AI
  - Selection Guide for Five Coding Assistant Solutions
  - ai coding three solutions
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# AI Programming Five Selection Guide

## Overview

This document will provide an in-depth comparison of the five most popular AI programming solutions: **AWS Kiro**, **GitHub Copilot**, **Cursor IDE**, **Claude Code** and **OpenAI Codex**, to help developers choose the most suitable tool according to their own needs.

| Solutions          | Domestic Availability   | Network Requirements   |
| ------------------ | ----------------------- | ---------------------- |
| **AWS Kiro**       | ✅ Can be used directly | No agent required      |
| **GitHub Copilot** | ✅ Can be used directly | No agent required      |
| **Cursor IDE**     | ❌                      | US node/agent required |
| **Claude Code**    | ❌                      | US node/agent required |
| **OpenAI Codex**   | ❌                      | US node/agent required |

---

## Directly available domestic plans

> **Note**: The following solutions can be directly accessed in mainland China without complex network configuration.

### Option 1: AWS Kiro ✅ Directly available in China

### Reason for selection

**Kiro** is an AI native IDE launched by Amazon AWS, adopting a unique Spec-Driven (specification-driven) development model:

- **Directly available in China**: Services are provided through the AWS China region, **Mainland Chinese users can access without an agent**
- **AWS background support**: Officially supported by Amazon, relying on AWS infrastructure, enterprise-level reliability
- **Spec-Driven Development**: A unique "plan first, build later" model that transforms requirements into executable specifications
- **Claude 4.5 full series**: Supports **Claude Opus 4.5**, Sonnet 4.5, Haiku 4.5 full series models
- **Intelligent model selection**: Auto mode automatically selects the most appropriate model based on task complexity
- **VS Code Architecture**: Based on VS Code fork, the interface is familiar and easy to get started.
- **Agent Hooks**: supports automation triggers, and the workflow can be customized
- **New user benefits**: 500 points will be given for experience in the first month after registration

### ⚠️ Notes for Chinese users

> **IMPORTANT**: While Kiro is currently available in China through the AWS China Region, please note:
>
> 1. **Policy Risk**: The iterations and policies of various products may change at any time, and there is no guarantee that they can always be used in China.
> 2. **Anthropic Restrictions**: Claude officially updated its policy in September 2025 to prohibit Chinese-controlled entities from using Claude services
> 3. **AWS Bedrock channel**: Kiro provides Claude model access through AWS Bedrock, which is still available in the AWS China region.
> 4. **Changes**: If you encounter access problems, it is recommended to pay attention to the official announcement of AWS China or consider alternatives.

### Personal Subscription Plan

| Packages  | Monthly Fees | Credits                                    | Overage                                                           |
| --------- | ------------ | ------------------------------------------ | ----------------------------------------------------------------- |
| **Trial** | -            | 50 credits/month + 500 for the first month | Cannot be exceeded, you have to wait for the next month to use up |
| **Pro**   | $20/month    | 1,000 credits/month                        | $0.04/credit                                                      |
| **Pro+**  | $40/month    | 2,000-3,000 credits/month                  | $0.04/credit                                                      |
| **Power** | $200/month   | 10,000 credits/month                       | $0.04/credit                                                      |

**Instructions for use**:

- **Trial Quota**: 50 credits per month, new users will receive an additional 500 credits in the first month
- **Refresh Period**: Reset every month by subscription date
- **Overage processing**: Paid packages (Pro/Pro+/Power) can be overused and will be billed at $0.04/credit
- **Upgrade Retention**: Upgrade within 30 days to retain unused trial credit

### Team Subscription Plan

| Package        | Price              | Minimum number of people | Core functions                                                                                                                    |
| -------------- | ------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Enterprise** | Customized pricing | **20 people**            | All personal features + SSO/SCIM + Centralized license management + Organizational policies + AWS integration + Dedicated support |

### Technical features

| Features                | Description                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Spec-Driven**         | Transform ideas into "living executable specifications" and automatically apply software engineering best practices |
| **Main Models**         | **Claude Opus 4.5**, Sonnet 4.5, Haiku 4.5                                                                          |
| **Architecture Basics** | Based on VS Code                                                                                                    |
| **Extended Protocol**   | Support MCP (Model Context Protocol)                                                                                |

#### Claude 4.5 model Credit multiplier

| Model          | Credit multiplier | Applicable scenarios                                          |
| -------------- | ----------------- | ------------------------------------------------------------- |
| **Haiku 4.5**  | 0.4×              | Fast, low-cost tasks                                          |
| **Sonnet 4.5** | 1.3×              | Complex proxies and encoding (recommended for most scenarios) |
| **Opus 4.5**   | 2.2×              | The strongest reasoning ability, the most challenging task    |

### Reference link

- [Kiro official website](https://kiro.dev/)
- [Kiro official pricing page](https://kiro.dev/pricing/)
- [AWS China Kiro CDK Tutorial](https://aws.amazon.com/cn/blogs/china/blog-03-kiro-ai-cdk-development/)

---

### Option 2: GitHub Copilot ✅ Can be used directly

### Reason for selection

**GitHub Copilot** is an AI programming assistant jointly developed by GitHub and OpenAI. It is currently the earliest AI coding tool on the market with the largest user base:

- **Market Pioneer**: First released in 2021, with more than 1.5 million users, dominating the AI programming tool market
- **Deep Integration**: Deeply integrated with the GitHub ecosystem, supporting VS Code, Visual Studio, and JetBrains full range of IDEs
- **Multiple model support**: Supports **Claude 4.5** (Sonnet/Opus/Haiku), **GPT 5.2**, **Gemini Pro 3** and other models
- **Enterprise-level support**: Endorsed by GitHub, the enterprise version provides complete permission management and security compliance
- **Premium Request System**: Introducing a new premium requests billing model in 2025
- **⚠️ Domestic restrictions**: Access from mainland China requires a stable network environment

### Personal subscription plan (2025-2026 latest)

| Package  | Monthly fee | Annual fee              | Core quota                                                           |
| -------- | ----------- | ----------------------- | -------------------------------------------------------------------- |
| **Free** | Free        | Free                    | Basic code completion, limited Copilot Chat functionality            |
| **Pro**  | $10/month   | $100/year (17% savings) | Full code completion + Copilot Chat + CLI + multi-file editing       |
| **Pro+** | $39/mo      | -                       | Full model access + **1,500 premium requests/mo** + Overage $0.04/mo |

**Instructions for use**:

- **Free Limitation**: basic code completion, limited Chat function
- **Pro Features**: Full Copilot functionality, including code completion, Chat, CLI
- **Pro+ Credit**: 1,500 premium requests per month (with more powerful model)
- **Overage billing**: The excess amount of Pro+ will be charged at **$0.04/time**
- **Refresh Period**: Reset every month by subscription date

### Supported AI models (2026)

| Model classification | Specific model                     | Description                            |
| -------------------- | ---------------------------------- | -------------------------------------- |
| **OpenAI**           | **GPT 5.2**, o3, o4-mini           | OpenAI latest inference model          |
| **Anthropic**        | **Claude 4.5** (Sonnet/Opus/Haiku) | Claude's latest high-performance model |
| **Google**           | **Gemini Pro 3**                   | Google's latest inference model        |

> **Note**: Model availability is dynamically adjusted based on the cooperation agreement between GitHub and each AI provider. Some premium models require a Pro+ subscription.

### Team Subscription Plan

| Package        | Price            | Minimum number of people | Core functions                                                                                                    |
| -------------- | ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Business**   | $19/person/month | -                        | Pro features + Management console + Organizational strategy + Data training + Usage statistics                    |
| **Enterprise** | $39/person/month | -                        | Business All + SSO single sign-on + Audit log + Private deployment + Dedicated support + Compliance certification |

**Business/Enterprise Extras**:

- **Admin Console**: Centrally manage user licenses and policies
- **Single Sign-On (SSO)**: Supports SAML 2.0 and SCIM
- **Data Privacy**: Commitment not to use enterprise code to train models
- **Usage Statistics**: Detailed usage reporting and analysis
- **Compliance Certification**: SOC 2, ISO 27001 and other certifications

### Technical features

| Features              | Description                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Supported IDEs**    | VS Code, Visual Studio, JetBrains full series, Vim/Neovim                                     |
| **Copilot Chat**      | Interactive conversational programming that supports codebase-level contextual understanding  |
| **Copilot CLI**       | Command line tool, can be used directly in the terminal                                       |
| **Copilot Workspace** | AI-driven development environment that supports a complete workflow from requirements to code |

### Reference link

- [GitHub Copilot official pricing page](https://github.com/features/copilot/plans)
- [GitHub Copilot official documentation](https://docs.github.com/en/copilot/get-started/plans)
- [AI models supported by GitHub Copilot](https://docs.github.com/zh/copilot/reference/ai-models/supported-models)
- [GitHub Copilot request billing instructions](https://docs.github.com/en/copilot/concepts/billing/copilot-requests)
- [GitHub Copilot Pricing Guide 2026](https://userjot.com/blog/github-copilot-pricing-guide-2025)

---

## Solutions that require US nodes

> **Note**: The following solutions are **not directly accessible** in mainland China and require US nodes or overseas agents.

### Option 3: Cursor IDE ❌ Requires US node

### Reason for selection

**Cursor** is the most mature AI native IDE currently on the market. It is based on the VS Code fork and deeply integrates AI capabilities:

- **AI native experience**: specially designed for AI programming, not in the form of plug-ins, for a smoother experience
- **Predictive completion**: 5-10 lines of code can be predicted, and the completion quality is industry-leading
- **Cross-file refactoring**: Supports project-level code understanding and refactoring
- **Agent Mode**: Background Agent can automatically complete complex tasks in the background
- **Ecological Improvement**: v1.0/v1.1 adds BugBot review and Memory capabilities
- **Market Position**: Valuation $9.9 billion, annualized revenue $500 million
- **⚠️ Domestic restrictions**: Access from mainland China requires a stable network environment

### Personal Subscription Plan

| Package   | Monthly fee (monthly payment) | Monthly fee (annual payment) | Core quota                                                      |
| --------- | ----------------------------- | ---------------------------- | --------------------------------------------------------------- |
| **Hobby** | Free                          | Free                         | Basic features, limited AI model access                         |
| **Pro**   | $20/month                     | ~$16/month (20% savings)     | About 500 fast premium requests/month, including $20 API credit |
| **Pro+**  | $60/month                     | -                            | 3x all model usage credits, including $70 API credit            |
| **Ultra** | $200/month                    | -                            | 20x all model usage quota, including $400 API quota             |

**Instructions for use**:

- **Fast Requests**: Pro plan ~500 fast requests per month
- **Slow Requests**: Automatically switch to slow requests after exceeding the limit, no limit on the number of times
- **Refresh Period**: Reset every month based on the subscription date (if you subscribe on the 15th, it will reset on the 15th of each month)
- **Partial Restoration**: A small amount of credit may be restored within 5-24 hours after the credit is exhausted

### Team Subscription Plan

| Package        | Price              | Core Functions                                                                                                                |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Teams**      | $40/person/month   | All Pro features + SSO single sign-on + Management console + Usage analytics + Organization-wide privacy model + RBAC         |
| **Enterprise** | Customized pricing | Full Teams functionality + SCIM user provisioning + Data not used for training + Dedicated support + More enterprise features |

**Teams minimum requirements**: No clear minimum number of people required

### Reference link

- [Cursor official pricing page](https://cursor.com/pricing)
- [Cursor Teams Pricing Details](https://cursor.com/docs/account/teams/pricing)
- [Cursor Enterprise Edition Introduction](https://cursor.com/enterprise)

---

### Option 4: Claude Code ❌ requires US nodes

### Reason for selection

**Claude Code** is a CLI tool launched by Anthropic that can be seamlessly integrated with existing development environments:

- **Top Code Ability**: Claude Opus 4.5 excels in programming benchmarks
- **CLI tool**: Interact with AI through the command line without changing existing IDE habits
- **Deep Code Understanding**: Can handle large code bases, supports cross-file refactoring and code review
- **MCP protocol support**: Extensible connection to various tools and data sources
- **Cost Effectiveness**: High quality programming assistance at a relatively low price
- **⚠️ Domestic restrictions**: Anthropic has been banned for Chinese users

### Personal Subscription Plan

| Package     | Monthly fee (monthly payment) | Monthly fee (annual payment)  | Core quota                                                           |
| ----------- | ----------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| **Pro**     | $20/month                     | $17/month (pay $200 annually) | About 5x free usage, priority queue                                  |
| **Max 5x**  | $100/month                    | -                             | 5x Pro credit, estimated 140-280 hours Sonnet 4/week                 |
| **Max 20x** | $200/month                    | -                             | 20x Pro quota, about 900 messages/5 hours or 200-800 prompts/5 hours |

**Instructions for use**:

- **Refresh period**: 5 hour rolling window
- **Weekly Limits**: Weekly limits introduced from 28 August 2024
- **Overage processing**: After reaching the limit, you can choose to upgrade or wait for refresh

### Team Subscription Plan

| Package             | Price                              | Minimum number of people | Core functions                                                                       |
| ------------------- | ---------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| **Team (Standard)** | $30/person/month (monthly payment) |
| **Team (Premium)**  | $150/person/month                  | 5 people                 | Standard all + Premium priority queue + higher quota + audit log                     |
| **Enterprise**      | Contact Sales                      | -                        | Enterprise-grade features + DPA/BAA contract + Dedicated support + Custom deployment |

### Reference link

- [Claude official pricing page](https://claude.com/pricing)
- [Claude Code User Guide](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)

---

### Option 5: OpenAI Codex (ChatGPT) ❌ Requires US node

### Reason for selection

**OpenAI Codex** has been integrated into the ChatGPT subscription, providing industry-leading code generation capabilities:

- **GPT 5.2 model**: The latest generation model, with industry-leading code generation capabilities
- **o3/o4-mini inference model**: optimized for complex programming and inference
- **Deep Integration**: Full coverage of ChatGPT web version, CLI, and API
- **Code Interpreter**: executable code for data analysis
- **Mature Ecology**: The most complete plug-in system and the most extensive support for third-party tools
- **Multi-modal capabilities**: Supports multiple input methods such as images, audio, etc.

> **Note**: The original independent Codex API has been integrated into the GPT-5 model family and is no longer provided separately.

### Personal Subscription Plan

| Package  | Monthly Fee | Core Quota                                                                                              |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| **Free** | Free        | GPT 5.2: About 10 items/5 hours                                                                         |
| **Plus** | $20/month   | GPT 5.2: 160 items/3 hours<br>o3-mini: 150 items/day<br>o3: 100 items/week<br>o4-mini: 300 items/day    |
| **Pro**  | $200/month  | Claims "unlimited messages" + GPT 5.2 Pro<br> Faster image generation + Maximum in-depth research quota |

**Instructions for use**:

- **Free refresh period**: 5 hour rolling window
- **Plus refresh period**: 3-hour rolling window (GPT 5.2), some models are calculated on a daily/weekly basis
- **Pro Note**: Officially advertised as "unlimited", but users report that they may still encounter limitations

### Team Subscription Plan

| Package        | Price                              | Minimum number of people           | Core functions                                                          |
| -------------- | ---------------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| **Team**       | $30/person/month (monthly payment) |
| **Business**   | $25-30/person/month                | -                                  | Team All + Management Console + SSO + Data Analysis                     |
| **Enterprise** | Contact Sales                      | Typically starts at 100-150 people | Enterprise Compliance + DPA/BAA + Private Endpoints + Dedicated Support |

**Team/Business Extras**:

- Management console and user management
- Single sign-on (SSO)
- Data is not used for training guarantee
  -Team collaboration space
- Use analytics and reporting

### API pricing (pay-as-you-go)

To use Codex capabilities via the API:

| Model            | Input Token       | Cache Input        | Output Token       |
| ---------------- | ----------------- | ------------------ | ------------------ |
| **GPT 5.2-mini** | $0.25 / 1M tokens | $0.025 / 1M tokens | $1.00 / 1M tokens  |
| **GPT 5.2**      | $1.75 / 1M tokens | $0.175 / 1M tokens | $14.00 / 1M tokens |

**New user benefits**: New API accounts can get $5 free credit (approximately 4 million GPT 5.2 tokens)

### Reference link

- [ChatGPT official pricing page](https://chatgpt.com/pricing)
- [ChatGPT Pro Plan](https://chatgpt.com/plans/pro/)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI Pricing Description](https://platform.openai.com/docs/pricing)
- [ChatGPT usage restrictions](https://northflank.com/blog/chatgpt-usage-limits-free-plus-enterprise)
- [OpenAI Codex Pricing Guide](https://userjot.com/blog/openai-codex-pricing)
- [GPT-5.2 Pricing Description](https://www.glbgpt.com/hub/chatgpt-5-2-price-guide-2025/)

---

## Comparative summary of five major plans

### Price comparison (personal version)

| Plan               | Entry price                                 | Intermediate price  | Advanced price       | Refresh cycle |
| ------------------ | ------------------------------------------- | ------------------- | -------------------- | ------------- |
| **AWS Kiro**       | 50 points/month + 500 bonus for first month | $20/month (Pro)     | $200/month (Power)   | Monthly reset |
| **GitHub Copilot** | $10/month (Pro)                             | $39/month (Pro+)    | -                    | Monthly Reset |
| **Cursor**         | $20/month (Pro)                             | $60/month (Pro+)    | $200/month (Ultra)   | Monthly reset |
| **Claude Code**    | $20/month (Pro)                             | $100/month (Max 5x) | $200/month (Max 20x) | 5 hours/week  |
| **OpenAI Codex**   | $20/month (Plus)                            | -                   | $200/month (Pro)     | 3-5 hours     |

### Price Comparison (Team Edition)

| Plan               | Team Price          | Minimum Number of People | Enterprise Edition                            |
| ------------------ | ------------------- | ------------------------ | --------------------------------------------- |
| **AWS Kiro**       | -                   | **20 people**            | Customization                                 |
| **GitHub Copilot** | $19/person/month    | -                        | $39/person/month                              |
| **Cursor**         | $40/person/month    | No specific requirements | Customized                                    |
| **Claude**         | $25-30/person/month | **5 persons**            | Customized                                    |
| **OpenAI**         | $25-30/person/month | **2 people**             | Customized (usually starting from 100 people) |

### Refresh cycle comparison

| Solution           | Personal Edition Refresh | Team Edition Refresh | Features                                |
| ------------------ | ------------------------ | -------------------- | --------------------------------------- |
| **AWS Kiro**       | Monthly reset            | Monthly reset        | Supports $0.04/credit overage billing   |
| **GitHub Copilot** | Monthly Reset            | Monthly Reset        | Pro+ Overage $0.04/time                 |
| **Cursor**         | Monthly Reset            | Monthly Reset        | May partially recover within 5-24 hours |
| **Claude**         | 5 hours/week             | 5 hours/week         | Shortest window period                  |
| **OpenAI**         | 3-5 hours                | 3-5 hours            | Plus 3 hours, Free 5 hours              |

### Domestic availability comparison

| Solution           | Domestic direct access | Requires US node | Description                                                      |
| ------------------ | ---------------------- | ---------------- | ---------------------------------------------------------------- |
| **AWS Kiro**       | ✅                     | ❌               | Accessible through AWS China Region, but subject to policy risks |
| **GitHub Copilot** | ✅                     | ❌               | Direct access                                                    |
| **Cursor**         | ❌                     | ✅               | US node or agent required                                        |
| **Claude Code**    | ❌                     | ✅               | US node or agent required                                        |
| **OpenAI Codex**   | ❌                     | ✅               | US node or agent required                                        |

### Selection suggestions

**Choose AWS Kiro if**:

- **Located in China**, hope to use it without an agent
- Prefer Spec-Driven development model
  -Team already using the AWS ecosystem
- Requires enterprise-grade reliability and data compliance
- Can accept the risk of potential policy changes

**Select GitHub Copilot if**:

- Be accustomed to using IDEs such as VS Code/JetBrains
- Requires the most mature and stable AI coding tools
- If the budget is limited, the price of $10-39/month is more attractive
- The team has made extensive use of the GitHub ecosystem
- Requires enterprise-level compliance and support

**Select Cursor if**:

- Want to use AI native IDE and don’t want to mess with plug-ins
- Requires predictive code completion and cross-file refactoring
- The team needs a unified IDE environment and management
- Budget $20-200/month is acceptable
- Have a stable overseas network environment

**Select Claude Code if**:

- Already used to existing IDE (VS Code/JetBrains) and don’t want to switch
- Requires top code understanding and review skills
- Want to interact with AI via CLI
- Requires frequent processing of large code bases
- Have a stable overseas network environment

**Select OpenAI Codex if**:

- Requires the latest inference models such as GPT-5.2/o3
- Requires multi-modal capabilities (image, audio)
- Requires Code Interpreter for data analysis
- Requires API to access custom applications
- Have a stable overseas network environment

---

## Appendix: Anthropic Company Shareholders and Financing Information

### Company background

**Anthropic** is an American AI security company founded in 2021 by Dario Amodei and Daniela Amodei. The company was formerly a core member of OpenAI, and later developed independently to focus on AI security research. Anthropic launches the Claude family of AI models, including Haiku, Sonnet, and Opus.

### Financing process and valuation

#### Latest Funding (January 2026)

| Financing round | Amount          | Valuation        | Lead investor                               | Status            |
| --------------- | --------------- | ---------------- | ------------------------------------------- | ----------------- |
| **Series G**    | **$10 billion** | **$350 billion** | **GIC** (Singapore’s sovereign wealth fund) | Under negotiation |

#### Historical major financing

| Time           | Round           | Amount                                          | Valuation    | Major Investors                     |
| -------------- | --------------- | ----------------------------------------------- | ------------ | ----------------------------------- |
| September 2025 | Series F        | $13 billion                                     | $183 billion | Lightspeed, Fidelity, and more      |
| 2024           | Multiple rounds | Cumulative total of approximately $170+ billion | -            | Google, Amazon, Spark Capital, etc. |
| 2023           | -               | $4 billion (Amazon Investment)                  | -            | Amazon                              |
| 2023           | -               | $2 billion (invested by Google)                 | -            | Google                              |

**Cumulative funding**: At least **$40 billion** (approximately 14 rounds of financing)

### Major shareholders and investors

#### Institutional Investors

| Investor                           | Type                            | Investment Round/Amount                          |
| ---------------------------------- | ------------------------------- | ------------------------------------------------ |
| **GIC**                            | Singapore Sovereign Wealth Fund | Leading Series G (under negotiation)             |
| **Lightspeed Venture Partners**    | Venture Capital                 | Series F Lead Investment                         |
| **Fidelity Management & Research** | Asset Management                | Multi-round Investment                           |
| **Google (Alphabet)**              | Strategic investor              | $2 billion + multiple rounds                     |
| **Amazon**                         | Strategic investor              | $4 billion investment, cloud service cooperation |
| **Spark Capital**                  | Venture Capital                 | Early and Subsequent Rounds                      |
| **Menlo Ventures**                 | Venture Capital                 | Early Stage Investors                            |

#### Strategic Cooperation

- **Amazon AWS**: Anthropic selects AWS as its primary cloud service provider, with Amazon investing $4 billion in total
- **Google Cloud**: Google invests in and provides cloud infrastructure support

### Financial expectations

| Indicators                    | Data                                                    |
| ----------------------------- | ------------------------------------------------------- |
| **2025 ARR expectations**     | $9 billion                                              |
| **2026 Revenue Expectations** | $20-26 billion                                          |
| **Growth**                    | Approximately 13-28% growth expected over 3-year period |

### Listing plan

According to multiple media reports:

- **IPO window**: could be as early as **end 2026** or 2027
- **Place of Listing**: Expected to be listed on the U.S. public market
- **Current Status**: Preparations for listing have begun

### Reference link

- [Anthropic seeks $10 billion in funding, valued at $350 billion - The New York Times](https://www.nytimes.com/2026/01/07/technology/anthropic-funding-valuation.html)
- [Anthropic raises $10 billion at $350 billion valuation - Wall Street Journal](https://www.wsj.com/tech/ai/anthropic-raising-10-billion-at-350-billion-value-62af49f4)
- [Anthropic targets massive funding round at $350 billion valuation - Yahoo Finance](https://finance.yahoo.com/news/anthropic-eyes-350-billion-valuation-190120429.html)
- [Anthropic plans to raise $10 billion at $350 billion valuation - Seeking Alpha](https://seekingalpha.com/news/4537469-anthropic-plans-to-raise-10b-at-350b-valuation)
- [Anthropic seeks $10 billion in funding, valued at $350 billion - SiliconANGLE](https://siliconangle.com/2026/01/07/anthropic-reportedly-seeking-raise-10b-350-billion-valuation/)
- [Anthropic Company Introduction - Wikipedia](https://en.wikipedia.org/wiki/Anthropic)
- [Anthropic Equity Investment Guide - TSG Invest](https://tsginvest.com/anthropic-pbc/)

---

> **Last updated**: January 2026
>
> **Note**: The above price and quota information may change over time, please refer to the official page. For the latest information, please visit each plan’s official pricing page. Anthropic's financing information is based on public media reports, and actual data is subject to the company's official disclosure.
