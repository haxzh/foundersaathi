"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setErrorMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
                <h1 className="text-3xl font-bold">Welcome back</h1>

                <p className="mt-2 text-sm text-white/60">
                    Continue your founder journey.
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {errorMessage && (
                        <p className="text-sm text-red-400">
                            {errorMessage}
                        </p>
                    )}
                </form>

                <p className="mt-6 text-center text-sm text-white/50">
                    New founder?{" "}
                    <a href="/signup" className="text-white underline">
                        Create account
                    </a>
                </p>
            </div>
        </main>
    );
}