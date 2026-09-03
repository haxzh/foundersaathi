import { createClient } from "@/lib/supabase/server";

export type FounderProfile = {
    id?: string;
    user_id: string;

    name?: string | null;
    startup_name?: string | null;
    industry?: string | null;
    startup_stage?: string | null;
    location?: string | null;
    team_size?: number | null;
    business_model?: string | null;
    target_customer?: string | null;

    monthly_revenue?: number | null;
    monthly_burn?: number | null;
    runway?: number | null;

    funding_stage?: string | null;
    major_goals?: string | null;
    major_pain_points?: string | null;

    created_at?: string | null;
    updated_at?: string | null;
};

/**
 * Load the founder profile from the same `profiles`
 * table that the chat/profile synchronization updates.
 *
 * This keeps:
 *
 * Profile
 *   +
 * Memory
 *   +
 * RAG
 *
 * consistent inside /api/chat.
 */
export async function getFounderProfile(
    userId: string
): Promise<FounderProfile | null> {
    const supabase = await createClient();

    const {
        data,
        error,
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            company_name,
            industry,
            startup_stage,
            location,
            team_size,
            business_model,
            target_customer,
            monthly_revenue,
            monthly_burn,
            runway_months,
            funding_stage,
            major_goals,
            major_pain_points,
            created_at,
            updated_at
        `)
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error(
            "Founder profile fetch error:",
            error
        );

        return null;
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        user_id: data.id,

        name: data.full_name,
        startup_name: data.company_name,
        industry: data.industry,
        startup_stage: data.startup_stage,
        location: data.location,
        team_size: data.team_size,
        business_model: data.business_model,
        target_customer: data.target_customer,

        monthly_revenue:
            data.monthly_revenue,

        monthly_burn:
            data.monthly_burn,

        runway:
            data.runway_months,

        funding_stage:
            data.funding_stage,

        major_goals:
            data.major_goals,

        major_pain_points:
            data.major_pain_points,

        created_at:
            data.created_at,

        updated_at:
            data.updated_at,
    };
}

/**
 * Convert the founder profile into a compact
 * context block for the AI model.
 */
export function formatFounderProfile(
    profile: FounderProfile | null
): string {
    if (!profile) {
        return (
            "No founder profile has been saved yet."
        );
    }

    const lines: string[] = [];

    const add = (
        label: string,
        value: unknown
    ) => {
        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            lines.push(
                `- ${label}: ${value}`
            );
        }
    };

    add(
        "Founder name",
        profile.name
    );

    add(
        "Startup name",
        profile.startup_name
    );

    add(
        "Industry",
        profile.industry
    );

    add(
        "Startup stage",
        profile.startup_stage
    );

    add(
        "Location",
        profile.location
    );

    add(
        "Team size",
        profile.team_size
    );

    add(
        "Business model",
        profile.business_model
    );

    add(
        "Target customer",
        profile.target_customer
    );

    add(
        "Monthly revenue",
        profile.monthly_revenue
    );

    add(
        "Monthly burn",
        profile.monthly_burn
    );

    add(
        "Runway",
        profile.runway
    );

    add(
        "Funding stage",
        profile.funding_stage
    );

    add(
        "Major goals",
        profile.major_goals
    );

    add(
        "Major pain points",
        profile.major_pain_points
    );

    if (lines.length === 0) {
        return (
            "Founder profile exists but contains no usable information."
        );
    }

    return lines.join("\n");
}