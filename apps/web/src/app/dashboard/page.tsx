"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Calendar, 
  GitCommit, 
  GitPullRequest, 
  Star, 
  GitFork, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Award
} from "lucide-react";

// Custom GitHub SVG component for compatibility with lucide-react version 1.28
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


interface ActivityItem {
  id: string;
  type: "commit" | "pr" | "star" | "fork";
  repo: string;
  desc: string;
  time: string;
  meta?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activityFilter, setActivityFilter] = useState<"all" | "commits" | "prs">("all");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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
  }, [router]);

  const handleSync = () => {
    setSyncing(true);
    // Simulate GitHub sync
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  const activities: ActivityItem[] = [
    {
      id: "act-1",
      type: "commit",
      repo: "Ramsingh4656/GitProfileStats",
      desc: "Pushed 3 commits to branch main: added dashboard sidebar layout and responsive header",
      time: "2 hours ago",
      meta: "commit hash: ae8f3bc"
    },
    {
      id: "act-2",
      type: "pr",
      repo: "Ramsingh4656/GitProfileStats",
      desc: "Opened Pull Request #14: 'feat: implement Next.js App Router root layout styling'",
      time: "1 day ago",
      meta: "Status: Approved"
    },
    {
      id: "act-3",
      type: "star",
      repo: "facebook/react",
      desc: "Starred repository facebook/react",
      time: "3 days ago"
    },
    {
      id: "act-4",
      type: "commit",
      repo: "Ramsingh4656/GitProfileStats",
      desc: "Pushed 1 commit to main: initial project workspace setup with turborepo settings",
      time: "4 days ago",
      meta: "commit hash: df62c12"
    },
    {
      id: "act-5",
      type: "fork",
      repo: "vercel/next.js",
      desc: "Forked repository vercel/next.js to Ramsingh4656/next.js",
      time: "1 week ago"
    }
  ];

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === "commits") return activity.type === "commit";
    if (activityFilter === "prs") return activity.type === "pr";
    return true;
  });

  if (loading) {
    return null; // layout.tsx handles loading shell
  }

  const mockJoinedDate = "July 2026"; // Mock Github data values
  const mockBio = "Software developer passionate about open-source projects, high-performance web applications, and developer tools. Currently building beautiful developer statistics widgets.";
  const mockLocation = "San Francisco, CA";
  const mockCompany = "Freelance / Open Source Contributor";
  const mockWebsite = `github.com/${user?.username}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* LEFT COLUMN: User Profile Section */}
      <section className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="glass-card rounded-3xl overflow-hidden relative">
          {/* Cover Banner */}
          <div className="h-28 bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-2 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-zinc-300">
              <ShieldCheck className="w-3 h-3 text-violet-400" />
              <span>Verified Account</span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
            {/* Overlapping Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px] -mt-12 overflow-hidden shadow-2xl relative">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
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
              disabled={syncing}
              className="mt-5 w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-violet-400" : "text-zinc-400"}`} />
              <span>{syncing ? "Syncing Github data..." : "Sync Profile Data"}</span>
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
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>Joined {mockJoinedDate}</span>
              </div>
            </div>
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

      {/* RIGHT COLUMN: Recent Activity Placeholder */}
      <section className="flex-1 w-full flex flex-col gap-6">
        
        {/* Activity Panel */}
        <div className="glass-card rounded-3xl p-6.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
            <div>
              <h3 className="font-bold text-lg text-white">Recent Git Activity</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Timeline tracking event metrics and codebase commits.</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl border border-white/5 self-start">
              {(["all", "commits", "prs"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activityFilter === filter 
                      ? "bg-white/5 border border-white/5 text-white" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {filter === "all" ? "All" : filter === "commits" ? "Commits" : "PRs"}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Feed Container */}
          <div className="pt-6 relative">
            {/* Vertical timeline vertical connector line */}
            <div className="absolute left-6.5 top-0 bottom-6 w-[2px] bg-white/5 z-0" />

            {/* List items */}
            {filteredActivities.length > 0 ? (
              <div className="flex flex-col gap-6.5">
                {filteredActivities.map((act) => {
                  return (
                    <div key={act.id} className="flex gap-4 relative z-10 group">
                      
                      {/* Timeline Icon Wrapper */}
                      <div className={`w-13 h-13 rounded-xl border flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                        act.type === "commit" 
                          ? "bg-violet-500/10 border-violet-500/20 text-violet-400" 
                          : act.type === "pr" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : act.type === "star"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      }`}>
                        {act.type === "commit" && <GitCommit className="w-5.5 h-5.5" />}
                        {act.type === "pr" && <GitPullRequest className="w-5.5 h-5.5" />}
                        {act.type === "star" && <Star className="w-5.5 h-5.5" />}
                        {act.type === "fork" && <GitFork className="w-5.5 h-5.5" />}
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-semibold text-xs font-mono text-zinc-500 uppercase tracking-wider">
                            {act.repo}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium shrink-0">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm mt-1.5 leading-relaxed">
                          {act.desc}
                        </p>
                        {act.meta && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-md px-2 py-0.5 text-[10px] font-mono text-zinc-500">
                            {act.meta}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-white/5 bg-white/2 flex items-center justify-center text-zinc-600">
                  <GithubIcon className="w-6 h-6" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">No activity matching the filters.</p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredActivities.length > 0 && (
            <div className="mt-8 border-t border-white/5 pt-6 text-center">
              <button className="px-6 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                Load Older Activity
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Placeholder info card */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-violet-950/10 via-[#030014] to-[#030014] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-violet-600/5 blur-2xl pointer-events-none" />
          <div className="flex gap-4 items-start md:items-center min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Interactive Statistics Integration</h4>
              <p className="text-zinc-500 text-xs mt-1 max-w-lg leading-relaxed">
                Connect and build cards displaying stars earned, pull request counts, streaks, and top repository contributions once metrics ingestion is established.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 border border-violet-500/20 bg-violet-500/10 text-violet-400 rounded-xl font-bold text-xs transition-all hover:bg-violet-500/20 cursor-pointer shrink-0">
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
}
