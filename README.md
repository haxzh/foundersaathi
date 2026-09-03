# 🚀 FounderSaathi

> **Your AI Founder Companion** — an AI-powered workspace for startup founders to think through business problems using conversational AI, persistent conversations, founder memory, and a case-study-powered **Hybrid RAG** knowledge base.

<p align="center">
  <strong>Think clearly. Decide faster. Build better.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-TypeScript-blue?logo=react" alt="React + TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/RAG-Hybrid%20Search-purple" alt="Hybrid RAG" />
</p>

---

## ✨ What is FounderSaathi?

FounderSaathi is designed around real founder problems rather than generic chatbot conversations.

It helps with:

- 🎯 Startup decision-making
- 📈 Growth and customer acquisition
- 💡 MVP and product decisions
- 🤝 Co-founder decisions
- 💰 Fundraising
- 👥 Hiring
- 🧠 Founder-specific context and memory
- 📚 Startup case-study knowledge

The product combines a conversational AI interface with persistent chat history, memory, and a **hybrid vector + keyword RAG pipeline**.

---

## 🌟 Features

### 💬 AI Founder Chat
A focused conversational experience for startup questions.

Example prompts:

```text
My growth has stalled.
CAC is too high.
Should I hire my first engineer?
My co-founder and I disagree.
How should I find my first 10 customers?
```

### 🗂️ Persistent Conversations
- Recent chats
- Conversation history
- Individual conversation loading
- New chat creation
- Persistent conversation IDs

### 🧠 Founder Memory
A memory layer stores useful founder context so future conversations can be more relevant.

### 📚 Case-Study RAG
Relevant knowledge can be retrieved from the startup knowledge base before generating an answer.

### 🔎 Hybrid Search
Retrieval combines:
1. Semantic/vector similarity
2. PostgreSQL full-text keyword search
3. Hybrid ranking inside PostgreSQL

### 🛡️ Reliability
The RAG/embedding layer includes input validation, dimension validation, rate-limit detection, retries, and batch document embeddings.

---

# 🧠 Architecture

```text
Founder
   │
   ▼
Next.js + React Chat UI
   │
   ▼
/api/chat
   │
   ├──────────────► Gemini AI
   │
   ├──────────────► Conversation History
   │
   ├──────────────► Founder Memory
   │
   └──────────────► RAG Retrieval
                         │
                         ▼
                  Query Embedding
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Vector Search          Keyword Search
              │                     │
              └──────────┬──────────┘
                         ▼
                  Hybrid Ranking
                         │
                         ▼
                  Relevant Chunks
                         │
                         ▼
                    AI Context
                         │
                         ▼
                    Final Answer
```

---

# 📚 RAG Pipeline

```text
Knowledge Document
       ↓
Text Cleaning
       ↓
Chunking
       ↓
Gemini Embedding
       ↓
Supabase / PostgreSQL + pgvector
       ↓
Hybrid Retrieval
       ↓
Ranked Context
       ↓
FounderSaathi AI
```

### Embedding model

```text
gemini-embedding-001
```

Configured output dimensionality:

```text
768
```

Document and query embeddings use separate retrieval task types:

```text
RETRIEVAL_DOCUMENT
RETRIEVAL_QUERY
```

---

# 🗄️ Database

The RAG knowledge base uses PostgreSQL with vector support.

Main tables:

```text
rag_documents
rag_chunks
```

Documents store metadata such as:

```text
title
source_url
author
company
published_at
document_type
description
```

Chunks store:

```text
document_id
chunk_index
content
embedding
metadata
created_at
```

The database also contains PostgreSQL functions for RAG retrieval.

---

# 🧪 RAG Evaluation

FounderSaathi includes RAG smoke/evaluation testing.

### Relevant examples

```text
Early stage startup me customer discovery kaise karni chahiye?
Startup ke first 10 customers kaise la sakte hain?
Minimum viable product kaise build karna chahiye?
Startup me product market fit kaise identify karein?
Seed funding raise karne ke liye kya karna chahiye?
Startup me SAFE kya hota hai?
```

### Irrelevant examples

```text
Mere laptop me Bluetooth kaise connect karu?
Delhi ka weather aaj kaisa hai?
Python me list ko reverse kaise karte hain?
Windows me screenshot kaise lete hain?
```

Expected behavior:

```text
Relevant startup question → RAG match
Unrelated question        → No RAG match
```

This helps reduce irrelevant retrieval.

---

# 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js App Router API Routes |
| Database | PostgreSQL |
| Database Platform | Supabase |
| Vector Search | pgvector |
| Authentication | Supabase Auth |
| AI | Google Gemini |
| Embeddings | `gemini-embedding-001` |
| Retrieval | Hybrid Vector + Keyword |
| Package Manager | npm |
| Development | Turbopack |

---

# 📁 Project Structure

```text
foundersaathi/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   ├── memory/
│   │   │   ├── rag/
│   │   │   │   ├── ingest/
│   │   │   │   └── search/
│   │   │   └── health/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── memory/
│   │   ├── onboarding/
│   │   ├── signup/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── lib/
│   │   ├── ai/
│   │   ├── memory/
│   │   ├── profile/
│   │   ├── rag/
│   │   │   ├── chunker.ts
│   │   │   ├── embeddings.ts
│   │   │   ├── ingestion.ts
│   │   │   ├── ragTypes.ts
│   │   │   ├── retrieval.ts
│   │   │   └── textCleaner.ts
│   │   └── supabase/
│   └── types/
│
├── public/
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd foundersaathi
```

## 2. Install

```bash
npm install
```

## 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

If the project uses additional server-only Supabase credentials, configure them according to the server client implementation.

> ⚠️ Never commit `.env.local`, API keys, service-role keys, or other secrets.

---

# ▶️ Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Validate the production build:

```bash
npm run build
```

Then:

```bash
npm start
```

A successful build should complete TypeScript checking, page generation, and optimization without errors.

---

# 🔌 API Routes

| Endpoint | Purpose |
|---|---|
| `POST /api/chat` | Main AI founder conversation |
| `GET /api/chat/history` | Recent conversation history |
| `GET /api/chat/history/:id` | Load a conversation |
| `GET/POST /api/memory` | Founder memory operations |
| `POST /api/rag/search` | Hybrid RAG retrieval |
| `POST /api/rag/ingest` | Add knowledge to RAG |
| `GET /api/health` | Application health check |

### RAG search example

```json
{
  "question": "How can an early-stage startup find its first customers?",
  "threshold": 0.72,
  "limit": 8
}
```

---

# 🔐 Security

FounderSaathi uses authenticated server-side operations and Supabase.

Production security checklist:

- [ ] Never expose service-role keys in client code
- [ ] Keep secrets in environment variables
- [ ] Keep `.env.local` out of Git
- [ ] Verify authenticated users server-side
- [ ] Review Supabase RLS policies
- [ ] Validate API input
- [ ] Avoid exposing internal database errors
- [ ] Avoid exposing embeddings/similarity scores to users
- [ ] Add production rate limiting
- [ ] Monitor third-party AI quotas

---

# ⚡ Performance & Reliability

Embedding APIs have external quota/rate limits.

Production improvements should include:

- Query embedding cache
- Rate limiting
- Request deduplication
- Retry/backoff
- Timeouts
- Retrieval latency monitoring
- Gemini quota monitoring
- Database indexes
- Appropriate retrieval limits

A local success does not imply unlimited production API capacity.

---

# 🎨 Product Philosophy

FounderSaathi is built around:

```text
Problem
   ↓
Context
   ↓
Knowledge
   ↓
Reasoning
   ↓
Decision
   ↓
Action
```

The goal is not simply to give founders more information.

The goal is to help them **think through decisions clearly and turn them into practical next steps.**

---

# 📈 Production Launch Checklist

## Application

- [ ] Production build passes
- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Chat works
- [ ] Chat history works
- [ ] New chat works
- [ ] Memory works
- [ ] RAG search works
- [ ] RAG ingestion works
- [ ] Health endpoint works

## RAG

- [ ] High-quality knowledge base
- [ ] Correct chunking
- [ ] Correct embedding dimensions
- [ ] Hybrid search verified
- [ ] Relevant-query retrieval verified
- [ ] Irrelevant-query rejection verified
- [ ] Evaluation suite stable
- [ ] Gemini quota monitored

## Security

- [ ] No secrets committed
- [ ] RLS reviewed
- [ ] Server-only credentials protected
- [ ] API authentication verified
- [ ] Input validation verified
- [ ] Error responses reviewed

## Deployment

- [ ] Production environment variables configured
- [ ] Authentication redirect URLs configured
- [ ] Database verified
- [ ] Health endpoint verified
- [ ] Production chat tested
- [ ] Production RAG tested
- [ ] Monitoring configured
- [ ] Backup/recovery plan considered

---

# 🗺️ Roadmap

### Core

- [x] AI founder chat
- [x] Authentication
- [x] Persistent conversations
- [x] Founder memory
- [x] RAG ingestion
- [x] Text cleaning
- [x] Chunking
- [x] Gemini embeddings
- [x] Vector retrieval
- [x] Hybrid retrieval
- [x] RAG evaluation
- [x] Health endpoint
- [x] Production build validation
- [x] Clean user-facing RAG experience

### Future

- [ ] Embedding cache
- [ ] Advanced rate limiting
- [ ] RAG observability dashboard
- [ ] Automated evaluation reports
- [ ] Larger founder case-study knowledge base
- [ ] Production monitoring
- [ ] Advanced onboarding
- [ ] Founder analytics
- [ ] Multi-tenant organizations
- [ ] Billing/subscriptions

---

# 🛠️ Development Workflow

```text
Make change
    ↓
Test locally
    ↓
Run RAG evaluation
    ↓
npm run build
    ↓
git status
    ↓
git add .
    ↓
git commit
    ↓
git push
    ↓
Deploy
    ↓
Production test
```

Useful commands:

```bash
npm run dev
npm run build
npm start

git status
git add .
git commit -m "Update FounderSaathi"
git push origin main
```

---

# 🤝 Contributing

1. Create a feature branch:

```bash
git checkout -b feature/my-feature
```

2. Make your changes.

3. Validate:

```bash
npm run build
```

4. Commit and push:

```bash
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
```

5. Open a Pull Request.

---

# 📄 License

Choose and add a license before publishing the project publicly.

For example:

```text
MIT License
```

---

# 🚀 FounderSaathi

**FounderSaathi — AI Founder Companion**

Built to help founders move from:

```text
Confusion
    ↓
Context
    ↓
Better reasoning
    ↓
Clear decision
    ↓
Action
```

<p align="center">
  <strong>🚀 Build with clarity.</strong>
</p>
