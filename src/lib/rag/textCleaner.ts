export function cleanText(input: string): string {
    if (!input) {
        return "";
    }

    let text = input;

    // Normalize line endings.
    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/\r/g, "\n");

    // Remove common HTML tags.
    text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
    text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
    text = text.replace(/<[^>]+>/g, " ");

    // Decode a few common HTML entities.
    text = text
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");

    // Remove URLs that are sitting alone in the text.
    text = text.replace(
        /https?:\/\/[^\s]+/gi,
        " "
    );

    // Remove common boilerplate lines.
    const boilerplatePatterns = [
        /^cookie policy$/i,
        /^privacy policy$/i,
        /^terms of service$/i,
        /^accept cookies$/i,
        /^subscribe$/i,
        /^sign up$/i,
        /^log in$/i,
        /^share this article$/i,
    ];

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter(
            (line) =>
                !boilerplatePatterns.some((pattern) =>
                    pattern.test(line)
                )
        );

    text = lines.join("\n");

    // Normalize excessive whitespace.
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/\n{3,}/g, "\n\n");

    return text.trim();
}