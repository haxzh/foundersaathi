// export default function Home() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-black text-white">
//       <div className="text-center">
//         <h1 className="text-5xl font-bold">
//           FounderSaathi 🚀
//         </h1>

//         <p className="mt-4 text-white/60">
//           Your AI Founder Companion
//         </p>

//         <div className="mt-8 flex justify-center gap-4">
//           <a
//             href="/login"
//             className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
//           >
//             Login
//           </a>

//           <a
//             href="/signup"
//             className="rounded-xl border border-white/20 px-6 py-3 font-semibold"
//           >
//             Get Started
//           </a>
//         </div>
//       </div>
//     </main>
//   );
// }


// app/page.tsx
import Link from 'next/link';
import { ArrowRight, CheckCircle, MessageCircle, Target, BookOpen, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl text-gray-900">FounderSaathi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Your AI Founder Companion
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Your AI Companion for the <br />
              <span className="text-gray-500">Founder Journey</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              FounderSaathi remembers your startup, learns from your decisions,
              and helps you think clearly when things get complicated.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
              >
                Start Talking to FounderSaathi
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> No credit card
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" /> 7-day trial
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Metrics Section */}
      <section className="py-12 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Trusted by founders building
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-500">Active Founders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1,200+</div>
              <div className="text-sm text-gray-500">Decisions Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-500">Would Recommend</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">4.8★</div>
              <div className="text-sm text-gray-500">Founder Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / How It Works Section */}
      <section id="features" className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built Specifically for Startup Founders
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to think clearly, make better decisions, and stay focused on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Chat</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Have natural conversations with an AI that understands your startup's unique context and challenges.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Persistent Memory</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Remembers your goals, metrics, and past conversations to provide personalized, contextual advice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Case Study RAG</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Learns from real startup case studies to provide practical, evidence-based guidance you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features / Specializations Section */}
      <section className="py-20 border-b border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              More Than Just a Chatbot
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              FounderSaathi is a complete decision-making partner for your startup journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-500" /> Decision Journal
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Log important decisions, expected outcomes, and actual results. Learn from your past choices and improve your decision-making over time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" /> Goal Tracking
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Set clear goals, track progress, and let FounderSaathi keep you accountable and focused on your priorities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" /> Smart RAG
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get relevant case studies and insights from a curated knowledge base of startup lessons, without information overload.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gray-500" /> Privacy First
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your data is secure. We use industry-standard encryption and never share your startup's private information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Think Clearly About Your Startup?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Join hundreds of founders who use FounderSaathi to make better decisions, faster.
          </p>
          <Link
            href="/signup"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            Start Your 7-Day Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            No credit card required. Start talking to FounderSaathi today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <span className="font-medium text-gray-700">FounderSaathi</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
              <Link href="/faq" className="hover:text-gray-900 transition">FAQ</Link>
            </div>
            <div className="text-xs">
              © 2026 FounderSaathi. AI coach, not a licensed therapist.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}