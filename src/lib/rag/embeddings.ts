import { GoogleGenAI } from "@google/genai";
import { createHash } from "crypto";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const CACHE_TTL_MS = 15 * 60 * 1000;
const QUOTA_COOLDOWN_MS = 60 * 1000;
const MAX_RETRIES = 1;

export type EmbeddingTask =
    | "RETRIEVAL_DOCUMENT"
    | "RETRIEVAL_QUERY";

type CacheEntry = { values: number[]; expiresAt: number };
const embeddingCache = new Map<string, CacheEntry>();
let quotaBlockedUntil = 0;

function cacheKey(text: string, taskType: EmbeddingTask) {
    return `${taskType}:${createHash("sha256").update(text.trim()).digest("hex")}`;
}

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
    return new GoogleGenAI({ apiKey });
}

function validateEmbedding(values: number[] | undefined): number[] {
    if (!values || values.length === 0) {
        throw new Error("Gemini returned an empty embedding.");
    }
    if (values.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
            `Unexpected embedding dimension. Expected ${EMBEDDING_DIMENSIONS}, received ${values.length}.`
        );
    }
    return values;
}

function isRateLimitError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /\b429\b|RESOURCE_EXHAUSTED|Quota exceeded|requests_per_minute|rate.?limit/i.test(message);
}

function getCached(text: string, taskType: EmbeddingTask): number[] | null {
    const key = cacheKey(text, taskType);
    const entry = embeddingCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        embeddingCache.delete(key);
        return null;
    }
    return entry.values;
}

function setCached(text: string, taskType: EmbeddingTask, values: number[]) {
    embeddingCache.set(cacheKey(text, taskType), {
        values,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });
}

async function wait(ms: number) {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function embedOnce(texts: string[], taskType: EmbeddingTask): Promise<number[][]> {
    if (Date.now() < quotaBlockedUntil) {
        throw new Error("Embedding quota is temporarily unavailable. Use keyword retrieval fallback.");
    }

    const ai = getGeminiClient();
    const contents = texts.length === 1
        ? texts[0]
        : texts.map((text) => ({ parts: [{ text }] }));

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await ai.models.embedContent({
                model: EMBEDDING_MODEL,
                contents,
                config: {
                    taskType,
                    outputDimensionality: EMBEDDING_DIMENSIONS,
                },
            });

            const embeddings = result.embeddings ?? [];
            if (embeddings.length !== texts.length) {
                throw new Error(
                    `Gemini returned ${embeddings.length} embeddings for ${texts.length} inputs.`
                );
            }
            return embeddings.map((embedding, index) => {
                try {
                    return validateEmbedding(embedding.values);
                } catch (error) {
                    throw new Error(
                        `Invalid embedding for input ${index + 1}: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            });
        } catch (error) {
            if (!isRateLimitError(error)) throw error;
            quotaBlockedUntil = Date.now() + QUOTA_COOLDOWN_MS;
            if (attempt === MAX_RETRIES) throw error;
            await wait(1000);
        }
    }

    throw new Error("Failed to generate embeddings.");
}

export async function generateEmbedding(
    text: string,
    taskType: EmbeddingTask = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
    const cleaned = text.trim();
    if (!cleaned) throw new Error("Cannot generate embedding for empty text.");

    const cached = getCached(cleaned, taskType);
    if (cached) return cached;

    const [embedding] = await embedOnce([cleaned], taskType);
    setCached(cleaned, taskType, embedding);
    return embedding;
}

export async function generateDocumentEmbeddings(texts: string[]): Promise<number[][]> {
    const cleanedTexts = texts.map((text) => text.trim());
    if (cleanedTexts.length === 0) return [];
    if (cleanedTexts.some((text) => !text)) {
        throw new Error("Cannot generate embeddings for empty text.");
    }

    const results: Array<number[] | null> = cleanedTexts.map((text) =>
        getCached(text, "RETRIEVAL_DOCUMENT")
    );
    const missingIndexes = results
        .map((value, index) => (value ? -1 : index))
        .filter((index) => index >= 0);

    if (missingIndexes.length === 0) return results as number[][];

    const missingTexts = missingIndexes.map((index) => cleanedTexts[index]);
    const generated = await embedOnce(missingTexts, "RETRIEVAL_DOCUMENT");

    generated.forEach((embedding, i) => {
        const index = missingIndexes[i];
        results[index] = embedding;
        setCached(cleanedTexts[index], "RETRIEVAL_DOCUMENT", embedding);
    });

    return results as number[][];
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
    return generateEmbedding(text, "RETRIEVAL_QUERY");
}

export async function generateDocumentEmbedding(text: string): Promise<number[]> {
    return generateEmbedding(text, "RETRIEVAL_DOCUMENT");
}
