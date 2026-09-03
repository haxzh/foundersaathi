import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    searchRag,
    type RagSearchOptions,
} from "@/lib/rag/retrieval";

export async function POST(
    request: NextRequest
) {
    try {
        const supabase =
            await createClient();

        const {
            data: { user },
            error: userError,
        } =
            await supabase.auth.getUser();

        if (
            userError ||
            !user
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body =
            await request.json();

        const question =
            typeof body.question ===
                "string"
                ? body.question.trim()
                : "";

        if (!question) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "question is required",
                },
                {
                    status: 400,
                }
            );
        }

        const options:
            RagSearchOptions = {
            threshold:
                typeof body.threshold ===
                    "number"
                    ? body.threshold
                    : 0.42,

            limit:
                typeof body.limit ===
                    "number"
                    ? body.limit
                    : 8,

            documentType:
                typeof body.documentType ===
                    "string"
                    ? body.documentType.trim() || null
                    : null,

            userId: user.id,
        };

        const results =
            await searchRag(
                question,
                options
            );

        return NextResponse.json({
            success: true,

            query: question,

            matchFound:
                results.length > 0,

            resultCount:
                results.length,

            results,
        });
    } catch (error) {
        console.error(
            "RAG search API error:",
            error
        );

        const message =
            error instanceof Error ? error.message : String(error);

        const isRateLimited =
            /\\b429\\b/i.test(message) ||
            /quota exceeded/i.test(message) ||
            /resource.?exhausted/i.test(message) ||
            /rate.?limit/i.test(message);

        if (isRateLimited) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "RAG embedding quota is temporarily exhausted. Please retry shortly.",
                    code: "RAG_EMBEDDING_RATE_LIMITED",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "15",
                    },
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to search RAG knowledge.",
            },
            {
                status: 500,
            }
        );
    }
}