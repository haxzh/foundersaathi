import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // -----------------------------------------
        // SUPABASE
        // -----------------------------------------

        const supabase = await createClient();

        // -----------------------------------------
        // AUTHENTICATED USER
        // -----------------------------------------

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    error: "You must be logged in.",
                },
                {
                    status: 401,
                }
            );
        }

        // -----------------------------------------
        // CONVERSATION ID
        // -----------------------------------------

        const { id } = await params;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                {
                    error: "Conversation ID is required.",
                },
                {
                    status: 400,
                }
            );
        }

        // -----------------------------------------
        // LOAD CONVERSATION
        // -----------------------------------------

        const {
            data: conversation,
            error: conversationError,
        } = await supabase
            .from("conversations")
            .select(
                "id, title, created_at, updated_at"
            )
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (conversationError || !conversation) {
            console.error(
                "Conversation error:",
                conversationError
            );

            return NextResponse.json(
                {
                    error: "Conversation not found.",
                },
                {
                    status: 404,
                }
            );
        }

        // -----------------------------------------
        // LOAD MESSAGES
        // -----------------------------------------

        const {
            data: messages,
            error: messagesError,
        } = await supabase
            .from("messages")
            .select(
                "id, conversation_id, user_id, role, content, created_at"
            )
            .eq("conversation_id", id)
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
                {
                    error: "Failed to load messages.",
                },
                {
                    status: 500,
                }
            );
        }

        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        return NextResponse.json({
            conversation,
            messages: messages || [],
        });
    } catch (error) {
        console.error(
            "Conversation history error:",
            error
        );

        return NextResponse.json(
            {
                error: "Internal server error.",
            },
            {
                status: 500,
            }
        );
    }
}