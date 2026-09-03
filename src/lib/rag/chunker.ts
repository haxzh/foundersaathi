import type { RagChunk } from "./ragTypes";

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

export function chunkText(
    text: string,
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_CHUNK_OVERLAP
): RagChunk[] {
    const cleaned = text.trim();

    if (!cleaned) {
        return [];
    }

    if (chunkSize <= 0) {
        throw new Error(
            "chunkSize must be greater than 0"
        );
    }

    if (overlap < 0 || overlap >= chunkSize) {
        throw new Error(
            "overlap must be >= 0 and smaller than chunkSize"
        );
    }

    const paragraphs = cleaned
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    const chunks: RagChunk[] = [];

    let current = "";

    const addChunk = (content: string) => {
        const normalized = content.trim();

        if (!normalized) {
            return;
        }

        chunks.push({
            content: normalized,
            chunkIndex: chunks.length,
        });
    };

    for (const paragraph of paragraphs) {
        if (!current) {
            if (paragraph.length <= chunkSize) {
                current = paragraph;
                continue;
            }

            // Handle a single paragraph larger than chunkSize.
            let start = 0;

            while (start < paragraph.length) {
                const end = Math.min(
                    start + chunkSize,
                    paragraph.length
                );

                const piece = paragraph
                    .slice(start, end)
                    .trim();

                addChunk(piece);

                if (end >= paragraph.length) {
                    break;
                }

                start = Math.max(
                    end - overlap,
                    start + 1
                );
            }

            current = "";
            continue;
        }

        const candidate = `${current}\n\n${paragraph}`;

        if (candidate.length <= chunkSize) {
            current = candidate;
            continue;
        }

        addChunk(current);

        const overlapText =
            current.length > overlap
                ? current.slice(-overlap)
                : current;

        current = `${overlapText}\n\n${paragraph}`.trim();

        // If overlap + paragraph itself is too large,
        // split it in the next iteration.
        if (current.length > chunkSize) {
            let start = 0;

            while (start < current.length) {
                const end = Math.min(
                    start + chunkSize,
                    current.length
                );

                const piece = current
                    .slice(start, end)
                    .trim();

                addChunk(piece);

                if (end >= current.length) {
                    break;
                }

                start = Math.max(
                    end - overlap,
                    start + 1
                );
            }

            current = "";
        }
    }

    if (current.trim()) {
        addChunk(current);
    }

    return chunks;
}