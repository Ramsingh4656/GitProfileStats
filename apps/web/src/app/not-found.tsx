import Link from 'next/link';
import { Terminal, Home, LayoutDashboard, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-center items-center px-6 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main 404 Card */}
      <div className="w-full max-w-lg glass-card rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col items-center text-center">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-600/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-fuchsia-600/10 blur-xl pointer-events-none" />

        {/* Question Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] mb-8">
          <div className="w-full h-full rounded-2xl bg-[#090620] flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        {/* Big Code Error */}
        <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-violet-500 mb-2">
          Error Code: 404_PAGE_NOT_FOUND
        </span>

        {/* Main Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Lost in git space?
        </h1>

        {/* Description */}
        <p className="text-zinc-400 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
          The commit branch or route you requested could not be resolved. It might have been moved,
          deleted, or never existed in the repository tree.
        </p>

        {/* Interactive Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-zinc-950" />
            <span>Go Back Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-zinc-300" />
            <span>View Dashboard</span>
          </Link>
        </div>

        {/* Minimal Terminal Mock Footnote */}
        <div className="w-full flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-600 border-t border-white/5 pt-8 mt-8">
          <Terminal className="w-3.5 h-3.5" />
          <span>$ git checkout main --force</span>
        </div>
      </div>
    </div>
  );
}
