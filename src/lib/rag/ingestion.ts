import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "./textCleaner";
import { chunkText } from "./chunker";
import {
    generateDocumentEmbeddings,
} from "./embeddings";

import type {
    RagDocumentInput,
    RagIngestionResult,
} from "./ragTypes";

type RagDocumentRow = {
    id: string;
    title: string;
};

type RagChunkInsertRow = {
    document_id: string;
    chunk_index: number;
    content: string;
    embedding: number[];
    metadata: {
        title: string;
        source_url: string | null;
        author: string | null;
        company: string | null;
        document_type: string | null;
    };
};

/**
 * Ingest one knowledge-base document.
 *
 * Production rules:
 * - Uses the server-only service-role client.
 * - Cleans and chunks the document before embedding.
 * - Generates document embeddings in one Gemini request.
 * - Inserts the source document and all chunks.
 * - Deletes the source document if chunk insertion fails.
 *
 * The local `any` casts are intentional here because the project's
 * generated Supabase Database type currently does not expose the
 * RAG tables, causing Supabase's generic `.from()` type to resolve
 * to `never`.
 */
export async function ingestDocument(
    input: RagDocumentInput
): Promise<RagIngestionResult> {
    const title =
        input.title.trim();

    const originalContent =
        input.content.trim();

    if (!title) {
        throw new Error(
            "Document title is required."
        );
    }

    if (!originalContent) {
        throw new Error(
            "Document content is required."
        );
    }

    // -----------------------------------------
    // CLEAN DOCUMENT
    // -----------------------------------------

    const cleanedContent =
        cleanText(
            originalContent
        );

    if (!cleanedContent) {
        throw new Error(
            "Document has no usable content after cleaning."
        );
    }

    // -----------------------------------------
    // CHUNK DOCUMENT
    // -----------------------------------------

    const chunks =
        chunkText(
            cleanedContent
        );

    if (
        chunks.length === 0
    ) {
        throw new Error(
            "No chunks could be created from the document."
        );
    }

    console.log(
        `RAG ingestion: "${title}" → ${chunks.length} chunks`
    );

    // -----------------------------------------
    // SERVER-ONLY SUPABASE CLIENT
    // -----------------------------------------

    const supabase =
        createAdminClient();

    /*
     * The current project's Supabase generated
     * Database type does not contain the RAG tables.
     * Cast only these table operations instead of
     * weakening the entire project.
     */
    const db =
        supabase as any;

    // -----------------------------------------
    // CREATE SOURCE DOCUMENT
    // -----------------------------------------

    const {
        data: document,
        error: documentError,
    }: {
        data: RagDocumentRow | null;
        error: { message: string } | null;
    } =
        await db
            .from("rag_documents")
            .insert({
                title,

                source_url:
                    input.sourceUrl ??
                    null,

                author:
                    input.author ??
                    null,

                company:
                    input.company ??
                    null,

                published_at:
                    input.publishedAt ??
                    null,

                document_type:
                    input.documentType ??
                    null,

                description:
                    input.description ??
                    null,
            })
            .select(
                "id, title"
            )
            .single();

    if (
        documentError ||
        !document
    ) {
        console.error(
            "RAG document insert error:",
            documentError
        );

        throw new Error(
            documentError?.message ??
            "Failed to create RAG document."
        );
    }

    try {
        // -----------------------------------------
        // GENERATE ALL EMBEDDINGS IN ONE REQUEST
        // -----------------------------------------

        const embeddings =
            await generateDocumentEmbeddings(
                chunks.map(
                    (chunk) =>
                        chunk.content
                )
            );

        if (
            embeddings.length !==
            chunks.length
        ) {
            throw new Error(
                `Embedding count mismatch. Expected ${chunks.length}, received ${embeddings.length}.`
            );
        }

        // -----------------------------------------
        // BUILD SUPABASE ROWS
        // -----------------------------------------

        const rows:
            RagChunkInsertRow[] =
            chunks.map(
                (
                    chunk,
                    index
                ) => ({
                    document_id:
                        document.id,

                    chunk_index:
                        chunk.chunkIndex,

                    content:
                        chunk.content,

                    embedding:
                        embeddings[index],

                    metadata: {
                        title,

                        source_url:
                            input.sourceUrl ??
                            null,

                        author:
                            input.author ??
                            null,

                        company:
                            input.company ??
                            null,

                        document_type:
                            input.documentType ??
                            null,
                    },
                })
            );

        // -----------------------------------------
        // INSERT CHUNKS
        // -----------------------------------------

        const {
            error: chunksError,
        }: {
            error: { message: string } | null;
        } =
            await db
                .from("rag_chunks")
                .insert(rows);

        if (
            chunksError
        ) {
            console.error(
                "RAG chunks insert error:",
                chunksError
            );

            throw new Error(
                chunksError.message
            );
        }

        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        console.log(
            `RAG ingestion completed: "${title}" → ${rows.length} chunks`
        );

        return {
            documentId:
                document.id,

            title:
                document.title,

            chunksCreated:
                rows.length,
        };
    } catch (error) {
        // -----------------------------------------
        // CLEANUP ORPHAN DOCUMENT
        // -----------------------------------------

        const {
            error: cleanupError,
        }: {
            error: { message: string } | null;
        } =
            await db
                .from("rag_documents")
                .delete()
                .eq(
                    "id",
                    document.id
                );

        if (cleanupError) {
            console.error(
                "RAG orphan document cleanup error:",
                cleanupError
            );
        }

        throw error;
    }
}
