"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    id: string;
    full_name: string | null;
    company_name: string | null;
    industry: string | null;
    startup_stage: string | null;
    location: string | null;
    team_size: number | null;
    business_model: string | null;
    target_customer: string | null;
    monthly_revenue: number | null;
    monthly_burn: number | null;
    runway_months: number | null;
    funding_stage: string | null;
    major_goals: string | null;
    major_pain_points: string | null;
};

function formatNumber(value: number | null) {
    if (value === null || value === undefined) {
        return "Not added";
    }

    return new Intl.NumberFormat("en-IN").format(value);
}

function formatStage(value: string | null) {
    if (!value) return "Not added";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function MetricCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/35">
                {label}
            </p>

            <p className="mt-3 text-2xl font-bold">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-white/35">
                    {description}
                </p>
            )}
        </div>
    );
}

function ProfileRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col gap-1 border-b border-white/5 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <span className="text-sm text-white/40">
                {label}
            </span>

            <span className="text-sm font-medium text-white/85 sm:max-w-[65%] sm:text-right">
                {value || "Not added"}
            </span>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] =
        useState<Profile | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError || !user) {
                    router.push("/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select(
                        `
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
                        major_pain_points
                        `
                    )
                    .eq("id", user.id)
                    .maybeSingle();

                if (error) {
                    console.error(
                        "Dashboard profile error:",
                        error
                    );

                    setErrorMessage(error.message);
                    return;
                }

                setProfile(data);
            } catch (error) {
                console.error(
                    "Dashboard load error:",
                    error
                );

                setErrorMessage(
                    "Could not load your dashboard."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [router, supabase]);

    async function handleLogout() {
        await supabase.auth.signOut();

        router.push("/login");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="text-3xl">
                        🚀
                    </div>

                    <p className="mt-3 text-sm text-white/40">
                        Loading your dashboard...
                    </p>
                </div>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
                <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                    <h1 className="text-xl font-semibold">
                        Something went wrong
                    </h1>

                    <p className="mt-3 text-sm text-red-300">
                        {errorMessage}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                    <div className="text-3xl">
                        🚀
                    </div>

                    <h1 className="mt-4 text-xl font-semibold">
                        Complete your founder profile
                    </h1>

                    <p className="mt-2 text-sm text-white/40">
                        Add your startup information so
                        FounderSaathi can personalize your
                        experience.
                    </p>

                    <Link
                        href="/onboarding"
                        className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
                    >
                        Complete Profile
                    </Link>
                </div>
            </main>
        );
    }

    const revenue =
        profile.monthly_revenue ?? 0;

    const burn =
        profile.monthly_burn ?? 0;

    const monthlyNet =
        revenue - burn;

    return (
        <main className="min-h-screen bg-black text-white">

            {/* ================= HEADER ================= */}

            <header className="border-b border-white/10">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">

                    <div>
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold tracking-tight"
                        >
                            FounderSaathi 🚀
                        </Link>

                        <p className="mt-1 text-xs text-white/40">
                            AI Founder Companion
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Link
                            href="/chat"
                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                            Open Chat
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </header>

            {/* ================= MAIN ================= */}

            <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">

                {/* HERO */}

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div>

                            <p className="text-sm text-white/40">
                                Welcome back
                            </p>

                            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                                {profile.full_name ||
                                    "Founder"}
                                👋
                            </h1>

                            <p className="mt-3 text-white/50">
                                {profile.company_name ||
                                    "Your startup"}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">

                                {profile.industry && (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                        {profile.industry}
                                    </span>
                                )}

                                {profile.startup_stage && (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                        {formatStage(
                                            profile.startup_stage
                                        )}
                                    </span>
                                )}

                                {profile.location && (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                        📍 {profile.location}
                                    </span>
                                )}

                            </div>

                        </div>

                        <Link
                            href="/onboarding"
                            className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                        >
                            Edit Founder Profile
                        </Link>

                    </div>

                </section>

                {/* ================= METRICS ================= */}

                <section className="mt-6">

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            Startup Metrics
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                            Your current business numbers at a glance.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <MetricCard
                            label="Monthly Revenue"
                            value={
                                profile.monthly_revenue !== null
                                    ? `₹${formatNumber(
                                        profile.monthly_revenue
                                    )}`
                                    : "Not added"
                            }
                        />

                        <MetricCard
                            label="Monthly Burn"
                            value={
                                profile.monthly_burn !== null
                                    ? `₹${formatNumber(
                                        profile.monthly_burn
                                    )}`
                                    : "Not added"
                            }
                        />

                        <MetricCard
                            label="Runway"
                            value={
                                profile.runway_months !== null
                                    ? `${profile.runway_months} months`
                                    : "Not added"
                            }
                        />

                        <MetricCard
                            label="Monthly Net"
                            value={
                                profile.monthly_revenue !== null &&
                                    profile.monthly_burn !== null
                                    ? `₹${formatNumber(
                                        monthlyNet
                                    )}`
                                    : "Not added"
                            }
                            description={
                                profile.monthly_revenue !== null &&
                                    profile.monthly_burn !== null
                                    ? "Revenue minus burn"
                                    : undefined
                            }
                        />

                    </div>

                </section>

                {/* ================= PROFILE ================= */}

                <section className="mt-8 grid gap-6 lg:grid-cols-2">

                    {/* BUSINESS PROFILE */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                        <div className="mb-4">
                            <h2 className="text-xl font-semibold">
                                Founder & Business Profile
                            </h2>

                            <p className="mt-1 text-sm text-white/40">
                                Your company context.
                            </p>
                        </div>

                        <ProfileRow
                            label="Founder"
                            value={
                                profile.full_name ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Company"
                            value={
                                profile.company_name ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Industry"
                            value={
                                profile.industry ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Startup Stage"
                            value={formatStage(
                                profile.startup_stage
                            )}
                        />

                        <ProfileRow
                            label="Location"
                            value={
                                profile.location ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Team Size"
                            value={
                                profile.team_size !== null
                                    ? `${profile.team_size} people`
                                    : "Not added"
                            }
                        />

                        <ProfileRow
                            label="Business Model"
                            value={
                                profile.business_model ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Target Customer"
                            value={
                                profile.target_customer ||
                                "Not added"
                            }
                        />

                        <ProfileRow
                            label="Funding Stage"
                            value={formatStage(
                                profile.funding_stage
                            )}
                        />

                    </div>

                    {/* GOALS */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

                        <div className="mb-4">
                            <h2 className="text-xl font-semibold">
                                Goals & Pain Points
                            </h2>

                            <p className="mt-1 text-sm text-white/40">
                                What you are trying to achieve and
                                what is currently blocking you.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/30 p-5">

                            <p className="text-xs font-medium uppercase tracking-wider text-white/35">
                                Major Goals
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/75">
                                {profile.major_goals ||
                                    "No major goals added yet."}
                            </p>

                        </div>

                        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-5">

                            <p className="text-xs font-medium uppercase tracking-wider text-white/35">
                                Major Pain Points
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/75">
                                {profile.major_pain_points ||
                                    "No major pain points added yet."}
                            </p>

                        </div>

                        <Link
                            href="/chat"
                            className="mt-5 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                            Discuss With FounderSaathi 🚀
                        </Link>

                    </div>

                </section>

                {/* ================= QUICK ACTIONS ================= */}

                <section className="mt-8">

                    <h2 className="text-xl font-semibold">
                        Quick Actions
                    </h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">

                        <Link
                            href="/chat"
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
                        >
                            <div className="text-2xl">
                                💬
                            </div>

                            <h3 className="mt-3 font-semibold">
                                Chat With FounderSaathi
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-white/40">
                                Get practical advice on your startup.
                            </p>
                        </Link>

                        <Link
                            href="/onboarding"
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
                        >
                            <div className="text-2xl">
                                👤
                            </div>

                            <h3 className="mt-3 font-semibold">
                                Update Profile
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-white/40">
                                Keep your startup context up to date.
                            </p>
                        </Link>

                        <Link
                            href="/chat"
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
                        >
                            <div className="text-2xl">
                                🎯
                            </div>

                            <h3 className="mt-3 font-semibold">
                                Work On Goals
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-white/40">
                                Turn your goals into concrete next actions.
                            </p>
                        </Link>

                    </div>

                </section>

            </div>
        </main>
    );
}