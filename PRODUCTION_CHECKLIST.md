# FounderSaathi production handoff

## Already hardened in this source
- Server-only Supabase admin client for RAG ingestion.
- Auth checks on chat, history, memory and RAG endpoints.
- RAG ingestion secret gate in production.
- Embedding cache and quota cooldown; repeated queries do not repeatedly hit Gemini in the same process.
- RAG falls back to lexical retrieval when embeddings are temporarily unavailable or semantic retrieval returns nothing.
- RAG retrieval telemetry stores a SHA-256 query hash instead of raw query text.
- Chat request length limit and per-user in-process rate limiting.
- RAG failures do not break normal chat.
- Next.js 16 proxy entry point refreshes Supabase sessions.

## Required environment variables
Set these in the deployment provider (never commit them):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- RAG_INGEST_SECRET

## Final external checks
1. Run `npm ci` and `npm run build`.
2. Apply/verify your existing Supabase RLS policies and the `hybrid_search_rag_chunks` function.
3. Ensure `rag_documents`, `rag_chunks`, and `rag_search_logs` exist with the columns used by the app.
4. Ingest real, licensed/authorized founder case-study material. Do not seed invented case studies.
5. Run the 20-test RAG evaluation after the knowledge base is populated.
6. Verify `/api/health` returns `ok: true` in production.
7. Test signup/login, chat, history, memory deletion, dashboard, RAG search and ingestion with a non-admin account.
8. Confirm the service-role key is only present server-side.

## Important
A clean TypeScript/Next.js build proves the source compiles; it does not prove that production Supabase schema/RLS, Gemini quotas, DNS, deployment secrets, or real knowledge-base coverage are correct. Those require the live environment.
