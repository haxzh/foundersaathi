# FounderSaathi Production RAG Pack

## Apply
1. Back up the project.
2. Copy the `src/` files from this pack into the matching paths.
3. Run `supabase/migrations/20260901_production_rag.sql` once in Supabase SQL Editor.
4. Add the variables from `ENV_ADDITIONS.txt`.
5. Restart Next.js.
6. Run:
   npm run build

## What this pack changes
- Persistent embedding cache for query/document embeddings.
- Retry/backoff remains for Gemini rate limits.
- RAG query intent gate prevents unrelated questions from consuming embedding quota.
- Lower default retrieval threshold with lexical reranking.
- RAG search observability without storing raw user questions.
- Server-only RAG ingestion using the Supabase service role.
- Production ingestion secret.
- Removes the internal RAG fallback sentence from the user-facing prompt.
- Removes similarity from the model's RAG context.
- Removes direct authenticated INSERT/DELETE access to RAG tables.

## Important
The existing `hybrid_search_rag_chunks` RPC is intentionally not replaced automatically because its exact SQL definition was not supplied. The diagnostic query is included in the migration file.

After applying this pack, run the 20-test evaluation again. Tests 4 and 5 are still dependent on the actual case-study documents and the existing RPC ranking; if they remain false, the next fix should be data/RPC-specific rather than another blind threshold change.
