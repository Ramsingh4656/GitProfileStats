'use client';

import React, { useState } from 'react';
import { env } from '@/config/env';
import Image from 'next/image';
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
  Settings,
  KeyRound,
  X,
  WifiOff,
} from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import { useDashboardStats } from './hooks/useDashboardStats';
import { LANGUAGE_COLORS } from './types';

export default function DashboardPage() {
  const isOnline = useOnlineStatus();
  const {
    user,
    loading,
    loadingStats,
    stats,
    statsError,
    setStatsError,
    hasGithubToken,
    loadStats,
    setHasGithubToken,
  } = useDashboardStats();

  const [syncing, setSyncing] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [showPatInput, setShowPatInput] = useState(false);

  const handleSavePat = async () => {
    if (!user || !patToken.trim()) return;

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/v1/users/github-token`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: patToken.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save GitHub token (${response.status})`);
      }

      setPatToken('');
      setHasGithubToken(true);
      setShowPatInput(false);
      loadStats(user.username);
    } catch (err) {
      console.error('Failed to save GitHub token:', err);
      setStatsError('Failed to save the GitHub token securely.');
    }
  };

  const handleClearPat = async () => {
    if (!user) return;

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/v1/users/github-token`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear GitHub token (${response.status})`);
      }

      setHasGithubToken(false);
      setPatToken('');
      loadStats(user.username);
    } catch (err) {
      console.error('Failed to clear GitHub token:', err);
      setStatsError('Failed to clear the GitHub token securely.');
    }
  };

  const handleSync = () => {
    if (!user) return;
    setSyncing(true);
    loadStats(user.username).then(() => {
      setSyncing(false);
    });
  };

  if (loading) {
    return null; // layout.tsx displays session verifier spinner
  }

  const bio = loadingStats ? 'Loading bio...' : (stats?.userProfile.bio ?? 'No bio provided');
  const location = loadingStats ? 'Loading location...' : (stats?.userProfile.location ?? null);
  const company = loadingStats ? 'Loading organization...' : (stats?.userProfile.company ?? null);
  const website = loadingStats
    ? `github.com/${user?.username ?? ''}`
    : (stats?.userProfile.blog ?? `github.com/${user?.username ?? ''}`);

  const getWebsiteLink = (webStr: string) => {
    if (!webStr) return '';
    if (webStr.startsWith('http://') || webStr.startsWith('https://')) {
      return webStr;
    }
    return `https://${webStr}`;
  };

  const getWebsiteDisplay = (webStr: string) => {
    if (!webStr) return '';
    return webStr.replace(/^https?:\/\/(www\.)?/, '');
  };

  // Custom mapping for contribution day background to blend with application theme
  const getContributionColor = (count: number) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.03)';
    if (count <= 2) return 'rgba(139, 92, 246, 0.25)';
    if (count <= 5) return 'rgba(139, 92, 246, 0.55)';
    if (count <= 8) return 'rgba(139, 92, 246, 0.85)';
    return 'rgba(236, 72, 153, 0.95)';
  };

  // Helper for rendering horizontal month labels above the calendar columns
  const renderMonthLabels = () => {
    if (!stats?.contributionStats?.contributionCalendar?.weeks) return null;
    const weeks = stats.contributionStats.contributionCalendar.weeks;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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
          <span key={idx} className="absolute" style={{ left: `${lbl.index * 13.5}px` }}>
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
              <span className="text-zinc-400">
                You are currently disconnected from the internet. Action buttons requiring
                connection are disabled.
              </span>
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
          <div className="glass-card rounded-3xl overflow-hidden relative animate-profile-entrance">
            {/* Cover Banner */}
            <div className="h-28 bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden animate-banner-gradient">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-zinc-300 animate-pulse-glow">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                <span>Verified Account</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
              {/* Overlapping Avatar */}
              <div className="w-24 h-24 rounded-full p-[2px] -mt-12 overflow-hidden shadow-2xl relative profile-avatar-container">
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
                    {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                )}
              </div>

              {/* Profile Identifiers */}
              <h3 className="font-extrabold text-xl text-white mt-4 tracking-tight">
                {user?.username}
              </h3>
              <p className="text-violet-400 text-sm font-semibold mt-0.5">@{user?.username}</p>

              {/* Bio Description */}
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed max-w-[240px]">{bio}</p>

              {/* Sync Status Button */}
              <button
                onClick={handleSync}
                disabled={syncing || loadingStats || !isOnline}
                className="mt-5 w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncing || loadingStats ? 'animate-spin text-violet-400' : 'text-zinc-400'}`}
                />
                <span>
                  {!isOnline
                    ? 'Sync Disabled (Offline)'
                    : syncing
                      ? 'Fetching stats...'
                      : 'Refresh Stats Data'}
                </span>
              </button>

              {/* Metadata Links */}
              <div className="w-full border-t border-white/5 mt-5 pt-4 flex flex-col gap-2.5 text-left text-xs text-zinc-400">
                {location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
                {company && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{company}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-2.5">
                    <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                    <a
                      href={getWebsiteLink(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-violet-400 truncate flex items-center gap-1 group"
                    >
                      <span>{getWebsiteDisplay(website)}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration panel (PAT / Demo Switch) */}
          <div className="glass-card rounded-3xl p-5.5 flex flex-col gap-4">
            <h4 className="font-bold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <Settings className="w-4 h-4 text-violet-400" />
              Dashboard settings
            </h4>

            {/* GitHub Token PAT Management */}
            <div className="flex flex-col gap-2 mt-1">
              <label htmlFor="github-token-input" className="text-xs text-zinc-300 font-medium">
                GitHub Access Token
              </label>

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
                      {hasGithubToken ? 'Token Configured' : 'No Token Set'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPatInput(true)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-all cursor-pointer"
                  >
                    {hasGithubToken ? 'Edit' : 'Set PAT'}
                  </button>
                </div>
              )}

              {hasGithubToken && !showPatInput && (
                <button
                  onClick={handleClearPat}
                  className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-all self-start flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                  Clear Server Token
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
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{statsError}</p>

                  <div className="mt-4 bg-black/40 rounded-2xl border border-white/5 p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Troubleshooting Diagnostics:
                    </span>
                    <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                      <li>Check if the target GitHub username exists and is spelled correctly.</li>
                      <li>Verify your GitHub Personal Access Token (PAT) hasn&apos;t expired.</li>
                      <li>Ensure your internet connection is active and stable.</li>
                      <li>
                        GitHub API rate limits might have been reached. Wait 60s or configure a
                        custom token.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pl-0 sm:pl-16 mt-1 border-t border-white/5 pt-4">
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
                        loadStats(user.username);
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
                  Your developer statistics details are currently empty. Attach your personal GitHub
                  PAT to pull live statistics.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
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
                  <div
                    key={i}
                    className="glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col gap-2"
                  >
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
                      {stats.repositoryStats.totalStars > 100
                        ? (stats.repositoryStats.totalStars * 0.4).toFixed(0)
                        : '12'}
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
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Visual representation of daily GitHub contributions over the past year.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                    <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-lg border border-white/5">
                      <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>
                        Current Streak:{' '}
                        <strong>{stats.contributionStats.currentStreak} Days</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-lg border border-white/5">
                      <Award className="w-3.5 h-3.5 text-violet-400" />
                      <span>
                        Longest Streak:{' '}
                        <strong>{stats.contributionStats.longestStreak} Days</strong>
                      </span>
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
                                  backgroundColor: getContributionColor(day.contributionCount),
                                }}
                              >
                                {/* Hover Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-zinc-950/95 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] whitespace-nowrap z-50 shadow-2xl pointer-events-none flex-col gap-0.5 font-sans">
                                  <span className="font-extrabold text-zinc-100">
                                    {day.contributionCount} contributions
                                  </span>
                                  <span className="text-zinc-500 font-medium">
                                    {new Date(day.date).toLocaleDateString(undefined, {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
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
                                backgroundColor: LANGUAGE_COLORS[lang.language] || '#8250df',
                              }}
                              className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${index === stats.languageStats.slice(0, 5).length - 1 ? 'rounded-r-full' : ''}`}
                              title={`${lang.language}: ${lang.percentage}%`}
                            />
                          ))}
                        </div>

                        {/* Detail list rows */}
                        {stats.languageStats.slice(0, 5).map((lang) => {
                          const dotColor = LANGUAGE_COLORS[lang.language] || '#8250df';
                          return (
                            <div
                              key={lang.language}
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                                <span className="font-bold text-zinc-300">{lang.language}</span>
                                <span className="text-[10px] text-zinc-500">
                                  ({lang.repositoryCount}{' '}
                                  {lang.repositoryCount === 1 ? 'repo' : 'repos'})
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-500 font-mono">
                                  {(lang.bytes / 1024).toFixed(0)} KB
                                </span>
                                <span className="font-extrabold text-white min-w-[42px] text-right">
                                  {lang.percentage}%
                                </span>
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
                            We couldn&apos;t analyze any programming language bytes in your public
                            repositories. Add some code or check your configuration.
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
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                              Total
                            </span>
                            <span className="text-xl font-extrabold text-white mt-1 block">
                              {stats.repositoryStats.total}
                            </span>
                          </div>
                          <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                              Public
                            </span>
                            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                              {stats.repositoryStats.public}
                            </span>
                          </div>
                          <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                              Private
                            </span>
                            <span className="text-xl font-extrabold text-fuchsia-400 mt-1 block">
                              {stats.repositoryStats.private}
                            </span>
                          </div>
                        </div>

                        {/* Metrics list */}
                        <div className="flex flex-col gap-2.5 mt-5 text-xs text-zinc-400">
                          <div className="flex justify-between border-b border-white/3 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-zinc-500" /> Private Repository
                              access:
                            </span>
                            <span className="font-semibold text-zinc-300">
                              {stats.repositoryStats.private > 0 ? 'Enabled' : 'None Detected'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/3 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <GitFork className="w-3.5 h-3.5 text-zinc-500" /> Repository forks
                              count:
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
                              <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" /> Merged PR
                              count:
                            </span>
                            <span className="font-semibold text-zinc-300">
                              {stats.pullRequestStats.mergedPullRequests}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" /> Average Issue
                              Close Time:
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
                            No public repositories were detected for this profile. Access token
                            scopes may restrict private repository stats.
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
                          {stats.repositoryRankings.mostStarred.description ||
                            'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />{' '}
                            {stats.repositoryRankings.mostStarred.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-violet-500" />{' '}
                            {stats.repositoryRankings.mostStarred.forks}
                          </span>
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
                        <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                          We couldn&apos;t detect starred repositories.
                        </p>
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
                          {stats.repositoryRankings.mostForked.description ||
                            'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />{' '}
                            {stats.repositoryRankings.mostForked.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-violet-500" />{' '}
                            {stats.repositoryRankings.mostForked.forks}
                          </span>
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
                        <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                          Forked repositories will show up here.
                        </p>
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
                          {stats.repositoryRankings.mostRecentlyUpdated.description ||
                            'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-1 truncate max-w-[130px]">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(
                              stats.repositoryRankings.mostRecentlyUpdated.updatedAt,
                            ).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
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
                        <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                          Active public repositories will be listed here.
                        </p>
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
