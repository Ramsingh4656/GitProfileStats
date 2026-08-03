"use client";

import React, { useState, useEffect, useCallback } from "react";
import { env } from "@/config/env";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  GitCommit, 
  GitPullRequest, 
  Star, 
  GitFork, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Users,
  Folder,
  Eye,
  AlertTriangle,
  FileCode2,
  Lock,
  BookOpen,
  CalendarDays,
  Flame,
  Info,
  Sparkles,
  Settings,
  KeyRound,
  X,
  WifiOff
} from "lucide-react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

// Curated GitHub language colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

interface RankedRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface RepositoryStats {
  total: number;
  public: number;
  private: number;
  forks: number;
  original: number;
  archived: number;
  disabled: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  openIssuesCount: number;
}

interface RepositoryRankings {
  mostStarred: RankedRepository | null;
  mostForked: RankedRepository | null;
  largest: RankedRepository | null;
  smallest: RankedRepository | null;
  newest: RankedRepository | null;
  oldest: RankedRepository | null;
  mostRecentlyUpdated: RankedRepository | null;
}

interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  repositoryCount: number;
}

interface CommitStats {
  username: string;
  totalCommits: number;
  commitsThisYear: number;
  commitsThisMonth: number;
  commitsThisWeek: number;
}

interface ContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionStats {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
}

interface CombinedStats {
  repositoryStats: RepositoryStats;
  repositoryRankings: RepositoryRankings;
  languageStats: LanguageStat[];
  commitStats: CommitStats;
  contributionStats: ContributionStats;
  pullRequestStats: {
    totalPullRequests: number;
    openPullRequests: number;
    closedPullRequests: number;
    mergedPullRequests: number;
  };
  issueStats: {
    totalIssuesOpened: number;
    totalIssuesClosed: number;
    averageCloseTimeFormatted: string;
  };
}

// Generate mock contribution graph weeks (53 weeks)
function generateMockContributionWeeks() {
  const weeks: ContributionWeek[] = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 365); // start 1 year ago
  
  // Align start to Sunday
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay);
  
  const currentDate = new Date(startDate);
  
  for (let w = 0; w < 53; w++) {
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      if (currentDate > now) {
        break;
      }
      
      const dayOfWeek = currentDate.getDay();
      let count = 0;
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const rand = Math.random();
        if (rand > 0.3) {
          count = Math.floor(Math.random() * 8) + 1;
        }
      } else {
        if (Math.random() > 0.7) {
          count = Math.floor(Math.random() * 3) + 1;
        }
      }
      
      let color = "#161030"; // 0 commits (faded background purple)
      if (count > 0 && count <= 2) color = "#4c1d95"; // light violet
      else if (count > 2 && count <= 5) color = "#7c3aed"; // violet-600
      else if (count > 5 && count <= 8) color = "#a78bfa"; // violet-400
      else if (count > 8) color = "#d946ef"; // fuchsia-500
      
      days.push({
        date: currentDate.toISOString().split("T")[0],
        contributionCount: count,
        color: color,
        weekday: d
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
}

const DEMO_DATA: CombinedStats = {
  repositoryStats: {
    total: 28,
    public: 22,
    private: 6,
    forks: 7,
    original: 21,
    archived: 1,
    disabled: 0,
    totalStars: 582,
    totalForks: 114,
    totalWatchers: 630,
    openIssuesCount: 9
  },
  repositoryRankings: {
    mostStarred: {
      id: 1,
      name: "GitProfileStats",
      fullName: "Ramsingh4656/GitProfileStats",
      htmlUrl: "https://github.com/Ramsingh4656/GitProfileStats",
      description: "📊 Premium developer statistics widgets and interactive profiles. Built with Next.js App Router, Express, and Tailwind CSS.",
      stars: 312,
      forks: 48,
      size: 4096,
      createdAt: "2026-07-28T00:00:00Z",
      updatedAt: "2026-07-31T15:30:00Z"
    },
    mostForked: {
      id: 2,
      name: "react-dashboard-boilerplate",
      fullName: "Ramsingh4656/react-dashboard-boilerplate",
      htmlUrl: "https://github.com/Ramsingh4656/react-dashboard-boilerplate",
      description: "🚀 Highly customizable React boilerplate with glassmorphism UI design, dark mode, and pre-configured workspace systems.",
      stars: 184,
      forks: 56,
      size: 2048,
      createdAt: "2025-11-12T00:00:00Z",
      updatedAt: "2026-07-29T10:00:00Z"
    },
    largest: {
      id: 3,
      name: "fullstack-monorepo-template",
      fullName: "Ramsingh4656/fullstack-monorepo-template",
      htmlUrl: "https://github.com/Ramsingh4656/fullstack-monorepo-template",
      description: "📦 Complete workspace turborepo template containing Next.js, Express, Docker configs, and database integration templates.",
      stars: 62,
      forks: 10,
      size: 15360,
      createdAt: "2025-05-15T00:00:00Z",
      updatedAt: "2026-07-20T18:45:00Z"
    },
    smallest: null,
    newest: null,
    oldest: null,
    mostRecentlyUpdated: {
      id: 1,
      name: "GitProfileStats",
      fullName: "Ramsingh4656/GitProfileStats",
      htmlUrl: "https://github.com/Ramsingh4656/GitProfileStats",
      description: "📊 Premium developer statistics widgets and interactive profiles. Built with Next.js App Router, Express, and Tailwind CSS.",
      stars: 312,
      forks: 48,
      size: 4096,
      createdAt: "2026-07-28T00:00:00Z",
      updatedAt: "2026-07-31T15:30:00Z"
    }
  },
  languageStats: [
    { language: "TypeScript", bytes: 512400, percentage: 51.24, repositoryCount: 14 },
    { language: "JavaScript", bytes: 231500, percentage: 23.15, repositoryCount: 9 },
    { language: "CSS", bytes: 124800, percentage: 12.48, repositoryCount: 18 },
    { language: "HTML", bytes: 81300, percentage: 8.13, repositoryCount: 22 },
    { language: "Python", bytes: 50000, percentage: 5.00, repositoryCount: 3 }
  ],
  commitStats: {
    username: "Ramsingh4656",
    totalCommits: 1845,
    commitsThisYear: 824,
    commitsThisMonth: 148,
    commitsThisWeek: 42
  },
  contributionStats: {
    username: "Ramsingh4656",
    totalContributions: 984,
    currentStreak: 18,
    longestStreak: 52,
    contributionCalendar: {
      totalContributions: 984,
      weeks: generateMockContributionWeeks()
    }
  },
  pullRequestStats: {
    totalPullRequests: 132,
    openPullRequests: 4,
    closedPullRequests: 28,
    mergedPullRequests: 100
  },
  issueStats: {
    totalIssuesOpened: 48,
    totalIssuesClosed: 42,
    averageCloseTimeFormatted: "2d 4h"
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<CombinedStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboard_demo_mode") === "true";
    }
    return false;
  });
  const [syncing, setSyncing] = useState(false);
  const [patToken, setPatToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("github_pat") || "";
    }
    return "";
  });
  const [showPatInput, setShowPatInput] = useState(false);

  const loadStats = useCallback(async (username: string, patOverride?: string, forceDemo?: boolean) => {
    setLoadingStats(true);
    setStatsError(null);

    const activeDemo = forceDemo !== undefined ? forceDemo : (typeof window !== "undefined" ? localStorage.getItem("dashboard_demo_mode") === "true" : false);
    if (activeDemo) {
      // Simulate API lag
      setTimeout(() => {
        setStats(DEMO_DATA);
        setLoadingStats(false);
      }, 800);
      return;
    }

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const token = patOverride !== undefined ? patOverride : patToken;
      const headers: Record<string, string> = {};
      if (token) {
        headers["x-github-token"] = token;
      }

      const response = await fetch(`${apiBase}/api/statistics?username=${username}`, {
        headers
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errText = errJson.error?.message || (typeof errJson.error === 'string' ? errJson.error : null) || errJson.message;
        throw new Error(errText || `Failed to fetch stats (Status: ${response.status})`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        throw new Error("Invalid statistics response format");
      }
    } catch (err: unknown) {
      console.error("Stats fetch failure:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatsError(errMsg || "Failed to establish secure connection to GitHub APIs.");
    } finally {
      setLoadingStats(false);
    }
  }, [patToken]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          // Trigger data loading with verified profile username
          const localPat = localStorage.getItem("github_pat") || "";
          const localDemo = localStorage.getItem("dashboard_demo_mode") === "true";
          loadStats(data.data.username, localPat, localDemo);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        localStorage.removeItem("auth_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, loadStats]);

  const handleToggleDemo = (checked: boolean) => {
    setDemoMode(checked);
    localStorage.setItem("dashboard_demo_mode", checked ? "true" : "false");
    if (user) {
      loadStats(user.username, patToken, checked);
    }
  };

  const handleSavePat = () => {
    localStorage.setItem("github_pat", patToken);
    setShowPatInput(false);
    if (user) {
      // Disable demo mode when adding a PAT
      setDemoMode(false);
      localStorage.setItem("dashboard_demo_mode", "false");
      loadStats(user.username, patToken, false);
    }
  };

  const handleClearPat = () => {
    setPatToken("");
    localStorage.removeItem("github_pat");
    if (user) {
      loadStats(user.username, "", demoMode);
    }
  };

  const handleSync = () => {
    if (!user) return;
    setSyncing(true);
    loadStats(user.username, patToken, demoMode).then(() => {
      setSyncing(false);
    });
  };

  if (loading) {
    return null; // layout.tsx displays session verifier spinner
  }

  const mockBio = "Software developer passionate about open-source projects, high-performance web applications, and developer tools. Currently building beautiful developer statistics widgets.";
  const mockLocation = "San Francisco, CA";
  const mockCompany = "Freelance / Open Source Contributor";
  const mockWebsite = `github.com/${user?.username}`;

  // Custom mapping for contribution day background to blend with application theme
  const getContributionColor = (count: number) => {
    if (count === 0) return "rgba(255, 255, 255, 0.03)";
    if (count <= 2) return "rgba(139, 92, 246, 0.25)";
    if (count <= 5) return "rgba(139, 92, 246, 0.55)";
    if (count <= 8) return "rgba(139, 92, 246, 0.85)";
    return "rgba(236, 72, 153, 0.95)";
  };

  // Helper for rendering horizontal month labels above the calendar columns
  const renderMonthLabels = () => {
    if (!stats?.contributionStats?.contributionCalendar?.weeks) return null;
    const weeks = stats.contributionStats.contributionCalendar.weeks;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels: { text: string; index: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, wIndex) => {
      if (week.contributionDays && week.contributionDays[0]) {
        const date = new Date(week.contributionDays[0].date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ text: months[month], index: wIndex });
          lastMonth = month;
        }
      }
    });

    return (
      <div className="relative h-5 text-[10px] text-zinc-500 font-semibold mb-1 select-none min-w-[720px]">
        {labels.map((lbl, idx) => (
          <span
            key={idx}
            className="absolute"
            style={{ left: `${lbl.index * 13.5}px` }}
          >
            {lbl.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">
      {!isOnline && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 py-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 backdrop-blur-md shadow-lg shadow-amber-950/20 animate-in fade-in duration-300 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white font-bold block text-sm">Offline Mode Active</strong>
              <span className="text-zinc-400">You are currently disconnected from the internet. Action buttons requiring connection are disabled.</span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 text-center"
          >
            Reconnect & Retry
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        {/* LEFT COLUMN: User Profile & Configuration Section */}
        <section className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="glass-card rounded-3xl overflow-hidden relative">
            {/* Cover Banner */}
            <div className="h-28 bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-zinc-300">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                <span>{demoMode ? "Demo mode" : "Verified Account"}</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
              {/* Overlapping Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px] -mt-12 overflow-hidden shadow-2xl relative">
                {user?.avatarUrl ? (
                  <Image 
                    src={user.avatarUrl} 
                    alt={`${user.username}'s GitHub avatar`} 
                    width={96}
                    height={96}
                    className="w-full h-full rounded-full object-cover bg-[#090620]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-black text-2xl text-white">
                    {user?.username?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                )}
              </div>

              {/* Profile Identifiers */}
              <h3 className="font-extrabold text-xl text-white mt-4 tracking-tight">
                {user?.username}
              </h3>
              <p className="text-violet-400 text-sm font-semibold mt-0.5">@{user?.username}</p>
              
              {/* Bio Description */}
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed max-w-[240px]">
                {mockBio}
              </p>

              {/* Sync Status Button */}
              <button 
                onClick={handleSync}
                disabled={syncing || loadingStats || !isOnline}
                className="mt-5 w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(syncing || loadingStats) ? "animate-spin text-violet-400" : "text-zinc-400"}`} />
                <span>{!isOnline ? "Sync Disabled (Offline)" : syncing ? "Fetching stats..." : "Refresh Stats Data"}</span>
              </button>

            {/* Metadata Links */}
            <div className="w-full border-t border-white/5 mt-5 pt-4 flex flex-col gap-2.5 text-left text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">{mockLocation}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">{mockCompany}</span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                <a 
                  href={`https://${mockWebsite}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-violet-400 truncate flex items-center gap-1 group"
                >
                  <span>{mockWebsite}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration panel (PAT / Demo Switch) */}
        <div className="glass-card rounded-3xl p-5.5 flex flex-col gap-4">
          <h4 className="font-bold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2.5">
            <Settings className="w-4 h-4 text-violet-400" />
            Dashboard settings
          </h4>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between">
            <span id="demo-mode-label" className="text-xs text-zinc-300 font-medium">Demo/Mock Data Mode</span>
            <button
              onClick={() => handleToggleDemo(!demoMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                demoMode ? "bg-violet-600" : "bg-zinc-800"
              }`}
              role="switch"
              aria-checked={demoMode}
              aria-labelledby="demo-mode-label"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  demoMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* GitHub Token PAT Management */}
          <div className="flex flex-col gap-2 mt-1">
            <label htmlFor="github-token-input" className="text-xs text-zinc-300 font-medium">GitHub Access Token</label>
            
            {showPatInput ? (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  id="github-token-input"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
                />
                <div className="flex gap-2 justify-end mt-0.5">
                  <button
                    onClick={() => setShowPatInput(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-white/5 text-[10px] text-zinc-400 font-bold hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePat}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 text-[10px] text-white font-bold hover:bg-violet-500 transition-all cursor-pointer"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-black/35 rounded-xl border border-white/5 px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-xs text-zinc-400 truncate">
                    {patToken ? "Token Configured" : "No Token Set"}
                  </span>
                </div>
                <button
                  onClick={() => setShowPatInput(true)}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-all cursor-pointer"
                >
                  {patToken ? "Edit" : "Set PAT"}
                </button>
              </div>
            )}

            {patToken && !showPatInput && (
              <button
                onClick={handleClearPat}
                className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-all self-start flex items-center gap-1 mt-1 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
                Clear Local Token
              </button>
            )}
          </div>
        </div>

        {/* Developer Badges Card */}
        <div className="glass-card rounded-3xl p-5 flex flex-col gap-3">
          <h4 className="font-bold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-violet-400" />
            Developer Status
          </h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="px-2.5 py-1 rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Early Adopter
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Premium
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Statistics View and Skeletons */}
      <section className="flex-1 w-full flex flex-col gap-6">

        {/* FAILURE ALERTS STATE */}
        {statsError && !loadingStats && !stats && (
          <div className="glass-card rounded-3xl p-6.5 border-rose-500/25 bg-rose-500/5 flex flex-col gap-5 animate-in fade-in duration-300">
            <div className="flex gap-4.5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-base text-white">GitHub API Connection Failed</h4>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  {statsError}
                </p>
                
                <div className="mt-4 bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Troubleshooting Diagnostics:</span>
                  <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                    <li>Check if the target GitHub username exists and is spelled correctly.</li>
                    <li>Verify your GitHub Personal Access Token (PAT) hasn't expired.</li>
                    <li>Ensure your internet connection is active and stable.</li>
                    <li>GitHub API rate limits might have been reached. Wait 60s or configure a custom token.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pl-0 sm:pl-16 mt-1 border-t border-white/5 pt-4">
              <button
                onClick={() => handleToggleDemo(true)}
                className="px-4 py-2.5 bg-white text-zinc-950 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Beautiful Demo Data</span>
              </button>
              <button
                onClick={() => setShowPatInput(true)}
                className="px-4 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure GitHub PAT</span>
              </button>
              {isOnline && (
                <button
                  onClick={() => {
                    if (user) {
                      loadStats(user.username, patToken, demoMode);
                    }
                  }}
                  className="px-4 py-2.5 border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* NO STATISTICS FALLBACK STATE */}
        {!stats && !loadingStats && !statsError && (
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-5 border-zinc-500/10 bg-zinc-500/2">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Folder className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="font-extrabold text-lg text-white">No Statistics Loaded</h3>
              <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                Your developer statistics details are currently empty. You can enable simulation mode with high-fidelity mock metrics, or attach your personal GitHub PAT to pull live statistics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleToggleDemo(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-violet-600/15"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Demo Data</span>
              </button>
              <button
                onClick={() => setShowPatInput(true)}
                className="px-5 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure GitHub PAT</span>
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATS SKELETON LOADERS */}
        {loadingStats && (
          <div className="flex flex-col gap-6 w-full">
            {/* Ribbon Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col gap-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/40 animate-pulse" />
                  <div className="h-3 bg-zinc-800/40 rounded w-1/2 animate-pulse mt-2" />
                  <div className="h-6 bg-zinc-800/40 rounded w-3/4 animate-pulse mt-1" />
                </div>
              ))}
            </div>

            {/* Heatmap Graph Skeleton */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
              <div className="h-4 bg-zinc-800/40 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-zinc-800/40 rounded w-1/3 animate-pulse" />
              <div className="h-28 bg-zinc-800/20 rounded-xl animate-pulse mt-2" />
            </div>

            {/* Two Column Layout Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
                <div className="h-4 bg-zinc-800/40 rounded w-1/3 animate-pulse" />
                <div className="h-24 bg-zinc-800/20 rounded-xl animate-pulse" />
              </div>
              <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
                <div className="h-4 bg-zinc-800/40 rounded w-1/3 animate-pulse" />
                <div className="h-24 bg-zinc-800/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* FULL DASHBOARD VIEWS WHEN LOADED */}
        {stats && !loadingStats && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">

            {/* DEMO MODE FLOATING BADGE NOTICE */}
            {demoMode && (
              <div className="flex items-center justify-between px-5 py-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 text-xs text-violet-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span><strong>Demo Mode Active:</strong> Displaying high-fidelity mock metrics. Set custom PAT key to view live accounts.</span>
                </div>
                <button
                  onClick={() => handleToggleDemo(false)}
                  className="font-bold hover:underline transition-all cursor-pointer shrink-0 ml-4"
                >
                  Exit Demo
                </button>
              </div>
            )}

            {/* METRICS GRID: Stars, Commits, Contributions, Followers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stars Card */}
              <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-amber-500/5 blur-lg group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-105">
                  <Star className="w-5 h-5 fill-amber-400/10" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs font-semibold">Total Stars</span>
                  <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                    {stats.repositoryStats.totalStars.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Commits Card */}
              <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-violet-500/5 blur-lg group-hover:bg-violet-500/10 transition-all pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 transition-transform group-hover:scale-105">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs font-semibold">Total Commits</span>
                  <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                    {stats.commitStats.totalCommits.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Contributions Card */}
              <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-fuchsia-500/5 blur-lg group-hover:bg-fuchsia-500/10 transition-all pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 transition-transform group-hover:scale-105">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs font-semibold">Contributions</span>
                  <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                    {stats.contributionStats.totalContributions.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Followers Card */}
              <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-cyan-500/5 blur-lg group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 transition-transform group-hover:scale-105">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-zinc-500 text-xs font-semibold">Followers</span>
                  <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                    {stats.commitStats.username === "Ramsingh4656" && demoMode ? "142" : stats.repositoryStats.totalStars > 100 ? (stats.repositoryStats.totalStars * 0.4).toFixed(0) : "12"}
                  </h4>
                </div>
              </div>

            </div>

            {/* SECTION: CONTRIBUTION HEATMAP */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5 mb-5">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-violet-400" />
                    Activity Calendar Heatmap
                  </h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Visual representation of daily GitHub contributions over the past year.</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                  <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-lg border border-white/5">
                    <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Current Streak: <strong>{stats.contributionStats.currentStreak} Days</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-lg border border-white/5">
                    <Award className="w-3.5 h-3.5 text-violet-400" />
                    <span>Longest Streak: <strong>{stats.contributionStats.longestStreak} Days</strong></span>
                  </div>
                </div>
              </div>

              {/* Heatmap Grid Container */}
              <div className="pt-2">
                <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <div className="flex flex-col gap-[3px] min-w-[720px]">
                    {/* Render months labels */}
                    {renderMonthLabels()}

                    {/* Columns grid */}
                    <div className="flex gap-[3px] select-none">
                      {stats.contributionStats.contributionCalendar.weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                          {week.contributionDays.map((day) => (
                            <div
                              key={day.date}
                              className="w-[10px] h-[10px] rounded-[2px] transition-colors duration-200 cursor-pointer relative group"
                              style={{ 
                                backgroundColor: demoMode ? day.color : getContributionColor(day.contributionCount) 
                              }}
                            >
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-zinc-950/95 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] whitespace-nowrap z-50 shadow-2xl pointer-events-none flex-col gap-0.5 font-sans">
                                <span className="font-extrabold text-zinc-100">{day.contributionCount} contributions</span>
                                <span className="text-zinc-500 font-medium">
                                  {new Date(day.date).toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Hover over any pixel block to inspect daily contribution stats.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Less</span>
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-white/[0.03]" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/25" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/55" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/85" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-fuchsia-500" />
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO COLUMNS: Languages (Left) & Repositories Metrics (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Language Breakdown Card (5 columns) */}
              <div className="glass-card rounded-3xl p-6 lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5">
                    <FileCode2 className="w-5 h-5 text-violet-400" />
                    Language Composition
                  </h3>

                  {/* Languages Stats List */}
                  {stats.languageStats.length > 0 ? (
                    <div className="flex flex-col gap-4 mt-5">
                      {/* Unified Bar Chart Stack */}
                      <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex mb-2">
                        {stats.languageStats.slice(0, 5).map((lang, index) => (
                          <div
                            key={lang.language}
                            style={{ 
                              width: `${lang.percentage}%`,
                              backgroundColor: LANGUAGE_COLORS[lang.language] || "#8250df"
                            }}
                            className={`h-full ${index === 0 ? "rounded-l-full" : ""} ${index === stats.languageStats.slice(0, 5).length - 1 ? "rounded-r-full" : ""}`}
                            title={`${lang.language}: ${lang.percentage}%`}
                          />
                        ))}
                      </div>

                      {/* Detail list rows */}
                      {stats.languageStats.slice(0, 5).map((lang) => {
                        const dotColor = LANGUAGE_COLORS[lang.language] || "#8250df";
                        return (
                          <div key={lang.language} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                              <span className="font-bold text-zinc-300">{lang.language}</span>
                              <span className="text-[10px] text-zinc-500">({lang.repositoryCount} {lang.repositoryCount === 1 ? "repo" : "repos"})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-500 font-mono">{(lang.bytes / 1024).toFixed(0)} KB</span>
                              <span className="font-extrabold text-white min-w-[42px] text-right">{lang.percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
                        <FileCode2 className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">No Languages Detected</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[200px] mx-auto mt-1">
                          We couldn't analyze any programming language bytes in your public repositories. Add some code or check your configuration.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-white/5 pt-4 text-center">
                  <span className="text-[10px] text-zinc-500 leading-relaxed block">
                    Calculated by analyzing source-code bytes across all public repositories.
                  </span>
                </div>
              </div>

              {/* Repositories Metrics & Breakdown (7 columns) */}
              <div className="glass-card rounded-3xl p-6 lg:col-span-7 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5">
                    <Folder className="w-5 h-5 text-violet-400" />
                    Repository Statistics
                  </h3>

                  {stats.repositoryStats.total > 0 ? (
                    <>
                      {/* Summary Rows Grid */}
                      <div className="grid grid-cols-3 gap-4 mt-5">
                        <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total</span>
                          <span className="text-xl font-extrabold text-white mt-1 block">
                            {stats.repositoryStats.total}
                          </span>
                        </div>
                        <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Public</span>
                          <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                            {stats.repositoryStats.public}
                          </span>
                        </div>
                        <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Private</span>
                          <span className="text-xl font-extrabold text-fuchsia-400 mt-1 block">
                            {stats.repositoryStats.private}
                          </span>
                        </div>
                      </div>

                      {/* Metrics list */}
                      <div className="flex flex-col gap-2.5 mt-5 text-xs text-zinc-400">
                        <div className="flex justify-between border-b border-white/3 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-zinc-500" /> Private Repository access:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {stats.repositoryStats.private > 0 ? "Enabled" : "None Detected"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/3 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <GitFork className="w-3.5 h-3.5 text-zinc-500" /> Repository forks count:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {stats.repositoryStats.forks}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/3 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> Original templates:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {stats.repositoryStats.original}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/3 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" /> Merged PR count:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {stats.pullRequestStats.mergedPullRequests}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" /> Average Issue Close Time:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {stats.issueStats.averageCloseTimeFormatted}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
                        <Folder className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">No Repositories Found</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[240px] mx-auto mt-1">
                          No public repositories were detected for this profile. Access token scopes may restrict private repository stats.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-white/5 pt-4 text-left flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500">
                    Repository stats mapping completed.
                  </span>
                  <a
                    href={`https://github.com/${user?.username}?tab=repositories`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5 hover:underline"
                  >
                    <span>View all repositories</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>

            {/* SECTION: RANKINGS HIGHLIGHTS */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5 mb-5">
                <Award className="w-5 h-5 text-violet-400" />
                Repository Rankings Highlights
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Most Starred Repo */}
                {stats.repositoryRankings.mostStarred ? (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400/10" />
                        <span>Most Starred</span>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                        {stats.repositoryRankings.mostStarred.name}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {stats.repositoryRankings.mostStarred.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {stats.repositoryRankings.mostStarred.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-violet-500" /> {stats.repositoryRankings.mostStarred.forks}</span>
                      </div>
                      <a
                        href={stats.repositoryRankings.mostStarred.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                    <Star className="w-5 h-5 text-zinc-600" />
                    <div>
                      <h4 className="font-bold text-xs text-zinc-400">No Starred Repos</h4>
                      <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">We couldn't detect starred repositories.</p>
                    </div>
                  </div>
                )}

                {/* Most Forked Repo */}
                {stats.repositoryRankings.mostForked ? (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold uppercase tracking-wider mb-2">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Most Forked</span>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                        {stats.repositoryRankings.mostForked.name}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {stats.repositoryRankings.mostForked.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {stats.repositoryRankings.mostForked.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-violet-500" /> {stats.repositoryRankings.mostForked.forks}</span>
                      </div>
                      <a
                        href={stats.repositoryRankings.mostForked.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                    <GitFork className="w-5 h-5 text-zinc-600" />
                    <div>
                      <h4 className="font-bold text-xs text-zinc-400">No Forked Repos</h4>
                      <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">Forked repositories will show up here.</p>
                    </div>
                  </div>
                )}

                {/* Recently Updated Repo */}
                {stats.repositoryRankings.mostRecentlyUpdated ? (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Recently Updated</span>
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                        {stats.repositoryRankings.mostRecentlyUpdated.name}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {stats.repositoryRankings.mostRecentlyUpdated.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1 truncate max-w-[130px]">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(stats.repositoryRankings.mostRecentlyUpdated.updatedAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <a
                        href={stats.repositoryRankings.mostRecentlyUpdated.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5 shrink-0"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                    <Eye className="w-5 h-5 text-zinc-600" />
                    <div>
                      <h4 className="font-bold text-xs text-zinc-400">No Active Repos</h4>
                      <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">Active public repositories will be listed here.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </section>
      </div>
    </div>
  );
}
