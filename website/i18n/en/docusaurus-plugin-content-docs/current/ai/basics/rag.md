---
sidebar: aiSidebar
title: RAG (Retrieval Augmentation Generation)
description: Systematically explains the RAG architecture, core processes, and implementation points to help you build a searchable and traceable AI knowledge question and answer system.
keywords:
  - AI programming
  - LLM
  - Workflow
  - RAG
  - Retrieval enhancement generation
  - ai
  - basics
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# RAG (retrieval enhancement generation)

## Overview

**RAG (Retrieval-Augmented Generation)** is a technical architecture that combines **Information Retrieval (Retrieval)** and **Generative AI (Generation)**. It allows large language models to first retrieve relevant information from external knowledge bases when generating answers, and then generate more accurate and timely answers based on the retrieved content.

> **Core Value**: Solve the knowledge lag and hallucination problems of LLM and let AI have a "plug-in knowledge base"

---

## Core concepts of RAG

### 1. Why RAG is needed

```
Problems with pure LLM:
├── Knowledge cutoff: training data has time boundaries
├──Illusion issue: may generate inaccurate content
├── Domain knowledge: Lack of private data in professional fields
└── Traceability: Unable to verify source of information

RAG solution:
├── Real-time knowledge: the latest information can be retrieved
├── Accuracy: generated based on real documents
├── Private data: can be accessed to the internal knowledge of the enterprise
└── Verifiable: Provide citations to information sources
```

### 2. RAG vs Fine-tuning

| Dimensions               | RAG                           | Fine-tuning                       |
| ------------------------ | ----------------------------- | --------------------------------- |
| **Knowledge Update**     | Real-time update              | Need to retrain                   |
| **Data source**          | External knowledge base       | Model weights                     |
| **Implementation Cost**  | Low                           | High                              |
| **Illusion Control**     | Good                          | Medium                            |
| **Domain Adaptation**    | Quick Adaptation              | Requires training data            |
| **Privacy and Security** | Data does not enter the model | Data is integrated into the model |
| **Applicable scenarios** | Knowledge query, Q&A          | Style adaptation, formatting      |

---

## How RAG works

### 1. Basic process

```
┌─────────────────────────────────────────────────────────────────┐
│ RAG Workflow │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ User Questions │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│ │ Vectorization (Embedding) │ │
│ │ problem → vector │ │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│ │ Similarity search │ │
│ │ Search in vector library │ │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│ │ Get related documents │ │
│ │Top-K results │ │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│ │ Prompt build │ │
│ │ Question + Document Context │ │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────┐                                           │
│ │ LLM generated answer │ │
│ │ Based on search content │ │
│  └─────────────────┘                                           │
│    │                                                            │
│    ▼                                                            │
│ Answers with quotes │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Key components

#### Vector Embedding (Embedding)

```
Text: "Artificial intelligence is a branch of computer science"
       │
       ▼
Vectorized models (such as OpenAI Embeddings)
       │
       ▼
Vector: [0.123, -0.456, 0.789, ...] (1536 dimensions)
```

#### Vector Database

| Database     | Features                      |
| ------------ | ----------------------------- |
| **Pinecone** | Hosted service, easy to use   |
| **Chroma**   | Lightweight, local deployment |
| **Qdrant**   | High performance, open source |
| **Milvus**   | Enterprise grade, scalable    |
| **Weaviate** | Supports multiple data types  |

#### Similarity calculation

```python
# Cosine similarity
similarity = cosine_similarity(query_vector, document_vector)

# Euclidean distance
distance = euclidean_distance(query_vector, document_vector)
```

---

## Implementation of RAG

### 1. Naive RAG (Basic RAG)

The simplest RAG implementation:

```python
# pseudocode
def naive_rag(query):
# 1. Vectorized query
    query_vector = embedding_model.encode(query)

# 2. Retrieve related documents
    docs = vector_db.search(query_vector, top_k=5)

# 3. Build Prompt
    prompt = f"""
Answer the question based on the following documentation:

    {docs}

Question:{query}
    """

# 4. Generate answers
    answer = llm.generate(prompt)
    return answer
```

### 2. Advanced RAG

Contains more optimization techniques:

```
┌─────────────────────────────────────────────────────────┐
│                    Advanced RAG                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Query Understanding │
│ ├── Query Rewriting (Query Rewriting) │
│ ├── Query Expansion │
│ ├── Query Routing │
│ └──Multi-Query │
│         ↓                                               │
│Hybrid Search │
│ ├── Vector Search (Semantic Search) │
│ ├── Keyword Search (Keyword Search) │
│ └── Result Fusion │
│         ↓                                               │
│Reranking │
│ └── Reorder using a more refined model │
│         ↓                                               │
│ Context Management │
│ ├── Long context compression │
│ └── Dynamically select relevant fragments │
│         ↓                                               │
│ Generate answer │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Modular RAG

Flexibly combinable RAG modules:

```
RAG module:
├── Search module
│ ├── Single search
│ ├── Recursive search
│ └── Hybrid search
├── Generate module
│ ├── Single generation
│ ├── Iterative generation
│ └── Step by step generation
└── Optimization module
├── Query optimization
├── Document optimization
└── Results optimization
```

---

## RAG’s optimization technology

### 1. Query optimization

#### Query rewriting

```python
# Original query
"How to use this function"

# After rewriting
"How do I use [specific feature name] of [product name]?"
```

#### Multiple queries

```python
# Generate multiple query variants
query_variants = [
"The Development History of Artificial Intelligence",
"AI Development History",
"The Origins of Machine Learning and Deep Learning"
]
# Merge results after parallel retrieval
```

#### Query routing

```python
def route_query(query):
    if is_code_question(query):
        return "code_kb_index"
    elif is_business_question(query):
        return "business_kb_index"
    else:
        return "general_kb_index"
```

### 2. Document optimization

#### Chunking strategy (Chunking)

```python
# Fixed size chunks
chunk_size = 512
overlap = 50

# Semantic chunking (by paragraph, chapter)
chunks = split_by_semantic_unit(document)

# Recursive chunking
chunks = recursive_split(document, max_length=1000)
```

#### Metadata enhancement

```python
{
"content": "Document content...",
    "metadata": {
        "source": "user_manual.pdf",
        "page": 15,
"chapter": "Installation Guide",
        "last_updated": "2024-01-15",
"author": "Technical Documentation Team"
    }
}
```

### 3. Search optimization

#### Mixed search

```python
# Combine vector search and keyword search
vector_results = vector_search(query, top_k=10)
keyword_results = bm25_search(query, top_k=10)

# Result fusion
final_results = reciprocal_rank_fusion(vector_results, keyword_results)
```

#### Reranking

```python
# Initial search
initial_results = vector_db.search(query, top_k=50)

# Use stronger model reordering
reranker = CrossEncoderReranker()
final_results = reranker.rerank(query, initial_results, top_k=10)
```

### 4. Generation optimization

#### Reference generation

```markdown
Answer based on the following and cite the source:

[Document 1] Our app supports iOS and Android...
[Document 2] The installation package size is about 50MB...
[Document 3] You need to register an account to use...

Question: What platforms does this app support?

Answer: The app is available on iOS and Android platforms [1].
```

####Self-RAG

```
Generate answer → Check for relevance → Check for support →
If not relevant/not supported → Retrieve → Regenerate
```

---

## Application scenarios of RAG

### 1. Enterprise knowledge base

```
Employee: "What is the company's reimbursement process?"
   ↓
RAG: [Retrieve from employee handbook, OA system documentation]
   ↓
Answer: "According to Chapter 5 of the Employee Handbook,
The reimbursement process is as follows: 1. Submit application 2. Supervisor approval..."
Source: employee-handbook.pdf, page 23
```

### 2. Customer Service

```
Customer: "How is the warranty on the product?"
   ↓
RAG: [Retrieve from product manual, after-sales policy]
   ↓
Answer: "This product comes with a 2-year warranty.
Warranty coverage includes..."
Source: warranty-policy.html
```

### 3. Code Assistant

```
Developer: "How to build this project with Webpack?"
   ↓
RAG: [Retrieved from project README, documentation]
   ↓
Answer: "According to the project documentation,
Just run pnpm build..."
Source: README.md, docs/build.md
```

### 4. Technical documentation Q&A

```
User: "How to use TailwindCSS in mini program?"
   ↓
RAG: [Retrieved from weapp-tailwindcss documentation]
   ↓
Answer: "In weapp-tailwindcss,
Configuration postcss.config.js..."
Source: docs/getting-started.md
```

---

## Evaluation indicators of RAG

### 1. Search quality

| Indicator       | Description                                   |
| --------------- | --------------------------------------------- |
| **Precision@K** | How many of the top K results are relevant    |
| **Recall@K**    | How many related documents were retrieved     |
| **MRR**         | Bottom ranking of the first relevant result   |
| **NDCG**        | Considers the relevance score of the location |

### 2. Build quality

| Indicator             | Description                                              |
| --------------------- | -------------------------------------------------------- |
| **Faithfulness**      | Whether the answer is consistent with the search content |
| **Answer Relevance**  | Whether the answer solves the problem                    |
| **Context Precision** | Whether the retrieved context is relevant                |
| **Context Recall**    | Whether all necessary information has been retrieved     |

### 3. End-to-end evaluation

```python
#RAG Assessment Framework Example
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

## FAQ for RAG

### 1. No relevant content found.

**reason**:

- Poor vector quality
- Improper chunking strategy
- Knowledge base content is missing

**solve**:

- Use better Embedding models
- Adjust tile size and overlap
- Supplement knowledge base content
- Use hybrid search

### 2. Inaccurate answer

**reason**:

- The search content is not relevant
- Long context leads to distraction
- Insufficient model understanding ability

**solve**:

- Improve search accuracy (reordering)
- Compression context
- Use stronger generative models

### 3. Answer missing citations

**reason**:

- Prompt is poorly designed
- Model does not follow instructions

**solve**:

- Explicitly require attribution of sources
- Use structured output
- Post-processing to add reference links

---

## RAG open source framework

### 1. LangChain

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

#Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)
```

### 2. LlamaIndex

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

#Create index
documents = SimpleDirectoryReader('data').load_data()
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("Question")
```

### 3. Haystack

```python
from haystack import Pipeline, Document
from haystack.nodes import BM25Retriever, FARMReader

#Create RAG Pipeline
retriever = BM25Retriever(document_store)
reader = FARMReader(model_name="deepset/roberta-base-squad2")

pipe = Pipeline()
pipe.add_node(retriever, name="Retriever", inputs=["Query"])
pipe.add_node(reader, name="Reader", inputs=["Retriever"])
```

### 4. FastRAG / RAGFlow

A lightweight framework focusing on RAG.

---

## RAG implementation list

### Data preparation

- [ ] Collect document data
- [ ] Cleaning and pretreatment
- [ ] select chunking strategy
- [ ] Add metadata

### Vectorization

- [ ] Select Embedding model
- [ ] select vector database
- [ ] Build vector index
- [ ] Test retrieval quality

### Prompt Design

- [ ] Design system prompt word
- [ ] defines the output format
- [ ] Add citation requirement
- [ ] handles no-result situations

### Evaluation optimization

- [ ] Prepare test data set
- [ ] Evaluate search quality
- [ ] Evaluate build quality
- [ ] iterative optimization

---

## Reference resources

### paper

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) - RAG original paper
- [Building RAG-based Applications with LangChain](https://blog.langchain.dev/building-a-full-rag-application-with-langchain/)

### tool

- [LangChain](https://langchain.com) - AI application development framework
- [LlamaIndex](https://llamaindex.ai) - data frame
- [Pinecone](https://pinecone.io) - Vector database
- [Qdrant](https://qdrant.tech) - Open source vector database

### Learning resources

- [RAG Tutorial](https://github.com/langchain-ai/rag-from-scratch)
- [Building RAG Applications](https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/)

---

**Document updated: December 2025**
