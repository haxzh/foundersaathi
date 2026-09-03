// "use client";

// import { FormEvent, useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//     const supabase = createClient();
//     const router = useRouter();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [errorMessage, setErrorMessage] = useState("");

//     async function handleLogin(event: FormEvent<HTMLFormElement>) {
//         event.preventDefault();

//         setLoading(true);
//         setErrorMessage("");

//         const { error } = await supabase.auth.signInWithPassword({
//             email,
//             password,
//         });

//         if (error) {
//             setErrorMessage(error.message);
//             setLoading(false);
//             return;
//         }

//         router.push("/dashboard");
//         router.refresh();
//     }

//     return (
//         <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
//             <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
//                 <h1 className="text-3xl font-bold">Welcome back</h1>

//                 <p className="mt-2 text-sm text-white/60">
//                     Continue your founder journey.
//                 </p>

//                 <form onSubmit={handleLogin} className="mt-8 space-y-5">
//                     <div>
//                         <label className="mb-2 block text-sm">
//                             Email
//                         </label>

//                         <input
//                             type="email"
//                             required
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
//                             placeholder="you@example.com"
//                         />
//                     </div>

//                     <div>
//                         <label className="mb-2 block text-sm">
//                             Password
//                         </label>

//                         <input
//                             type="password"
//                             required
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
//                             placeholder="••••••••"
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
//                     >
//                         {loading ? "Logging in..." : "Login"}
//                     </button>

//                     {errorMessage && (
//                         <p className="text-sm text-red-400">
//                             {errorMessage}
//                         </p>
//                     )}
//                 </form>

//                 <p className="mt-6 text-center text-sm text-white/50">
//                     New founder?{" "}
//                     <a href="/signup" className="text-white underline">
//                         Create account
//                     </a>
//                 </p>
//             </div>
//         </main>
//     );
// }

// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setMessageType("info");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            setMessageType("error");
            setLoading(false);
            return;
        }

        if (data.user) {
            setMessage("✅ Login successful! Redirecting...");
            setMessageType("success");

            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
            {/* Header */}
            <nav className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                FounderSaathi
                            </span>
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                {/* Login Card */}
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 md:p-10 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full mb-4 border border-white/10">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                            <p className="text-gray-400 text-sm mt-1">Continue your founder journey.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder:text-gray-500 outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-white placeholder:text-gray-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0" />
                                    Remember me
                                </label>
                            </div>

                            {/* Message Display */}
                            {message && (
                                <div className={`p-3 rounded-xl text-sm ${messageType === "success"
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : messageType === "error"
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    }`}>
                                    {message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0A0A0F] text-gray-500">or continue with</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition text-sm font-medium text-gray-300 hover:text-white"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition text-sm font-medium text-gray-300 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-gray-400 mt-6">
                            New founder?{" "}
                            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-xs text-gray-600 mt-6">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="hover:text-gray-400 transition">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}