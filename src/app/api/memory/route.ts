import { NextRequest, NextResponse } from "next/server";
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
                {
                    success: false,
                    error: "Unauthorized",
                    memories: [],
                },
                { status: 401 }
            );
        }

        const { data, error } = await supabase
            .from("memories")
            .select(
                `
                id,
                user_id,
                category,
                key,
                value,
                confidence,
                source,
                created_at,
                updated_at
            `
            )
            .eq("user_id", user.id)
            .order("updated_at", {
                ascending: false,
            });

        if (error) {
            console.error("Memory GET error:", error);

            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    memories: [],
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            memories: data ?? [],
        });
    } catch (error) {
        console.error("Memory GET exception:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to load memories",
                memories: [],
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();

        const {
            category,
            key,
            value,
            confidence = 1,
            source = "manual",
        } = body;

        if (!key || !value) {
            return NextResponse.json(
                {
                    success: false,
                    error: "key and value are required",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("memories")
            .upsert(
                {
                    user_id: user.id,
                    category: category || "general",
                    key,
                    value,
                    confidence,
                    source,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,key",
                }
            )
            .select()
            .single();

        if (error) {
            console.error("Memory POST error:", error);

            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            memory: data,
        });
    } catch (error) {
        console.error("Memory POST exception:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to save memory",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        /*
         * The frontend may send either:
         *   { id: "memory-id" }
         * or:
         *   { key: "team_size" }
         *
         * We support both so the delete operation
         * remains reliable.
         */

        const url = new URL(request.url);

        let id: string | null = url.searchParams.get("id");
        let key: string | null = url.searchParams.get("key");

        try {
            const body = await request.json();

            if (!id) {
                id = body?.id ?? null;
            }

            if (!key) {
                key = body?.key ?? null;
            }
        } catch {
            // DELETE request may not contain a JSON body.
        }

        if (!id && !key) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Memory id or key is required",
                },
                { status: 400 }
            );
        }

        /*
         * IMPORTANT:
         * Always restrict deletion to the currently
         * authenticated user's memories.
         */

        let deleteQuery = supabase
            .from("memories")
            .delete()
            .eq("user_id", user.id);

        if (id) {
            deleteQuery = deleteQuery.eq("id", id);
        } else {
            deleteQuery = deleteQuery.eq("key", key);
        }

        const {
            data: deletedMemory,
            error: deleteError,
        } = await deleteQuery
            .select("id, key")
            .maybeSingle();

        if (deleteError) {
            console.error(
                "Memory DELETE error:",
                deleteError
            );

            return NextResponse.json(
                {
                    success: false,
                    error: deleteError.message,
                },
                { status: 500 }
            );
        }

        if (!deletedMemory) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Memory not found or already deleted",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Memory deleted successfully",
            memory: deletedMemory,
        });
    } catch (error) {
        console.error(
            "Memory DELETE exception:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete memory",
            },
            { status: 500 }
        );
    }
}