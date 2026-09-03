import { createClient } from "@supabase/supabase-js";

let adminClient:
    ReturnType<typeof createClient> | null = null;

/**
 * Server-only Supabase admin client.
 *
 * Uses the service-role key and must NEVER be imported
 * into client components or exposed to the browser.
 */
export function createAdminClient() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error(
            "NEXT_PUBLIC_SUPABASE_URL is not configured."
        );
    }

    if (!serviceRoleKey) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY is not configured."
        );
    }

    if (!adminClient) {
        adminClient = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false,
                },
            }
        );
    }

    return adminClient;
}
