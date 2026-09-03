"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type HistoryMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
};

type Conversation = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

const suggestions = [
    "My growth has stalled.",
    "CAC is too high.",
    "Should I hire?",
    "My co-founder and I disagree.",
    "Help me prioritize this week.",
];

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] =
        useState(true);

    const [conversationId, setConversationId] =
        useState<string | null>(null);

    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    // =========================================
    // LOAD LATEST CONVERSATION
    // =========================================

    useEffect(() => {
        async function loadHistory() {
            try {
                setHistoryLoading(true);

                const response = await fetch(
                    "/api/chat/history",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Could not load chat history."
                    );
                }

                if (
                    Array.isArray(
                        data.conversations
                    )
                ) {
                    setConversations(
                        data.conversations
                    );
                }

                if (data.activeConversationId) {
                    setConversationId(
                        data.activeConversationId
                    );
                }

                if (
                    Array.isArray(data.messages)
                ) {
                    const formattedMessages: ChatMessage[] =
                        data.messages.map(
                            (
                                item: HistoryMessage
                            ) => ({
                                id: item.id,
                                role: item.role,
                                content:
                                    item.content,
                            })
                        );

                    setMessages(
                        formattedMessages
                    );
                }
            } catch (error) {
                console.error(
                    "History load error:",
                    error
                );
            } finally {
                setHistoryLoading(false);
            }
        }

        loadHistory();
    }, []);

    // =========================================
    // REFRESH CONVERSATIONS
    // =========================================

    async function refreshConversations() {
        try {
            const response = await fetch(
                "/api/chat/history",
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            setConversations(
                data.conversations || []
            );
        } catch (error) {
            console.error(
                "Conversation refresh error:",
                error
            );
        }
    }

    // =========================================
    // LOAD CONVERSATION
    // =========================================

    async function loadConversation(
        id: string
    ) {
        if (loading || historyLoading) {
            return;
        }

        try {
            setHistoryLoading(true);

            const response = await fetch(
                `/api/chat/history/${id}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Could not load conversation."
                );
            }

            setConversationId(id);

            const formattedMessages: ChatMessage[] =
                (data.messages ?? []).map(
                    (
                        item: HistoryMessage
                    ) => ({
                        id: item.id,
                        role: item.role,
                        content: item.content,
                    })
                );

            setMessages(
                formattedMessages
            );
        } catch (error) {
            console.error(
                "Conversation load error:",
                error
            );
        } finally {
            setHistoryLoading(false);
        }
    }

    // =========================================
    // SEND MESSAGE
    // =========================================

    async function handleSend() {
        if (!message.trim() || loading) {
            return;
        }

        const userMessage =
            message.trim();

        const userChatMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: userMessage,
        };

        // Show user message immediately
        setMessages((prev) => [
            ...prev,
            userChatMessage,
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "/api/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        conversationId,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Something went wrong."
                );
            }

            // Save conversation ID returned by backend
            if (data.conversationId) {
                setConversationId(
                    data.conversationId
                );
            }

            // Add AI response
            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    data.message ||
                    "FounderSaathi is temporarily unavailable.",
            };

            setMessages((prev) => [
                ...prev,
                assistantMessage,
            ]);

            // IMPORTANT:
            // Do NOT call /api/memory here.
            //
            // The main /api/chat route already
            // handles memory extraction and saving.

            // Refresh Recent Chats
            await refreshConversations();
        } catch (error) {
            console.error(
                "Chat error:",
                error
            );

            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content:
                    "Bhai, abhi thodi technical problem aa gayi. Ek baar phir try karte hain.",
            };

            setMessages((prev) => [
                ...prev,
                errorMessage,
            ]);
        } finally {
            setLoading(false);
        }
    }

    // =========================================
    // NEW CHAT
    // =========================================

    function handleNewChat() {
        if (loading) {
            return;
        }

        setMessage("");
        setMessages([]);
        setConversationId(null);
    }

    // =========================================
    // SUGGESTION
    // =========================================

    function useSuggestion(
        text: string
    ) {
        setMessage(text);
    }

    return (
        <main className="flex h-screen overflow-hidden bg-black text-white">
            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black md:flex md:flex-col">
                {/* Logo */}

                <div className="border-b border-white/10 p-5">
                    <Link
                        href="/dashboard"
                        className="text-xl font-bold tracking-tight"
                    >
                        FounderSaathi 🚀
                    </Link>

                    <p className="mt-1 text-xs text-white/40">
                        Your AI Founder Companion
                    </p>
                </div>

                {/* New Chat */}

                <div className="p-4">
                    <button
                        onClick={
                            handleNewChat
                        }
                        disabled={loading}
                        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + New Chat
                    </button>
                </div>

                {/* Recent Chats */}

                <div className="flex-1 overflow-y-auto px-3">
                    <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-white/30">
                        Recent Chats
                    </p>


                    <div className="space-y-1">
                        {conversations.length ===
                            0 ? (
                            <p className="px-3 py-2 text-xs text-white/30">
                                No conversations
                                yet
                            </p>
                        ) : (
                            conversations.map(
                                (
                                    conversation
                                ) => (
                                    <button
                                        key={
                                            conversation.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            loadConversation(
                                                conversation.id
                                            )
                                        }
                                        disabled={
                                            loading ||
                                            historyLoading
                                        }
                                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${conversation.id ===
                                            conversationId
                                            ? "bg-white/10 text-white"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <span className="block truncate">
                                            {
                                                conversation.title
                                            }
                                        </span>
                                    </button>
                                )
                            )
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleNewChat
                        }
                        disabled={loading}
                        className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="block truncate">
                            {messages.length >
                                0
                                ? "Current conversation"
                                : "New conversation"}
                        </span>
                    </button>

                    {/* Workspace */}

                    <div className="mt-8">
                        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-white/30">
                            Workspace
                        </p>

                        <nav className="space-y-1">
                            <Link
                                href="/dashboard"
                                className="block rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                            >
                                ◈ Dashboard
                            </Link>

                            <button
                                type="button"
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                            >
                                ✓ Goals
                            </button>

                            <button
                                type="button"
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                            >
                                🧠 Memories
                            </button>

                            <button
                                type="button"
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                            >
                                ⚙ Settings
                            </button>
                        </nav>
                    </div>
                </div>

                {/* User */}

                <div className="border-t border-white/10 p-4">
                    <div className="rounded-xl bg-white/5 px-3 py-3">
                        <p className="truncate text-sm font-medium">
                            Founder
                        </p>

                        <p className="mt-1 truncate text-xs text-white/40">
                            Your private workspace
                        </p>
                    </div>
                </div>
            </aside>

            {/* =========================================
                MAIN CHAT
            ========================================= */}

            <section className="flex min-w-0 flex-1 flex-col">
                {/* Header */}

                <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 md:px-8">
                    <div>
                        <h1 className="text-sm font-semibold md:text-base">
                            FounderSaathi
                        </h1>

                        <p className="text-xs text-white/40">
                            AI Founder Companion
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full ${loading
                                ? "bg-yellow-400"
                                : "bg-green-400"
                                }`}
                        />

                        <span className="text-xs text-white/40">
                            {loading
                                ? "Thinking..."
                                : "Ready"}
                        </span>
                    </div>
                </header>

                {/* =========================================
                    MESSAGES AREA
                ========================================= */}

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8">
                        {/* History loading */}

                        {historyLoading ? (
                            <div className="flex min-h-[60vh] items-center justify-center">
                                <div className="text-sm text-white/40">
                                    Loading your
                                    conversation...
                                </div>
                            </div>
                        ) : messages.length ===
                            0 ? (
                            /* =================================
                               EMPTY STATE
                            ================================= */

                            <div className="flex min-h-[60vh] flex-col justify-center">
                                <div className="mb-10">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                                        🚀
                                    </div>

                                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                        Hey Founder 👋
                                    </h2>

                                    <p className="mt-3 max-w-xl text-base leading-7 text-white/50">
                                        Tell me
                                        what's
                                        happening
                                        with your
                                        startup.
                                        I'll help
                                        you think
                                        through it
                                        clearly.
                                    </p>
                                </div>

                                {/* How I can help */}

                                <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <p className="text-sm font-medium text-white/80">
                                        How I can
                                        help
                                    </p>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl bg-white/5 p-4">
                                            <div className="text-lg">
                                                🎯
                                            </div>

                                            <p className="mt-2 text-sm font-medium">
                                                Decisions
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-white/40">
                                                Think
                                                through
                                                difficult
                                                startup
                                                decisions.
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white/5 p-4">
                                            <div className="text-lg">
                                                📈
                                            </div>

                                            <p className="mt-2 text-sm font-medium">
                                                Growth
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-white/40">
                                                Find
                                                practical
                                                ways to
                                                improve
                                                growth.
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white/5 p-4">
                                            <div className="text-lg">
                                                🧠
                                            </div>

                                            <p className="mt-2 text-sm font-medium">
                                                Clarity
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-white/40">
                                                Turn
                                                confusing
                                                problems
                                                into
                                                clear
                                                actions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Suggestions */}

                                <div>
                                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
                                        Try asking
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(
                                            (
                                                suggestion
                                            ) => (
                                                <button
                                                    key={
                                                        suggestion
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        useSuggestion(
                                                            suggestion
                                                        )
                                                    }
                                                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                                                >
                                                    {
                                                        suggestion
                                                    }
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* =================================
                               CHAT MESSAGES
                            ================================= */

                            <div className="space-y-6">
                                {messages.map(
                                    (msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 whitespace-pre-wrap ${msg.role === "user"
                                                    ? "bg-white text-black"
                                                    : "border border-white/10 bg-white/[0.04] text-white/90"
                                                    }`}
                                            >
                                                {msg.role === "assistant" && (
                                                    <div className="mb-2 text-xs font-semibold text-white/40">
                                                        FounderSaathi 🚀
                                                    </div>
                                                )}

                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Thinking */}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white/40">
                                            FounderSaathi
                                            is
                                            thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* =========================================
                    INPUT
                ========================================= */}

                <div className="shrink-0 border-t border-white/10 bg-black px-4 py-4 md:px-8">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={
                                        message
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setMessage(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) => {
                                        if (
                                            event.key ===
                                            "Enter" &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="What's happening with your startup?"
                                    rows={1}
                                    disabled={
                                        historyLoading ||
                                        loading
                                    }
                                    className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleSend
                                    }
                                    disabled={
                                        !message.trim() ||
                                        loading ||
                                        historyLoading
                                    }
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Send message"
                                >
                                    {loading
                                        ? "..."
                                        : "↑"}
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-3 pb-1 pt-1">
                                <p className="text-[11px] text-white/25">
                                    FounderSaathi
                                    can make
                                    mistakes.
                                    Verify
                                    important
                                    decisions.
                                </p>

                                <p className="hidden text-[11px] text-white/25 sm:block">
                                    Enter to send ·
                                    Shift + Enter
                                    for new line
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}