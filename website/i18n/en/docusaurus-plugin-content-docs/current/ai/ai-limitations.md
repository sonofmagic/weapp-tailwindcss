---
sidebar: aiSidebar
title: Common shortcomings and flaws of AI
description: 'Treat the model as an unstable external dependency: first clarify human responsibilities, approval and review processes, and then let AI enter the critical path; leave enough budget for monitoring, evaluation, resilience and manual support to ensure that "people are the decision-makers and AI is the tool."'
keywords:
  - AI programming
  - LLM
  - Workflow
  - AI
  - Common shortcomings and flaws
  - ai limitations
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Common shortcomings and flaws of AI

## Data and knowledge level

- Training data is not traceable: the source is opaque, updates are not reproducible, and it is difficult to audit and supervise (for example: medical conversation data is mixed with forum content, and erroneous suggestions cannot be held accountable).
- Lack of timeliness: Answers tend to reference outdated information and are insensitive to real-time data and trends (for example: when asked about the latest interest rates or CVE, last year's data is still returned).
- Illusions of fact: lack of verifiable references, fictitious numbers, documents, and code are still common (e.g., fabricated paper titles, fabricated npm package versions or interface fields).
- Field imbalance: weak support for Chinese, minority languages, professional terms, dialects and long-tail formats (for example: references to traditional Chinese medicine prescriptions and legal provisions are often misplaced, and Cantonese/dialect instructions are misunderstood).
- Prejudice and stereotypes: Discrimination in historical data is amplified, and cross-regional/industry use can easily conflict with local regulations and culture (for example: job recommendation is biased towards gender stereotypes, violating local fair recruitment regulations).
- Retrieval dependence: RAG quality is affected by index aging, noise and sparsity, and the factuality cannot be solved once and for all (for example: the index is not refreshed, resulting in the product document being revised but the answer still points to the old parameters).

## Model and algorithm limitations

- Probability is regarded as certainty: the lack of confidence expression makes it difficult to handle high-risk scenarios in a hierarchical manner (for example: medical Q&A treats low-probability diagnosis as a definite conclusion).
- Long text is fragile: the context window is limited, early constraints are easily forgotten, and the reasoning chain is broken (for example: the previous exemption clause was missed in contract review).
- Insufficient multi-modal decision-making: There is a lack of robust decision-making logic when images and texts conflict, and new attack surfaces appear frequently (for example: the text in the image says "No Smoking" but the model answers "Smoking is allowed" based on the image scene).
- Weak in logical/numerical/physical reasoning: low-level mistakes are often made in multi-step causality, quantity conservation, and spatial reasoning (for example: confusing units and non-conservation of quantities when calculating pipeline capacity).
- Fine-tuning and drift: Directional fine-tuning is easily contaminated by dirty data, old capabilities are forgotten, and new behaviors are difficult to predict (for example: changing safe replies to sensitive output after adding a small amount of dirty data).
- Weak explanation: It is difficult to provide causal chain and traceability evidence, and the audit and compliance costs are high (for example: the reason for risk control rejection cannot be traced to specific characteristics or rules).

## System and engineering stability

- Output fluctuations and delays: service jitters and occasional crashes, making it difficult to meet SLA and resilience requirements (for example: response jitters from 1s to 20s+ during peak periods).
- Unstable format: Structured output often deviates from the protocol and requires a lot of post-processing and manual verification (for example: JSON is agreed upon but mixed with natural language or missing fields).
- Tools/function calls are fragile: abnormal returns, timeouts, and current limiting can easily cause the model to fall into an infinite loop or empty responses (for example: retrying without an upper limit causes an API avalanche).
- Uncontrollable costs: lengthy contexts, retries, and plug-in calls are superimposed, and bills often exceed expectations (for example: a customer service conversation costs dozens of times the estimated cost due to multiple retrievals and retries).
- Resource and supply chain risks: Tight GPU/TPU supply or restricted weight compliance will bring down the overall service quality (for example: sudden computing power preemption leads to a spike in latency).
- Insufficient monitoring and traceability: There is a lack of online evaluation, automatic alarms and replayable data, and problems are mostly exposed through user complaints (for example: production error formats have not been discovered for several consecutive hours).
- High risk of code execution: If the scripts generated or run by AI are not isolated, they may modify the global configuration or even delete the disk accidentally (for example: not running the installation script in the sandbox causes `rm -rf /` to accidentally delete the server data).

## Security, Confrontation and Privacy

- Prompt injection and unauthorized access: system prompt leakage, adversarial samples and fancy bypasses are still efficient (for example: the user obtains background tool call instructions by "ignoring previous instructions").
- Privacy leakage: Sensitive information may be exposed in model memory input, logs and answers (for example: repeating the mobile phone number or order number in the previous work order).
- Values and ethical red lines: Security policies are prone to failure in multiple regions/industries, and output may still hit red lines (for example: sensitive topics in unblocked regions or industry compliance restricted areas).
- Weak permissions and session isolation: multi-user contexts are mixed, and there is a risk of cross-session leakage (for example: historical chat content of other users is referenced during multi-person collaboration).
- Lack of security baseline: lack of disaster recovery, downgrade and circuit breaker strategies, prone to avalanche when abnormality occurs (for example: upstream retrieval downtime makes the overall dialogue unavailable, and there is no downgrade answer).

## Productization and Operational Challenges

- Weak demand clarification ability: When encountering vague requests, they rarely ask proactively and tend to give long and vague answers (for example: the user asked "make an event page" but did not ask about the goals, budget, equipment channels).
- User experience drift: The answers to the same question change greatly with time, status or minor wording, making it difficult to operate stably (for example: FAQ outputs different price strategies multiple times in a day).
- High labor costs: Prompt word engineering, dialogue state management and post-processing require continuous manual investment (for example: system prompt needs to be continuously adjusted to maintain JSON output).
- Slow feedback loop closure: Negative feedback is difficult to absorb quickly, the model iteration cycle is long, and online repairs lag behind (for example: it takes many weeks after a user reports an error to enter the new version weight).
- Difficulty in rule alignment: The model does not understand business KPIs, call costs or current limiting strategies, which can easily trigger additional costs or risks (for example: ignoring call limits and repeatedly triggering paid APIs leads to bill explosions).

## Typical high-risk scenarios

- Medical, Financial, Legal: Factual illusion, outdated information and bias can directly impact compliance and personal/property safety (e.g. giving medication recommendations that do not comply with local guidelines; citing obsolescence clauses).
- Industrial control, autonomous driving, energy scheduling: unstable reasoning under delay, jitter and boundary conditions makes it difficult to meet safety requirements (for example: normal instructions are still output despite abnormal sensor data).
- Content review, public opinion and recommendation: Bias, adversarial samples and format instability will amplify omissions or false positives in the review (for example: adversarial samples bypass violent terrorist text detection).
- Code and configuration generation: Ignore runtime dependencies, version compatibility and security baselines, which may introduce vulnerabilities (for example: the generated dependencies have known CVEs, or the configuration is not authenticated).
- Customer service and multiple rounds of dialogue: Accumulation of errors, lack of self-correction and clarification, easy to form error chains (for example: misunderstanding of an order number once and subsequent use of error context throughout the process).

## The leading role of people and the principle of implementation

- Humans determine the process, and machines assist: The key steps are to first define the human decision-making process, and AI only does drafting, comparison, or retrieval; humans are responsible for the final decision-making and signature (for example: humans determine the rating form for bidding, and AI only initially screens bids).
- Clarify the role of "human supervision": designate responsible persons to review high-risk outputs (medical/financial/legal/autonomous driving/safety changes), and establish double review or pair review (for example: medical reports need to be signed by both the attending and the quality control person, and the AI draft is for reference only).
- PICC access, machine-based suggestions: Let AI give options rather than execute them directly. Approval, ordering, pushing, publishing, scheduling and other actions must be manually confirmed (for example: AI generates discount plans, and operations must manually confirm before going online).
- Human-controlled knowledge, machine-based citation: The knowledge base is maintained by humans with version and effective date. AI can only reference it and is not allowed to add or delete on its own; the update process requires manual acceptance and traceback labeling (for example: the customer service FAQ is reviewed by the knowledge administrator and then put online, and the effective date is marked).
- Human-verified security, machine-run process: security policies, desensitization rules, and compliance templates are formulated by humans; AI output must pass human-set verification (format, terminology, sensitive words, regional compliance) (for example: code generation must pass security scanning rules written by humans before it can be submitted).
- Man-managed costs, machine-limited quotas: Cost budgets, quotas and retry upper limits are configured by humans. AI calls are limited. If limits are exceeded, they will be directly downgraded or terminated (for example: when daily retrieval calls exceed the quota, it will automatically switch to summary mode and notify the person in charge).
- Humans clarify and machines converge: For fuzzy requirements, humans or pre-questionnaires first clarify the core parameters, and then let AI generate them; avoid AI making its own assumptions (for example: for event page requirements, first collect budget and channels, and then let AI produce a draft of the page).
- Indicators set by humans and measured by machines: business KPIs, security thresholds, and interpretability requirements are defined by humans; AI needs to output confidence/citation/traceability data for human review (for example: the risk control model needs to be attached with confidence and citation rules, and the auditor decides whether to reject it).
- People set the iteration pace: online feedback, red team results, and false positive/negative statistics are reviewed by humans to decide whether to update prompt words, search indexes, or model versions (for example: reviewing high-risk conversations every week, and manually deciding whether to switch to a new model).

## Response suggestions (brief)

- Data: Perform source auditing, debiasing and timeliness refresh, and search links to monitor recall/fine ranking quality (for example: rebuild the index every week and manually check medical entries).
- Model: Provide confidence or self-assessment, limit long context dependencies, and conduct special evaluations for key tasks (for example: financial report Q&A needs to demonstrate confidence and pass special calculation examples).
- System: Add circuit breaker, downgrade and retry upper limit, force structured output verification, and establish online monitoring and traceback (for example: when the tool call times out, it will downgrade to a static answer and record the replay log).
- Security: Regular red team, update the adversarial sample library, isolate system prompts and user input, protect logs and privacy (for example: monthly red team pull through prompt injection use cases, update filtering policies).
- Operation: standardized prompts and templates, AB/grayscale release, fast rollback channel, establishment of feedback closed loop and labeling system (for example: new customer service prompts to grayscale 5% of traffic first, and rollback immediately if exceptions occur).

Treat the model as an unstable external dependency: first clarify human responsibilities, approval and review processes, and then let AI enter the critical path; leave enough budget for monitoring, evaluation, resilience and manual support to ensure that "people are the decision-makers and AI is the tool."
