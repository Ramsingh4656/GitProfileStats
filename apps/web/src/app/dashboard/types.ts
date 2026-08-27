export interface RankedRepository {
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

export interface RepositoryStats {
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

export interface RepositoryRankings {
  mostStarred: RankedRepository | null;
  mostForked: RankedRepository | null;
  largest: RankedRepository | null;
  smallest: RankedRepository | null;
  newest: RankedRepository | null;
  oldest: RankedRepository | null;
  mostRecentlyUpdated: RankedRepository | null;
}

export interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  repositoryCount: number;
}

export interface CommitStats {
  username: string;
  totalCommits: number;
  commitsThisYear: number;
  commitsThisMonth: number;
  commitsThisWeek: number;
}

export interface ContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionStats {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
}

export interface CombinedStats {
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

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string;
  hasGithubToken?: boolean;
}

export const LANGUAGE_COLORS: Record<string, string> = {
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
