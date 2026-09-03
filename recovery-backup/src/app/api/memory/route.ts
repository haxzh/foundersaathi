import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase =
            await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            data: memories,
            error,
        } = await supabase
            .from("memories")
            .select(
                "id, category, key, value, confidence, source, created_at, updated_at"
            )
            .eq(
                "user_id",
                user.id
            )
            .order("updated_at", {
                ascending: false,
            });

        if (error) {
            console.error(
                "Memory GET error:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Could not load memories.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            memories: memories ?? [],
        });
    } catch (error: any) {
        console.error(
            "Memory GET exception:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Could not load memories.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    request: Request
) {
    try {
        const body =
            await request.json();

        const id = body?.id;

        if (
            typeof id !== "string" ||
            !id.trim()
        ) {
            return NextResponse.json(
                {
                    error:
                        "Memory id is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            error: deleteError,
        } = await supabase
            .from("memories")
            .delete()
            .eq("id", id.trim())
            .eq(
                "user_id",
                user.id
            );

        if (deleteError) {
            console.error(
                "Memory delete error:",
                deleteError
            );

            return NextResponse.json(
                {
                    error:
                        "Could not delete memory.",
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error(
            "Memory DELETE exception:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Could not delete memory.",
            },
            {
                status: 500,
            }
        );
    }
}