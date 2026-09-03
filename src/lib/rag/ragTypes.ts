export type RagDocumentInput = {
    title: string;
    content: string;

    sourceUrl?: string | null;
    author?: string | null;
    company?: string | null;
    publishedAt?: string | null;

    documentType?: string | null;
    description?: string | null;
};

export type RagChunk = {
    content: string;
    chunkIndex: number;
};

export type RagIngestionResult = {
    documentId: string;
    title: string;
    chunksCreated: number;
};