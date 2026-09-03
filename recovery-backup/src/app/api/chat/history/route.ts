import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "You must be logged in." },
                { status: 401 }
            );
        }

        // Get all conversations belonging to this user
        const { data: conversations, error: conversationsError } =
            await supabase
                .from("conversations")
                .select("id, title, created_at, updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

        if (conversationsError) {
            console.error(
                "Conversations error:",
                conversationsError
            );

            return NextResponse.json(
                { error: "Could not load conversations." },
                { status: 500 }
            );
        }

        // No conversations
        if (!conversations || conversations.length === 0) {
            return NextResponse.json({
                conversations: [],
                activeConversationId: null,
                messages: [],
            });
        }

        // Latest conversation
        const latestConversation = conversations[0];

        // Load messages from latest conversation
        const { data: messages, error: messagesError } =
            await supabase
                .from("messages")
                .select("id, role, content, created_at")
                .eq(
                    "conversation_id",
                    latestConversation.id
                )
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: true,
                });

        if (messagesError) {
            console.error(
                "Messages error:",
                messagesError
            );

            return NextResponse.json(
                { error: "Could not load messages." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            conversations,
            activeConversationId: latestConversation.id,
            messages: messages ?? [],
        });
    } catch (error) {
        console.error("History API error:", error);

        return NextResponse.json(
            {
                error: "Something went wrong while loading history.",
            },
            { status: 500 }
        );
    }
}