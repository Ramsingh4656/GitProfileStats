"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { env } from "@/config/env";
import { CombinedStats, UserProfile } from "../types";

export function useDashboardStats() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<CombinedStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [hasGithubToken, setHasGithubToken] = useState(false);

  const loadStats = useCallback(async (username: string) => {
    setLoadingStats(true);
    setStatsError(null);

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/statistics?username=${username}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errText =
          errJson.error?.message ||
          (typeof errJson.error === "string" ? errJson.error : null) ||
          errJson.message;
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
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
          setHasGithubToken(Boolean(data.data.hasGithubToken));
          loadStats(data.data.username);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, loadStats]);

  return {
    user,
    setUser,
    loading,
    loadingStats,
    setLoadingStats,
    stats,
    setStats,
    statsError,
    setStatsError,
    hasGithubToken,
    setHasGithubToken,
    loadStats,
  };
}
export type UseDashboardStatsReturn = ReturnType<typeof useDashboardStats>;
