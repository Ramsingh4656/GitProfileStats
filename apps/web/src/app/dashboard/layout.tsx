"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Terminal, 
  LayoutDashboard, 
  Code2, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronDown,
  CreditCard
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Card Preview", href: "/dashboard/cards", icon: CreditCard },
    { name: "Repositories", href: "/dashboard/repositories", icon: Code2 },
    { name: "Activity", href: "/dashboard/activity", icon: Activity },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-center items-center select-none relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none filter blur-[40px]" />
        <div className="flex flex-col items-center gap-4 z-10">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-zinc-400 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-100 flex relative overflow-hidden">
      {/* Background glow spots */}
      <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] absolute top-[-200px] left-[-100px] opacity-40 pointer-events-none filter blur-[40px]" />
      <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] absolute bottom-[-200px] right-[-100px] opacity-40 pointer-events-none filter blur-[40px]" />
      
      {/* Desktop Sidebar (Left side, fixed layout) */}
      <aside className="hidden md:flex md:w-64 border-r border-white/5 bg-[#030014]/60 backdrop-blur-xl flex-col shrink-0 z-20">
        {/* Brand/Logo */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            GitProfile<span className="text-violet-500 font-semibold">Stats</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/5 text-white shadow-inner border border-white/5"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-violet-400" : "text-zinc-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-white/5 bg-[#05021a]/30 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <Image 
                  src={user.avatarUrl} 
                  alt={`${user.username}'s GitHub avatar`} 
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || "US"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-sm text-white truncate">@{user?.username}</h5>
              <p className="text-zinc-500 text-xs truncate">{user?.email || "GitHub User"}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 text-sm font-medium transition-all duration-200 group text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 text-zinc-500 group-hover:text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative flex w-full max-w-xs flex-col bg-[#030014] border-r border-white/10 h-full p-6 text-zinc-100 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  GitProfile<span className="text-violet-500">Stats</span>
                </span>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Close sidebar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 py-6 flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/5 text-white border border-white/5"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-violet-400" : "text-zinc-400"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Sidebar Footer info */}
            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt={`${user.username}'s GitHub avatar`} 
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-white">
                      {user?.username?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-sm text-white truncate">@{user?.username}</h5>
                  <p className="text-zinc-500 text-xs truncate">{user?.email || "GitHub User"}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 text-sm font-medium transition-all group text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-white/5 bg-[#030014]/70 backdrop-blur-md flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Toggle Button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Page title based on route */}
            <h2 className="text-lg font-bold text-white tracking-tight">
              {pathname === "/dashboard"
                ? "Dashboard Overview"
                : pathname === "/dashboard/cards"
                ? "Card Preview & Customizer"
                : pathname === "/dashboard/repositories"
                ? "GitHub Repositories"
                : pathname === "/dashboard/activity"
                ? "Recent Activity"
                : pathname === "/dashboard/settings"
                ? "User Settings"
                : "GitProfileStats"}
            </h2>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-4">
            {/* Mock Search Bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 focus-within:border-violet-500/50 transition-all">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none text-xs text-white focus:outline-none w-40 md:w-48 placeholder-zinc-500"
                aria-label="Search resources"
              />
            </div>

            {/* Notification Widget */}
            <button 
              className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05] relative transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
            </button>

            {/* Quick Profile Dropdown Menu */}
            <button className="flex items-center gap-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] px-3 py-1.5 rounded-xl text-zinc-300 hover:text-white cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <Image 
                    src={user.avatarUrl} 
                    alt={`${user.username}'s GitHub avatar`} 
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-white">
                    U
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold">@{user?.username}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
