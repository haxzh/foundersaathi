"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileForm = {
    full_name: string;
    company_name: string;
    industry: string;
    startup_stage: string;
    location: string;
    team_size: string;
    business_model: string;
    target_customer: string;
    monthly_revenue: string;
    monthly_burn: string;
    runway_months: string;
    funding_stage: string;
    major_goals: string;
    major_pain_points: string;
};

const emptyForm: ProfileForm = {
    full_name: "",
    company_name: "",
    industry: "",
    startup_stage: "",
    location: "",
    team_size: "",
    business_model: "",
    target_customer: "",
    monthly_revenue: "",
    monthly_burn: "",
    runway_months: "",
    funding_stage: "",
    major_goals: "",
    major_pain_points: "",
};

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState<ProfileForm>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
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

                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                if (error) {
                    console.error("Profile load error:", error);
                    setErrorMessage(error.message);
                    return;
                }

                if (profile) {
                    setForm({
                        full_name: profile.full_name ?? "",
                        company_name: profile.company_name ?? "",
                        industry: profile.industry ?? "",
                        startup_stage: profile.startup_stage ?? "",
                        location: profile.location ?? "",
                        team_size:
                            profile.team_size !== null &&
                                profile.team_size !== undefined
                                ? String(profile.team_size)
                                : "",
                        business_model: profile.business_model ?? "",
                        target_customer: profile.target_customer ?? "",
                        monthly_revenue:
                            profile.monthly_revenue !== null &&
                                profile.monthly_revenue !== undefined
                                ? String(profile.monthly_revenue)
                                : "",
                        monthly_burn:
                            profile.monthly_burn !== null &&
                                profile.monthly_burn !== undefined
                                ? String(profile.monthly_burn)
                                : "",
                        runway_months:
                            profile.runway_months !== null &&
                                profile.runway_months !== undefined
                                ? String(profile.runway_months)
                                : "",
                        funding_stage: profile.funding_stage ?? "",
                        major_goals: profile.major_goals ?? "",
                        major_pain_points:
                            profile.major_pain_points ?? "",
                    });
                }
            } catch (error) {
                console.error("Profile load error:", error);
                setErrorMessage("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [router, supabase]);

    function updateField(
        field: keyof ProfileForm,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                router.push("/login");
                return;
            }

            if (!form.full_name.trim()) {
                setErrorMessage("Please enter your name.");
                return;
            }

            if (!form.company_name.trim()) {
                setErrorMessage(
                    "Please enter your startup/company name."
                );
                return;
            }

            const profileData = {
                id: user.id,

                full_name: form.full_name.trim(),
                company_name: form.company_name.trim(),
                industry: form.industry.trim(),
                startup_stage: form.startup_stage,
                location: form.location.trim(),

                team_size: form.team_size
                    ? Number(form.team_size)
                    : null,

                business_model:
                    form.business_model.trim(),

                target_customer:
                    form.target_customer.trim(),

                monthly_revenue:
                    form.monthly_revenue
                        ? Number(form.monthly_revenue)
                        : null,

                monthly_burn:
                    form.monthly_burn
                        ? Number(form.monthly_burn)
                        : null,

                runway_months:
                    form.runway_months
                        ? Number(form.runway_months)
                        : null,

                funding_stage:
                    form.funding_stage,

                major_goals:
                    form.major_goals.trim(),

                major_pain_points:
                    form.major_pain_points.trim(),

                updated_at:
                    new Date().toISOString(),
            };

            const { error } = await supabase
                .from("profiles")
                .upsert(profileData);

            if (error) {
                console.error(
                    "Profile save error:",
                    error
                );

                setErrorMessage(error.message);
                return;
            }

            setSuccessMessage(
                "Founder profile saved successfully."
            );

            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 500);
        } catch (error) {
            console.error(
                "Profile submit error:",
                error
            );

            setErrorMessage(
                "Something went wrong while saving your profile."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="text-3xl">
                        🚀
                    </div>

                    <p className="mt-3 text-sm text-white/50">
                        Loading your founder profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black px-4 py-10 text-white">
            <div className="mx-auto max-w-4xl">

                {/* HEADER */}
                <div className="mb-10">
                    <p className="text-sm font-medium text-white/40">
                        FounderSaathi 🚀
                    </p>

                    <h1 className="mt-3 text-4xl font-bold">
                        Your Founder Profile
                    </h1>

                    <p className="mt-3 max-w-2xl text-white/50">
                        Tell FounderSaathi about you and your
                        startup. This context helps the AI give
                        more personalized advice.
                    </p>
                </div>

                {/* ERROR */}
                {errorMessage && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                    </div>
                )}

                {/* SUCCESS */}
                {successMessage && (
                    <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ================= BASIC INFO ================= */}

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold">
                            About You
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                            Basic founder and company information.
                        </p>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Full Name
                                </label>

                                <input
                                    value={form.full_name}
                                    onChange={(e) =>
                                        updateField(
                                            "full_name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Harsh Kumar"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Startup / Company Name
                                </label>

                                <input
                                    value={form.company_name}
                                    onChange={(e) =>
                                        updateField(
                                            "company_name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. FounderSaathi"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Industry
                                </label>

                                <input
                                    value={form.industry}
                                    onChange={(e) =>
                                        updateField(
                                            "industry",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. SaaS, FinTech, EdTech"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Location / Country
                                </label>

                                <input
                                    value={form.location}
                                    onChange={(e) =>
                                        updateField(
                                            "location",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. India, Delhi"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-white/30"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Startup Stage
                                </label>

                                <select
                                    value={form.startup_stage}
                                    onChange={(e) =>
                                        updateField(
                                            "startup_stage",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                >
                                    <option value="">
                                        Select stage
                                    </option>

                                    <option value="idea">
                                        Idea
                                    </option>

                                    <option value="pre_product">
                                        Pre-product
                                    </option>

                                    <option value="mvp">
                                        MVP
                                    </option>

                                    <option value="early_revenue">
                                        Early Revenue
                                    </option>

                                    <option value="growth">
                                        Growth
                                    </option>

                                    <option value="scale">
                                        Scale
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Team Size
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={form.team_size}
                                    onChange={(e) =>
                                        updateField(
                                            "team_size",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 3"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                        </div>
                    </section>

                    {/* ================= BUSINESS ================= */}

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold">
                            Business
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                            Help FounderSaathi understand your business model.
                        </p>

                        <div className="mt-6 space-y-5">

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Business Model
                                </label>

                                <input
                                    value={form.business_model}
                                    onChange={(e) =>
                                        updateField(
                                            "business_model",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. SaaS subscription, marketplace, D2C"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Target Customer
                                </label>

                                <textarea
                                    value={form.target_customer}
                                    onChange={(e) =>
                                        updateField(
                                            "target_customer",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Who are you building for?"
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                        </div>
                    </section>

                    {/* ================= METRICS ================= */}

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold">
                            Startup Metrics
                        </h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Monthly Revenue
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.monthly_revenue}
                                    onChange={(e) =>
                                        updateField(
                                            "monthly_revenue",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 100000"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Monthly Burn
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.monthly_burn}
                                    onChange={(e) =>
                                        updateField(
                                            "monthly_burn",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 75000"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Runway (Months)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.runway_months}
                                    onChange={(e) =>
                                        updateField(
                                            "runway_months",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. 8"
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Funding Stage
                                </label>

                                <select
                                    value={form.funding_stage}
                                    onChange={(e) =>
                                        updateField(
                                            "funding_stage",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                >
                                    <option value="">
                                        Select funding stage
                                    </option>

                                    <option value="bootstrapped">
                                        Bootstrapped
                                    </option>

                                    <option value="pre_seed">
                                        Pre-seed
                                    </option>

                                    <option value="seed">
                                        Seed
                                    </option>

                                    <option value="series_a">
                                        Series A
                                    </option>

                                    <option value="series_b">
                                        Series B
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>
                                </select>
                            </div>

                        </div>
                    </section>

                    {/* ================= GOALS ================= */}

                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold">
                            Goals & Pain Points
                        </h2>

                        <p className="mt-1 text-sm text-white/40">
                            This gives FounderSaathi the context it needs
                            to help you prioritize.
                        </p>

                        <div className="mt-6 space-y-5">

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Major Goals
                                </label>

                                <textarea
                                    value={form.major_goals}
                                    onChange={(e) =>
                                        updateField(
                                            "major_goals",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Reach ₹1 lakh MRR, get 100 customers, launch mobile app..."
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-white/70">
                                    Major Pain Points
                                </label>

                                <textarea
                                    value={form.major_pain_points}
                                    onChange={(e) =>
                                        updateField(
                                            "major_pain_points",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. High CAC, low retention, hiring problems..."
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 outline-none"
                                />
                            </div>

                        </div>
                    </section>

                    {/* ================= BUTTONS ================= */}

                    <div className="flex flex-col gap-3 sm:flex-row">

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving Profile..."
                                : "Save Founder Profile 🚀"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/dashboard")
                            }
                            disabled={saving}
                            className="rounded-xl border border-white/10 px-6 py-4 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}