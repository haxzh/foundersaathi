"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Memory = {
    id: string;
    category: string;
    key: string;
    value: string;
    confidence: number | null;
    source: string | null;
    created_at: string;
    updated_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
    company: "Company",
    goal: "Goal",
    pain_point: "Pain Point",
    metric: "Metric",
    strategy: "Strategy",
    team: "Team",
    product: "Product",
    customer: "Customer",
    funding: "Funding",
    founder: "Founder",
    finance: "Finance",
    operations: "Operations",
};

function formatCategory(category: string) {
    if (CATEGORY_LABELS[category]) {
        return CATEGORY_LABELS[category];
    }

    return category
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatKey(key: string) {
    return key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
    try {
        return new Date(date).toLocaleString();
    } catch {
        return date;
    }
}

function getCategoryEmoji(category: string) {
    switch (category) {
        case "company":
            return "🏢";
        case "goal":
            return "🎯";
        case "pain_point":
            return "⚠️";
        case "metric":
            return "📊";
        case "strategy":
            return "🧠";
        case "team":
            return "👥";
        case "product":
            return "🚀";
        case "customer":
            return "👤";
        case "funding":
            return "💰";
        case "founder":
            return "👨‍💻";
        case "finance":
            return "💵";
        case "operations":
            return "⚙️";
        default:
            return "🧠";
    }
}

export default function MemoryPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadMemories = useCallback(async () => {
        try {
            setError("");

            const response = await fetch("/api/memory", {
                method: "GET",
                cache: "no-store",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Could not load memories."
                );
            }

            setMemories(
                Array.isArray(data?.memories)
                    ? data.memories
                    : []
            );
        } catch (error: any) {
            console.error("Memory loading error:", error);

            setError(
                error?.message || "Could not load memories."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadMemories();
    }, [loadMemories]);

    async function refreshMemories() {
        setRefreshing(true);
        await loadMemories();
    }

    async function deleteMemory(id: string) {
        const confirmed = window.confirm(
            "Delete this memory?\n\nFounderSaathi will no longer use this information in future conversations."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            const response = await fetch("/api/memory", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Could not delete memory."
                );
            }

            setMemories((current) =>
                current.filter((memory) => memory.id !== id)
            );
        } catch (error: any) {
            console.error("Memory delete error:", error);

            setError(
                error?.message || "Could not delete memory."
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">

                {/* HEADER */}
                <header className="mb-8">
                    <Link
                        href="/chat"
                        className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
                    >
                        <span>←</span>
                        <span>Back to chat</span>
                    </Link>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl">
                                    🧠
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        Founder Memories
                                    </h1>

                                    <p className="text-sm text-white/40">
                                        What FounderSaathi remembers about your startup
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-2xl text-sm leading-6 text-white/50">
                                FounderSaathi only saves useful and reasonably
                                stable startup information. You can review or
                                delete any saved memory whenever you want.
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={refreshMemories}
                                disabled={refreshing || loading}
                                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {refreshing ? "Refreshing..." : "↻ Refresh"}
                            </button>

                            <div className="min-w-[90px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center">
                                <div className="text-xl font-bold">
                                    {memories.length}
                                </div>

                                <div className="text-[11px] text-white/40">
                                    Memories
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-300">
                                Something went wrong
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-300/70">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={refreshMemories}
                            className="w-fit rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/10"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                        <div className="mb-3 text-3xl">🧠</div>

                        <p className="text-sm text-white/60">
                            Loading your memories...
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                            Getting your saved startup information
                        </p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && memories.length === 0 && !error && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center sm:p-14">
                        <div className="mb-5 text-5xl">
                            🧠
                        </div>

                        <h2 className="text-xl font-semibold">
                            No memories yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                            Start talking to FounderSaathi about your
                            company, goals, customers, team, product,
                            metrics or problems. Useful information can
                            become a memory.
                        </p>

                        <Link
                            href="/chat"
                            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                            Start a conversation
                        </Link>
                    </div>
                )}

                {/* MEMORY LIST */}
                {!loading && memories.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Saved information
                                </h2>

                                <p className="mt-1 text-xs text-white/35">
                                    Review what FounderSaathi remembers
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {memories.map((memory) => (
                                <article
                                    key={memory.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
                                >
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">

                                            {/* BADGES */}
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/65">
                                                    <span>
                                                        {getCategoryEmoji(
                                                            memory.category
                                                        )}
                                                    </span>

                                                    <span>
                                                        {formatCategory(
                                                            memory.category
                                                        )}
                                                    </span>
                                                </span>

                                                {memory.source && (
                                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/35">
                                                        Source:{" "}
                                                        {memory.source}
                                                    </span>
                                                )}

                                                {memory.confidence !== null &&
                                                    Number.isFinite(
                                                        memory.confidence
                                                    ) && (
                                                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/35">
                                                            {Math.round(
                                                                memory.confidence *
                                                                100
                                                            )}
                                                            % confidence
                                                        </span>
                                                    )}
                                            </div>

                                            {/* KEY */}
                                            <h3 className="text-base font-semibold text-white">
                                                {formatKey(memory.key)}
                                            </h3>

                                            {/* VALUE */}
                                            <p className="mt-2 break-words text-sm leading-6 text-white/70">
                                                {memory.value}
                                            </p>

                                            {/* DATE */}
                                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/25">
                                                <span>
                                                    Updated{" "}
                                                    {formatDate(
                                                        memory.updated_at
                                                    )}
                                                </span>

                                                {memory.created_at && (
                                                    <span>
                                                        Created{" "}
                                                        {formatDate(
                                                            memory.created_at
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* DELETE */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteMemory(memory.id)
                                            }
                                            disabled={
                                                deletingId === memory.id
                                            }
                                            className="w-full shrink-0 rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                                        >
                                            {deletingId === memory.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* INFORMATION NOTE */}
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex gap-3">
                        <div className="text-lg">
                            ℹ️
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-white/70">
                                How Founder Memory works
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-white/35">
                                FounderSaathi should not save every message.
                                Only information that is useful later,
                                reasonably stable, explicitly stated or
                                strongly supported, and relevant to your
                                startup should be saved.
                            </p>

                            <p className="mt-2 text-xs leading-5 text-white/35">
                                You remain in control. If you do not want
                                FounderSaathi to remember something, you can
                                delete that memory here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}