"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        setMessage(
            "Account created. Please check your email to confirm your account."
        );

        setLoading(false);
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="text-3xl font-bold">FounderSaathi</h1>

                <p className="mt-2 text-sm text-white/60">
                    Create your founder account.
                </p>

                <form onSubmit={handleSignup} className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-white/30"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm">
                            Password
                        </label>

                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-white/30"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                    {message && (
                        <p className="text-sm text-white/70">
                            {message}
                        </p>
                    )}
                </form>

                <p className="mt-6 text-center text-sm text-white/50">
                    Already have an account?{" "}
                    <a href="/login" className="text-white underline">
                        Login
                    </a>
                </p>
            </div>
        </main>
    );
}