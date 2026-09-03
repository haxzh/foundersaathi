export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          FounderSaathi 🚀
        </h1>

        <p className="mt-4 text-white/60">
          Your AI Founder Companion
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            Login
          </a>

          <a
            href="/signup"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}