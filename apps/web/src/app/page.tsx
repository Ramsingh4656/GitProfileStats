import Link from "next/link";
import { LayoutDashboard, LogIn, Sparkles, Terminal, Shield, Palette, BarChart3, ArrowRight } from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-[-200px] left-[-100px] opacity-70" />
      <div className="glow-spot bottom-[-200px] right-[-100px] opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030014]/65 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-all">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              GitProfile<span className="text-violet-500">Stats</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/" className="text-zinc-100 hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              GitHub <Github className="w-3.5 h-3.5" />
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors px-4 py-2 rounded-full border border-white/5 bg-white/3 flex items-center gap-2 hover:bg-white/5">
              <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span>Sign In</span>
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-white px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center gap-1.5 shadow-lg shadow-violet-500/20">
              <span>Get Started</span>
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16 relative">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/25 bg-violet-500/5 text-violet-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3 h-3" />
            <span>Premium GitHub Cards & Analytics</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-2xl bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Showcase Your GitHub Journey In Stunning Style
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed">
            Create elegant, dynamically generated SVG cards and comprehensive analytics dashboards for your GitHub profile. Stand out from the crowd.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="px-8 py-4 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group">
              <span>Access Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <span>Sign In with GitHub</span>
              <Github className="w-5 h-5 text-zinc-300" />
            </Link>
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          
          {/* Card Mockup */}
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 relative overflow-hidden group">
            {/* Glossy linear highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1.5px]">
                  <div className="w-full h-full rounded-xl bg-[#090620] flex items-center justify-center overflow-hidden">
                    <Terminal className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">@octocat</h4>
                  <p className="text-zinc-500 text-xs">San Francisco, CA</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Active Stats
              </div>
            </div>

            {/* Profile Metrics */}
            <div className="py-6 grid grid-cols-3 gap-4 border-b border-white/5">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Repositories</p>
                <p className="text-2xl font-extrabold text-white mt-1">142</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Followers</p>
                <p className="text-2xl font-extrabold text-white mt-1">9.4k</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Total Stars</p>
                <p className="text-2xl font-extrabold text-white mt-1">1,824</p>
              </div>
            </div>

            {/* Contribution chart preview */}
            <div className="py-6">
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">Weekly Commit Activity</p>
              <div className="h-16 flex items-end gap-1.5">
                {[40, 20, 60, 80, 50, 90, 70, 45, 65, 85, 30, 75, 95, 110, 80].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-violet-600/50 to-fuchsia-600 rounded-sm" style={{ height: `${val}%` }} />
                ))}
              </div>
            </div>

            {/* Tags / Card customizer options */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-zinc-500 text-xs font-mono">Theme: Neon Amethyst</span>
              <div className="flex gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-violet-600 border border-white/20" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white/20" />
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/20" />
                <span className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-white/20" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features section */}
      <section className="border-t border-white/5 bg-white/[0.01] py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Everything you need to showcase your stats
            </h2>
            <p className="text-zinc-400 text-base">
              A comprehensive toolkit to capture, analyze, and customize beautiful cards representing your open-source impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Advanced Analytics</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Dive deep into commit patterns, PR merges, issues resolved, and repository impact stats compiled from GitHub&apos;s APIs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Dynamic SVG Cards</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Render pixel-perfect SVG widgets directly in your GitHub profile READMEs that update automatically in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Complete Privacy</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We respect your data. Your authorization tokens are securely stored locally or in memory, ensuring absolute data safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GitProfileStats. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
