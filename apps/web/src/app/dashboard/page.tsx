"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Terminal, 
  LayoutDashboard, 
  GitPullRequest, 
  Star, 
  Settings, 
  LogOut, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  Layers, 
  Info,
  Calendar,
  Eye
} from "lucide-react";

type CardType = "stats" | "languages";
type Theme = "violet" | "emerald" | "rose" | "amber";

export default function DashboardPage() {
  // Theme and config states
  const [cardType, setCardType] = useState<CardType>("stats");
  const [theme, setTheme] = useState<Theme>("violet");
  const [showStars, setShowStars] = useState(true);
  const [showPRs, setShowPRs] = useState(true);
  const [showCommits, setShowCommits] = useState(true);
  
  // Copy state
  const [copied, setCopied] = useState(false);

  // Computed styles based on states
  const getThemeStyles = () => {
    switch (theme) {
      case "emerald":
        return {
          cardBg: "from-emerald-950/20 via-[#030014] to-[#030014]",
          cardBorder: "border-emerald-500/20 group-hover:border-emerald-500/40",
          accentColor: "text-emerald-400",
          accentBg: "bg-emerald-500",
          accentGradient: "from-emerald-500 to-teal-500",
          glowBg: "bg-emerald-600/10"
        };
      case "rose":
        return {
          cardBg: "from-rose-950/20 via-[#030014] to-[#030014]",
          cardBorder: "border-rose-500/20 group-hover:border-rose-500/40",
          accentColor: "text-rose-400",
          accentBg: "bg-rose-500",
          accentGradient: "from-rose-500 to-pink-500",
          glowBg: "bg-rose-600/10"
        };
      case "amber":
        return {
          cardBg: "from-amber-950/20 via-[#030014] to-[#030014]",
          cardBorder: "border-amber-500/20 group-hover:border-amber-500/40",
          accentColor: "text-amber-400",
          accentBg: "bg-amber-500",
          accentGradient: "from-amber-500 to-orange-500",
          glowBg: "bg-amber-600/10"
        };
      case "violet":
      default:
        return {
          cardBg: "from-violet-950/20 via-[#030014] to-[#030014]",
          cardBorder: "border-violet-500/20 group-hover:border-violet-500/40",
          accentColor: "text-violet-400",
          accentBg: "bg-violet-500",
          accentGradient: "from-violet-600 to-fuchsia-600",
          glowBg: "bg-violet-600/10"
        };
    }
  };

  const currentTheme = getThemeStyles();

  // Mock Markdown generator for output
  const getEmbedCode = () => {
    return `[![GitHub Stats](https://git-profile-stats.vercel.app/api/card?user=octocat&type=${cardType}&theme=${theme}&stars=${showStars}&prs=${showPRs}&commits=${showCommits})](https://github.com/octocat)`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col md:flex-row selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-[-200px] left-[-100px] opacity-40 pointer-events-none" />
      <div className="glow-spot bottom-[-200px] right-[-100px] opacity-40 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#030014]/80 backdrop-blur-md flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            GitProfile<span className="text-violet-500">Stats</span>
          </span>
        </div>

        {/* User profile brief */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px]">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden font-bold text-sm">
              OCT
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-sm text-white">The Octocat</h5>
            <p className="text-zinc-500 text-xs font-mono">octocat@github.com</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 flex-1 flex flex-col gap-1.5">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white text-sm font-medium text-left">
            <LayoutDashboard className="w-4 h-4 text-violet-400" />
            <span>Overview & Cards</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 text-zinc-400 hover:text-white text-sm font-medium text-left transition-colors">
            <Code2 className="w-4 h-4 text-zinc-500" />
            <span>Repository Stats</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 text-zinc-400 hover:text-white text-sm font-medium text-left transition-colors">
            <Settings className="w-4 h-4 text-zinc-500" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Footer Log Out */}
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-rose-400 text-sm font-medium transition-colors group">
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-10">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Analytics Overview</h2>
            <p className="text-zinc-400 text-sm mt-1">Configure and share your dynamic Git profile metrics.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/3 text-zinc-400 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last synced: Just now</span>
          </div>
        </div>

        {/* Highlights Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Stars Earned</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-white">1,824</span>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-zinc-500 text-xs mt-2">+12 this week</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Total Commits</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-white">1,482</span>
              <Terminal className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-zinc-500 text-xs mt-2">In 24 repositories</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">PRs Merged</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-white">84</span>
              <GitPullRequest className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-xs mt-2 font-semibold">96% Acceptance rate</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Active Repos</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-white">16</span>
              <Layers className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-zinc-500 text-xs mt-2">Updated past 30 days</p>
          </div>
        </div>

        {/* Customizer Workspace */}
        <div className="grid xl:grid-cols-12 gap-8 items-start">
          
          {/* Settings Column */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-white">Card Configurator</h3>
              </div>

              {/* Select Card Type */}
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Card Theme Style</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button 
                    onClick={() => setCardType("stats")} 
                    className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${cardType === "stats" ? "bg-white/10 border-white/20 text-white" : "border-white/5 bg-white/2 text-zinc-400 hover:text-zinc-200"}`}
                  >
                    Repository Stats
                  </button>
                  <button 
                    onClick={() => setCardType("languages")} 
                    className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${cardType === "languages" ? "bg-white/10 border-white/20 text-white" : "border-white/5 bg-white/2 text-zinc-400 hover:text-zinc-200"}`}
                  >
                    Top Languages
                  </button>
                </div>
              </div>

              {/* Color Themes */}
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Accent Theme Color</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(["violet", "emerald", "rose", "amber"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`py-2.5 rounded-lg border text-xs font-bold capitalize transition-all ${theme === t ? "border-white/30 bg-white/10 text-white" : "border-white/5 bg-white/2 text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${t === "violet" ? "bg-violet-500" : t === "emerald" ? "bg-emerald-500" : t === "rose" ? "bg-rose-500" : "bg-amber-500"}`} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Metrics */}
              {cardType === "stats" && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Display Metrics</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-zinc-300 select-none">
                      <input 
                        type="checkbox" 
                        checked={showStars} 
                        onChange={(e) => setShowStars(e.target.checked)}
                        className="accent-violet-500 rounded border-white/10 bg-[#030014] w-4 h-4"
                      />
                      <span>Show Star Stats</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-zinc-300 select-none">
                      <input 
                        type="checkbox" 
                        checked={showPRs} 
                        onChange={(e) => setShowPRs(e.target.checked)}
                        className="accent-violet-500 rounded border-white/10 bg-[#030014] w-4 h-4"
                      />
                      <span>Show PR Analytics</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-zinc-300 select-none">
                      <input 
                        type="checkbox" 
                        checked={showCommits} 
                        onChange={(e) => setShowCommits(e.target.checked)}
                        className="accent-violet-500 rounded border-white/10 bg-[#030014] w-4 h-4"
                      />
                      <span>Show Commit Counters</span>
                    </label>
                  </div>
                </div>
              )}

              {cardType === "languages" && (
                <div className="text-xs text-zinc-500 flex gap-2 border-t border-white/5 pt-4">
                  <Info className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Top languages breakdown is calculated automatically based on code volume across your public repositories.</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview Column */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            
            {/* Realtime Live preview */}
            <div className="flex flex-col gap-3">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Live Card Preview
              </span>
              
              <div className={`w-full glass-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br ${currentTheme.cardBg} border border-white/5`}>
                {/* Visual Glow Spotlight */}
                <div className={`absolute top-0 right-0 w-36 h-36 rounded-full ${currentTheme.glowBg} blur-2xl pointer-events-none`} />

                {/* Profile Header inside card */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-lg bg-gradient-to-tr ${currentTheme.accentGradient} p-[1px]`}>
                      <div className="w-full h-full rounded-lg bg-[#090620] flex items-center justify-center font-bold text-sm text-white">
                        OCT
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        The Octocat
                        <span className={`w-1.5 h-1.5 rounded-full ${theme === "violet" ? "bg-violet-400" : theme === "emerald" ? "bg-emerald-400" : theme === "rose" ? "bg-rose-400" : "bg-amber-400"}`} />
                      </h4>
                      <p className="text-zinc-500 text-xs">github.com/octocat</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">GitProfileStats</span>
                </div>

                {/* Dynamic Content: Stats Card */}
                {cardType === "stats" && (
                  <div className="py-6 flex flex-col gap-4">
                    {showStars && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Star className={`w-4 h-4 ${currentTheme.accentColor}`} /> Total Stars
                        </span>
                        <span className="font-bold text-white">1,824</span>
                      </div>
                    )}
                    {showPRs && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <GitPullRequest className={`w-4 h-4 ${currentTheme.accentColor}`} /> PRs Merged
                        </span>
                        <span className="font-bold text-white">84</span>
                      </div>
                    )}
                    {showCommits && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400 flex items-center gap-2">
                          <Terminal className={`w-4 h-4 ${currentTheme.accentColor}`} /> Total Commits
                        </span>
                        <span className="font-bold text-white">1,482</span>
                      </div>
                    )}
                    {(!showStars && !showPRs && !showCommits) && (
                      <div className="py-6 text-center text-zinc-500 text-sm">
                        No metrics selected. Enable them in the configurator.
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Content: Top Languages Card */}
                {cardType === "languages" && (
                  <div className="py-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">TypeScript</span>
                        <span className="text-zinc-400">54.2%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${currentTheme.accentGradient}`} style={{ width: "54.2%" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">Rust</span>
                        <span className="text-zinc-400">22.8%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${currentTheme.accentGradient}`} style={{ width: "22.8%" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">CSS / Tailwind</span>
                        <span className="text-zinc-400">14.0%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${currentTheme.accentGradient}`} style={{ width: "14%" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white">Other</span>
                        <span className="text-zinc-400">9.0%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-zinc-600" style={{ width: "9%" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer block */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-zinc-500 text-xs">
                  <span>Custom theme: {theme}</span>
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>

            {/* Markdown Export Box */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="font-bold text-white text-base">Embed Markdown Code</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Copy the code block below and paste it into your GitHub README file. The card stats will pull live updates dynamically.
              </p>

              <div className="relative">
                <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 pr-12 text-xs font-mono text-zinc-300 break-all select-all leading-relaxed whitespace-pre-wrap">
                  {getEmbedCode()}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg border border-white/5 bg-white/3 hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  title="Copy Embed Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
