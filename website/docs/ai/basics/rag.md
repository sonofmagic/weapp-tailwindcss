---
sidebar: aiSidebar
title: RAG（检索增强生成）
---

# RAG（检索增强生成）

## 概述

**RAG (Retrieval-Augmented Generation)** 是一种结合了**信息检索（Retrieval）**和**生成式AI（Generation）**的技术架构。它让大语言模型在生成回答时，能够先从外部知识库中检索相关信息，然后基于检索到的内容生成更准确、更及时的回答。

> **核心价值**：解决 LLM 的知识滞后和幻觉问题，让 AI 拥有"外挂知识库"

---

## RAG 的核心概念

### 1. 为什么需要 RAG

```
纯 LLM 的问题:
├── 知识截止：训练数据有时间边界
├── 幻觉问题：可能生成不准确的内容
├── 领域知识：缺乏专业领域的私有数据
└── 可追溯性：无法验证信息来源

RAG 的解决:
├── 实时知识：可检索最新信息
├── 准确性：基于真实文档生成
├── 私有数据：可接入企业内部知识
└── 可验证：提供信息来源引用
```

### 2. RAG vs Fine-tuning

| 维度 | RAG | Fine-tuning（微调） |
| ---- | --- | ------------------- |
| **知识更新** | 实时更新 | 需要重新训练 |
| **数据来源** | 外部知识库 | 模型权重 |
| **实施成本** | 低 | 高 |
| **幻觉控制** | 好 | 中 |
| **领域适应** | 快速适应 | 需要训练数据 |
| **隐私安全** | 数据不进入模型 | 数据融入模型 |
| **适用场景** | 知识查询、问答 | 风格适应、格式化 |

---

## RAG 的工作原理

### 1. 基本流程

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG 工作流程                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户问题                                                        │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│  │  向量化 (Embedding) │                                          │
│  │  问题 → 向量      │                                           │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│  │  相似度检索      │                                           │
│  │  在向量库中搜索  │                                           │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│  │  获取相关文档    │                                           │
│  │  Top-K 结果     │                                           │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│  │  Prompt 构建     │                                           │
│  │  问题 + 文档上下文│                                           │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│  │  LLM 生成回答    │                                           │
│  │  基于检索内容    │                                           │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  带引用的回答                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 关键组件

#### 向量嵌入 (Embedding)

```
文本: "人工智能是计算机科学的一个分支"
       │
       ▼
   向量化模型 (如 OpenAI Embeddings)
       │
       ▼
向量: [0.123, -0.456, 0.789, ...]  (1536 维)
```

#### 向量数据库 (Vector Database)

| 数据库 | 特点 |
| ------ | ---- |
| **Pinecone** | 托管服务，易用 |
| **Chroma** | 轻量级，本地部署 |
| **Qdrant** | 高性能，开源 |
| **Milvus** | 企业级，可扩展 |
| **Weaviate** | 支持多种数据类型 |

#### 相似度计算

```python
# 余弦相似度
similarity = cosine_similarity(query_vector, document_vector)

# 欧氏距离
distance = euclidean_distance(query_vector, document_vector)
```

---

## RAG 的实现方式

### 1. Naive RAG（基础 RAG）

最简单的 RAG 实现：

```python
# 伪代码
def naive_rag(query):
    # 1. 向量化查询
    query_vector = embedding_model.encode(query)

    # 2. 检索相关文档
    docs = vector_db.search(query_vector, top_k=5)

    # 3. 构建 Prompt
    prompt = f"""
    基于以下文档回答问题：

    {docs}

    问题：{query}
    """

    # 4. 生成回答
    answer = llm.generate(prompt)
    return answer
```

### 2. Advanced RAG（高级 RAG）

包含更多优化技术：

```
┌─────────────────────────────────────────────────────────┐
│                    Advanced RAG                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  查询理解                                                │
│  ├── 查询重写 (Query Rewriting)                         │
│  ├── 查询扩展 (Query Expansion)                         │
│  ├── 查路由 (Query Routing)                             │
│  └── 多重查询 (Multi-Query)                             │
│         ↓                                               │
│  混合检索                                                │
│  ├── 向量检索 (Semantic Search)                         │
│  ├── 关键词检索 (Keyword Search)                        │
│  └── 结果融合 (Result Fusion)                           │
│         ↓                                               │
│  重排序 (Reranking)                                      │
│  └── 使用更精细的模型重新排序                            │
│         ↓                                               │
│  上下文管理                                              │
│  ├── 长上下文压缩                                        │
│  └── 动态选择相关片段                                    │
│         ↓                                               │
│  生成回答                                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Modular RAG（模块化 RAG）

可灵活组合的 RAG 模块：

```
RAG 模块:
├── 检索模块
│   ├── 单路检索
│   ├── 递归检索
│   └── 混合检索
├── 生成模块
│   ├── 单次生成
│   ├── 迭代生成
│   └── 分步生成
└── 优化模块
    ├── 查询优化
    ├── 文档优化
    └── 结果优化
```

---

## RAG 的优化技术

### 1. 查询优化

#### 查询重写

```python
# 原始查询
"怎么用这个功能"

# 重写后
"如何使用 [产品名称] 的 [具体功能名称]？"
```

#### 多重查询

```python
# 生成多个查询变体
query_variants = [
    "人工智能的发展历史",
    "AI 发展历程",
    "机器学习和深度学习的起源"
]
# 并行检索后合并结果
```

#### 查询路由

```python
def route_query(query):
    if is_code_question(query):
        return "code_kb_index"
    elif is_business_question(query):
        return "business_kb_index"
    else:
        return "general_kb_index"
```

### 2. 文档优化

#### 分块策略 (Chunking)

```python
# 固定大小分块
chunk_size = 512
overlap = 50

# 语义分块（按段落、章节）
chunks = split_by_semantic_unit(document)

# 递归分块
chunks = recursive_split(document, max_length=1000)
```

#### 元数据增强

```python
{
    "content": "文档内容...",
    "metadata": {
        "source": "user_manual.pdf",
        "page": 15,
        "chapter": "安装指南",
        "last_updated": "2024-01-15",
        "author": "技术文档团队"
    }
}
```

### 3. 检索优化

#### 混合检索

```python
# 结合向量检索和关键词检索
vector_results = vector_search(query, top_k=10)
keyword_results = bm25_search(query, top_k=10)

# 结果融合
final_results = reciprocal_rank_fusion(vector_results, keyword_results)
```

#### 重排序 (Reranking)

```python
# 初步检索
initial_results = vector_db.search(query, top_k=50)

# 使用更强的模型重排序
reranker = CrossEncoderReranker()
final_results = reranker.rerank(query, initial_results, top_k=10)
```

### 4. 生成优化

#### 引用生成

```markdown
根据以下内容回答，并标注引用来源：

[文档1] 我们app支持 iOS 和 Android...
[文档2] 安装包大小约为 50MB...
[文档3] 需要注册账户才能使用...

问题：这个应用支持哪些平台？

回答：该应用支持 iOS 和 Android 平台 [1]。
```

#### 自我修正 (Self-RAG)

```
生成回答 → 检查相关性 → 检查支持性 →
如果不相关/不支持 → 重新检索 → 重新生成
```

---

## RAG 的应用场景

### 1. 企业知识库

```
员工: "公司的报销流程是什么？"
   ↓
RAG: [从员工手册、OA系统文档中检索]
   ↓
回答: "根据《员工手册》第5章，
       报销流程如下：1.提交申请 2.主管审批..."
       来源: employee-handbook.pdf, page 23
```

### 2. 客户服务

```
客户: "产品如何保修？"
   ↓
RAG: [从产品手册、售后政策中检索]
   ↓
回答: "本产品提供2年质保，
       保修范围包括..."
       来源: warranty-policy.html
```

### 3. 代码助手

```
开发者: "这个项目怎么用 Webpack 构建？"
   ↓
RAG: [从项目 README、文档中检索]
   ↓
回答: "根据项目文档，
       运行 pnpm build 即可..."
       来源: README.md, docs/build.md
```

### 4. 技术文档问答

```
用户: "TailwindCSS 怎么在小程序中使用？"
   ↓
RAG: [从 weapp-tailwindcss 文档中检索]
   ↓
回答: "在 weapp-tailwindcss 中，
       配置 postcss.config.js..."
       来源: docs/getting-started.md
```

---

## RAG 的评估指标

### 1. 检索质量

| 指标 | 说明 |
| ---- | ---- |
| **Precision@K** | 前K个结果中有多少是相关的 |
| **Recall@K** | 所有相关文档中检索到了多少 |
| **MRR** | 第一个相关结果的倒数排名 |
| **NDCG** | 考虑位置的相关性评分 |

### 2. 生成质量

| 指标 | 说明 |
| ---- | ---- |
| **Faithfulness** | 回答是否与检索内容一致 |
| **Answer Relevance** | 回答是否解决了问题 |
| **Context Precision** | 检索的上下文是否相关 |
| **Context Recall** | 是否检索到了所有必要信息 |

### 3. 端到端评估

```python
# RAG 评估框架示例
from ragas import evaluate

results = evaluate(
    dataset=test_dataset,
    metrics=[
        "faithfulness",
        "answer_relevancy",
        "context_precision",
        "context_recall"
    ]
)
```

---

## RAG 的常见问题

### 1. 检索不到相关内容

**原因**：
- 向量质量差
- 分块策略不当
- 知识库内容缺失

**解决**：
- 使用更好的 Embedding 模型
- 调整分块大小和重叠
- 补充知识库内容
- 使用混合检索

### 2. 回答不准确

**原因**：
- 检索内容不相关
- 上下文过长导致注意力分散
- 模型理解能力不足

**解决**：
- 提高检索精度（重排序）
- 压缩上下文
- 使用更强的生成模型

### 3. 回答缺少引用

**原因**：
- Prompt 设计不当
- 模型未遵循指令

**解决**：
- 明确要求标注来源
- 使用结构化输出
- 后处理添加引用链接

---

## RAG 开源框架

### 1. LangChain

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

# 创建 RAG 链
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)
```

### 2. LlamaIndex

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

# 创建索引
documents = SimpleDirectoryReader('data').load_data()
index = VectorStoreIndex.from_documents(documents)

# 查询
query_engine = index.as_query_engine()
response = query_engine.query("问题")
```

### 3. Haystack

```python
from haystack import Pipeline, Document
from haystack.nodes import BM25Retriever, FARMReader

# 创建 RAG Pipeline
retriever = BM25Retriever(document_store)
reader = FARMReader(model_name="deepset/roberta-base-squad2")

pipe = Pipeline()
pipe.add_node(retriever, name="Retriever", inputs=["Query"])
pipe.add_node(reader, name="Reader", inputs=["Retriever"])
```

### 4. FastRAG / RAGFlow

专注于 RAG 的轻量级框架。

---

## RAG 实现清单

### 数据准备

- [ ] 收集文档数据
- [ ] 清洗和预处理
- [ ] 选择分块策略
- [ ] 添加元数据

### 向量化

- [ ] 选择 Embedding 模型
- [ ] 选择向量数据库
- [ ] 构建向量索引
- [ ] 测试检索质量

### Prompt 设计

- [ ] 设计系统提示词
- [ ] 定义输出格式
- [ ] 添加引用要求
- [ ] 处理无结果情况

### 评估优化

- [ ] 准备测试数据集
- [ ] 评估检索质量
- [ ] 评估生成质量
- [ ] 迭代优化

---

## 参考资源

### 论文

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) - RAG 原始论文
- [Building RAG-based Applications with LangChain](https://blog.langchain.dev/building-a-full-rag-application-with-langchain/)

### 工具

- [LangChain](https://langchain.com) - AI 应用开发框架
- [LlamaIndex](https://llamaindex.ai) - 数据框架
- [Pinecone](https://pinecone.io) - 向量数据库
- [Qdrant](https://qdrant.tech) - 开源向量数据库

### 学习资源

- [RAG Tutorial](https://github.com/langchain-ai/rag-from-scratch)
- [Building RAG Applications](https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/)

---

**文档更新时间：2025 年 12 月**
