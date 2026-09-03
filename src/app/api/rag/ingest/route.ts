import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDocument } from "@/lib/rag/ingestion";
import type { RagDocumentInput } from "@/lib/rag/ragTypes";

export async function POST(
    request: NextRequest
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // In production, ingestion is an admin operation.
        const ingestSecret = process.env.RAG_INGEST_SECRET;
        if (
            process.env.NODE_ENV === "production" &&
            (!ingestSecret ||
                request.headers.get("x-rag-ingest-secret") !== ingestSecret)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Forbidden",
                },
                { status: 403 }
            );
        }

        const body =
            (await request.json()) as Partial<RagDocumentInput>;

        if (
            typeof body.title !== "string" ||
            !body.title.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "title is required",
                },
                { status: 400 }
            );
        }

        if (
            typeof body.content !== "string" ||
            !body.content.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "content is required",
                },
                { status: 400 }
            );
        }

        const result =
            await ingestDocument({
                title: body.title,
                content: body.content,

                sourceUrl:
                    body.sourceUrl ?? null,

                author:
                    body.author ?? null,

                company:
                    body.company ?? null,

                publishedAt:
                    body.publishedAt ?? null,

                documentType:
                    body.documentType ?? null,

                description:
                    body.description ?? null,
            });

        return NextResponse.json({
            success: true,
            message:
                "Document ingested successfully.",
            result,
        });
    } catch (error) {
        console.error(
            "RAG ingestion error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to ingest document.",
            },
            { status: 500 }
        );
    }
}