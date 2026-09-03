type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= MAX_REQUESTS) {
        return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
    }
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
}
