import { createClient } from "@/lib/supabase/server";
import { generateQueryEmbedding } from "./embeddings";
import { recordRagSearch } from "./observability";

export type RagSearchOptions = {
    threshold?: number;
    limit?: number;
    documentType?: string | null;
    userId?: string | null;
};

export type RagSearchResult = {
    id: string;
    documentId: string;
    content: string;
    similarity: number;
    metadata: Record<string, unknown> | null;

    title: string;
    sourceUrl: string | null;
    author: string | null;
    company: string | null;
    documentType: string | null;
};

const DEFAULT_THRESHOLD = 0.32;
const DEFAULT_LIMIT = 8;

/*
 * We retrieve more candidates than we finally return.
 * The reranker gets a larger candidate pool and then
 * selects the strongest results.
 */
const RERANK_CANDIDATE_LIMIT = 24;

/*
 * Common words which do not provide much ranking signal.
 */
const STOP_WORDS = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "to",
    "of",
    "in",
    "on",
    "for",
    "and",
    "or",
    "with",
    "how",
    "what",
    "why",
    "when",
    "where",
    "can",
    "could",
    "should",
    "would",
    "do",
    "does",
    "did",
    "me",
    "my",
    "your",
    "you",
    "ka",
    "ke",
    "ki",
    "ko",
    "kya",
    "hai",
    "hain",
    "ho",
    "se",
    "par",
    "me",
    "main",
    "aur",
    "ya",
    "ek",
    "ye",
    "yeh",
    "batao",
    "chahiye",
]);

const RAG_INTENT_TERMS = [
    "startup", "founder", "founders", "customer", "customers",
    "mvp", "product market fit", "pmf", "traction", "growth",
    "scale", "scaling", "funding", "fund", "seed", "investor",
    "investment", "vc", "venture", "safe", "cofounder", "co-founder",
    "engineer", "team", "hiring", "hire", "revenue", "mrr", "cac",
    "retention", "churn", "airbnb", "saas", "product", "go to market",
    "gtm", "pricing", "discovery", "validation", "launch", "market",
    "burn", "runway", "pitch", "sales", "distribution", "users",
    "customer discovery", "first customers", "case study"
];

function isLikelyRagQuestion(question: string): boolean {
    const normalized = normalizeText(question);
    return RAG_INTENT_TERMS.some((term) =>
        normalized.includes(normalizeText(term))
    );
}

function clampThreshold(value: number): number {
    if (!Number.isFinite(value)) {
        return DEFAULT_THRESHOLD;
    }

    return Math.min(
        Math.max(value, 0),
        1
    );
}

function clampLimit(value: number): number {
    if (!Number.isFinite(value)) {
        return DEFAULT_LIMIT;
    }

    return Math.min(
        Math.max(Math.floor(value), 1),
        20
    );
}

/**
 * Normalize text for lexical matching.
 */
function normalizeText(
    text: string
): string {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Convert text into meaningful tokens.
 */
function tokenize(
    text: string
): string[] {
    const normalized =
        normalizeText(text);

    if (!normalized) {
        return [];
    }

    return normalized
        .split(" ")
        .filter(
            (token) =>
                token.length >= 2 &&
                !STOP_WORDS.has(token)
        );
}

/**
 * Calculate lexical overlap between query
 * and candidate content.
 *
 * Returns a value between 0 and 1.
 */
function lexicalOverlapScore(
    query: string,
    content: string
): number {
    const queryTokens =
        new Set(
            tokenize(query)
        );

    const contentTokens =
        new Set(
            tokenize(content)
        );

    if (
        queryTokens.size === 0 ||
        contentTokens.size === 0
    ) {
        return 0;
    }

    let matches = 0;

    for (const token of queryTokens) {
        if (
            contentTokens.has(token)
        ) {
            matches++;
        }
    }

    return matches /
        queryTokens.size;
}

/**
 * Check whether meaningful query words
 * appear in the document title.
 *
 * Title matches receive an additional
 * ranking signal.
 */
function titleMatchScore(
    query: string,
    title: string
): number {
    const queryTokens =
        new Set(
            tokenize(query)
        );

    const titleTokens =
        new Set(
            tokenize(title)
        );

    if (
        queryTokens.size === 0 ||
        titleTokens.size === 0
    ) {
        return 0;
    }

    let matches = 0;

    for (const token of queryTokens) {
        if (
            titleTokens.has(token)
        ) {
            matches++;
        }
    }

    return matches /
        queryTokens.size;
}

/**
 * Re-rank hybrid search results.
 *
 * Hybrid search gives us semantic + keyword
 * relevance. This second stage adds a
 * lightweight lexical relevance signal.
 *
 * Final score:
 *
 * 75% hybrid similarity
 * 20% content lexical overlap
 * 5% title match
 */
function rerankResults(
    question: string,
    results: RagSearchResult[]
): RagSearchResult[] {
    const scored =
        results.map(
            (result) => {
                const semanticScore =
                    Number.isFinite(
                        result.similarity
                    )
                        ? Math.max(
                            0,
                            Math.min(
                                result.similarity,
                                1
                            )
                        )
                        : 0;

                const contentScore =
                    lexicalOverlapScore(
                        question,
                        result.content
                    );

                const titleScore =
                    titleMatchScore(
                        question,
                        result.title
                    );

                const rerankScore =
                    semanticScore * 0.75 +
                    contentScore * 0.20 +
                    titleScore * 0.05;

                return {
                    result,
                    rerankScore,
                };
            }
        );

    scored.sort(
        (a, b) => {
            if (
                b.rerankScore !==
                a.rerankScore
            ) {
                return (
                    b.rerankScore -
                    a.rerankScore
                );
            }

            return (
                b.result.similarity -
                a.result.similarity
            );
        }
    );

    return scored.map(
        (item) =>
            item.result
    );
}

/**
 * Remove duplicate content while keeping
 * the strongest matching result.
 */
function deduplicateResults(
    results: RagSearchResult[]
): RagSearchResult[] {
    const seenContent =
        new Set<string>();

    const uniqueResults:
        RagSearchResult[] = [];

    for (const result of results) {
        const normalizedContent =
            result.content
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");

        if (
            seenContent.has(
                normalizedContent
            )
        ) {
            continue;
        }

        seenContent.add(
            normalizedContent
        );

        uniqueResults.push(
            result
        );
    }

    return uniqueResults;
}


async function keywordFallbackSearch(
    question: string,
    limit: number,
    documentType: string | null,
    userId: string | null
): Promise<RagSearchResult[]> {
    const supabase = await createClient();
    const tokens = tokenize(question)
        .filter((token) => token.length >= 3)
        .slice(0, 6);

    if (tokens.length === 0) return [];

    const orParts = tokens.flatMap((token) => [
        `content.ilike.%${token.replace(/[%_,]/g, " ")}%`,
        `metadata->>title.ilike.%${token.replace(/[%_,]/g, " ")}%`,
    ]);

    const { data, error } = await (supabase as any)
        .from("rag_chunks")
        .select("id, document_id, content, metadata")
        .or(orParts.join(","))
        .limit(Math.min(limit * 4, 40));

    if (error) {
        console.error("RAG keyword fallback error:", error);
        return [];
    }

    const results: RagSearchResult[] = (data ?? []).map((item: any) => {
        const metadata = (item.metadata ?? {}) as Record<string, any>;
        const title = String(metadata.title ?? "Untitled");
        const sourceUrl = metadata.source_url ?? null;
        const author = metadata.author ?? null;
        const company = metadata.company ?? null;
        const documentTypeValue = metadata.document_type ?? documentType ?? null;
        const lexical = lexicalOverlapScore(question, `${title} ${item.content}`);
        return {
            id: String(item.id),
            documentId: String(item.document_id),
            content: String(item.content),
            similarity: Math.min(0.8, 0.45 + lexical * 0.35),
            metadata,
            title,
            sourceUrl,
            author,
            company,
            documentType: documentTypeValue,
        };
    });

    return rerankResults(question, deduplicateResults(results)).slice(0, limit);
}

/**
 * Hybrid + Reranked RAG Search
 *
 * Pipeline:
 *
 * 1. Generate query embedding
 * 2. Hybrid semantic + keyword retrieval
 * 3. Retrieve a larger candidate pool
 * 4. Remove duplicate chunks
 * 5. Lightweight reranking
 * 6. Return final top results
 */
export async function searchRag(
    question: string,
    options: RagSearchOptions = {}
): Promise<RagSearchResult[]> {
    const startedAt = Date.now();
    const normalizedQuestion = question.trim();

    if (!normalizedQuestion) {
        return [];
    }

    const threshold = clampThreshold(
        options.threshold ?? DEFAULT_THRESHOLD
    );

    const limit = clampLimit(
        options.limit ?? DEFAULT_LIMIT
    );

    const documentType =
        options.documentType?.trim() || null;

    // Avoid spending embedding quota on clearly unrelated questions.
    if (!isLikelyRagQuestion(normalizedQuestion)) {
        await recordRagSearch({
            userId: options.userId ?? null,
            query: normalizedQuestion,
            resultCount: 0,
            latencyMs: Date.now() - startedAt,
            threshold,
            limit,
            status: "skipped_non_rag",
        });
        return [];
    }

    try {
        let queryEmbedding: number[];
        try {
            queryEmbedding = await generateQueryEmbedding(normalizedQuestion);
        } catch (embeddingError) {
            console.warn("RAG embedding unavailable; using keyword fallback.", embeddingError);
            const fallback = await keywordFallbackSearch(
                normalizedQuestion,
                limit,
                documentType,
                options.userId ?? null
            );
            await recordRagSearch({
                userId: options.userId ?? null,
                query: normalizedQuestion,
                resultCount: fallback.length,
                latencyMs: Date.now() - startedAt,
                threshold,
                limit,
                status: fallback.length ? "success" : "error",
                errorMessage: fallback.length ? undefined : (embeddingError instanceof Error ? embeddingError.message : String(embeddingError)),
            });
            return fallback;
        }

        const supabase = await createClient();

        const candidateLimit = Math.min(
            Math.max(limit * 3, limit),
            RERANK_CANDIDATE_LIMIT
        );

        const { data, error } = await supabase.rpc(
            "hybrid_search_rag_chunks",
            {
                query_embedding: queryEmbedding,
                query_text: normalizedQuestion,
                match_threshold: threshold,
                match_count: candidateLimit,
                filter_document_type: documentType,
            }
        );

        if (error) {
            console.error("Hybrid RAG search error:", error);
            throw new Error(error.message);
        }

        const rawResults: RagSearchResult[] = (data ?? [])
            .map((item: any) => ({
                id: item.id,
                documentId: item.document_id,
                content: item.content,
                similarity: Number(item.similarity),
                metadata: item.metadata ?? null,
                title: item.title,
                sourceUrl: item.source_url ?? null,
                author: item.author ?? null,
                company: item.company ?? null,
                documentType: item.document_type ?? null,
            }))
            .filter(
                (result: RagSearchResult) =>
                    Number.isFinite(result.similarity) &&
                    result.similarity >= threshold
            );

        const uniqueResults = deduplicateResults(rawResults);
        const rerankedResults = rerankResults(
            normalizedQuestion,
            uniqueResults
        );

        let finalResults = rerankedResults.slice(0, limit);

        // If semantic retrieval is too strict or returns nothing, use a safe lexical fallback.
        if (finalResults.length === 0) {
            finalResults = await keywordFallbackSearch(
                normalizedQuestion,
                limit,
                documentType,
                options.userId ?? null
            );
        }

        await recordRagSearch({
            userId: options.userId ?? null,
            query: normalizedQuestion,
            resultCount: finalResults.length,
            latencyMs: Date.now() - startedAt,
            threshold,
            limit,
            status: "success",
        });

        return finalResults;
    } catch (error) {
        await recordRagSearch({
            userId: options.userId ?? null,
            query: normalizedQuestion,
            resultCount: 0,
            latencyMs: Date.now() - startedAt,
            threshold,
            limit,
            status: "error",
            errorMessage:
                error instanceof Error ? error.message : String(error),
        });

        throw error;
    }
}
