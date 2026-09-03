import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

type RagSearchLog = {
    userId: string | null;
    query: string;
    resultCount: number;
    latencyMs: number;
    threshold: number;
    limit: number;
    status: "success" | "error" | "skipped_non_rag";
    errorMessage?: string;
};

function getAdminSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) return null;

    return createSupabaseClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export async function recordRagSearch(log: RagSearchLog): Promise<void> {
    try {
        const supabase = getAdminSupabase();
        if (!supabase) return;

        const queryHash = createHash("sha256")
            .update(log.query.trim())
            .digest("hex");

        await supabase.from("rag_search_logs").insert({
            user_id: log.userId,
            query_hash: queryHash,
            result_count: log.resultCount,
            latency_ms: log.latencyMs,
            threshold: log.threshold,
            result_limit: log.limit,
            status: log.status,
            error_message: log.errorMessage ?? null,
        });
    } catch (error) {
        // Observability must never break RAG.
        console.error("RAG observability error:", error);
    }
}
