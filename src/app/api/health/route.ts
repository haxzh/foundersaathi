import { NextResponse } from "next/server";

export async function GET() {
    const configured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        process.env.GEMINI_API_KEY
    );
    return NextResponse.json({
        ok: configured,
        service: "foundersaathi",
        environment: process.env.NODE_ENV,
    }, { status: configured ? 200 : 503 });
}
