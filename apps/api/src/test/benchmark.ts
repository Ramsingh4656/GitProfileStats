import 'reflect-metadata';
import { Performance } from 'perf_hooks';

// Prevent actual network fetches during benchmark
process.env.NODE_ENV = 'test';
globalThis.fetch = async (url: any, options?: any) => {
  const urlString = String(url);
  if (urlString.includes('avatar') || urlString.includes('png') || urlString.includes('jpeg')) {
    return {
      ok: true,
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as Response;
  }
  return {
    ok: true,
    json: async () => ({
      login: 'demo',
      name: 'Demo User',
      avatar_url: 'https://example.com/avatar.png',
      public_repos: 42,
      followers: 1337,
      following: 50,
      created_at: '2026-01-01T00:00:00Z',
    }),
  } as Response;
};

import { container } from '../config/container.js';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository.js';
import { User } from '../domain/entities/User.js';
import {
  renderProfileCard,
  renderStatsCard,
  renderLanguagesCard,
  renderStreakCard,
  renderRepositoryCard,
} from '../cards/index.js';
import { app } from '../app.js';
import http from 'http';

// Setup timing helper
function measure(fn: () => void | Promise<void>): Promise<number> | number {
  const start = performance.now();
  const res = fn();
  if (res instanceof Promise) {
    return res.then(() => performance.now() - start);
  }
  return performance.now() - start;
}

// 1. DB QUERY BENCHMARK
async function benchmarkDatabase() {
  console.log('\n--- 1. Database Query Benchmark ---');
  const repo = container.resolve(InMemoryUserRepository) as InMemoryUserRepository;

  // Seed repository with 10,000 users
  console.log('Seeding 10,000 users...');
  const users: User[] = [];
  for (let i = 0; i < 10000; i++) {
    const user = User.create({
      id: `id-${i}`,
      githubId: `github-${i}`,
      username: `user-${i}`,
      email: `user-${i}@example.com`,
      avatarUrl: 'https://example.com/avatar.png',
      tier: 'FREE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.push(user);
    await repo.save(user);
  }

  // Define the old O(N) lookup inline for comparison
  const oldLookup = (username: string): User | null => {
    // Access internal users map via reflection or casting if private
    const map = (repo as any).users as Map<string, User>;
    for (const u of map.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return u;
      }
    }
    return null;
  };

  // Run O(N) lookup benchmark
  const targetUsername = 'user-9999'; // Worst case
  console.log(`Running O(N) lookups for '${targetUsername}'...`);
  const oldDuration = await measure(() => {
    for (let i = 0; i < 1000; i++) {
      oldLookup(targetUsername);
    }
  });
  console.log(
    `O(N) search (1,000 queries): ${oldDuration.toFixed(2)} ms (${(oldDuration / 1000).toFixed(4)} ms/op)`,
  );

  // Run O(1) optimized lookup benchmark
  console.log(`Running optimized O(1) lookups for '${targetUsername}'...`);
  const newDuration = await measure(async () => {
    for (let i = 0; i < 1000; i++) {
      await repo.findByUsername(targetUsername);
    }
  });
  console.log(
    `O(1) search (1,000 queries): ${newDuration.toFixed(2)} ms (${(newDuration / 1000).toFixed(4)} ms/op)`,
  );
  console.log(`Speedup factor: ${(oldDuration / newDuration).toFixed(1)}x`);

  // Clean up
  for (const user of users) {
    await repo.delete(user.id);
  }
}

// 2. SVG GENERATION SPEED BENCHMARK
async function benchmarkSVGGeneration() {
  console.log('\n--- 2. SVG Generation Benchmark ---');
  const cardOptions = {
    theme: 'dark',
    accent: '#ff0000',
    background: '#000000',
    borderRadius: 8,
    hideBorder: false,
    fontFamily: 'Segoe UI',
  };

  // Mock inputs
  const mockUser = {
    login: 'demo',
    name: 'Demo User',
    avatar_url: 'https://avatars.githubusercontent.com/u/1234?v=4',
    bio: 'Performance tester',
    public_repos: 42,
    followers: 1337,
    following: 50,
    created_at: '2026-01-01T00:00:00Z',
  } as any;

  const mockStats = {
    username: 'demo',
    name: 'Demo User',
    totalStars: 142,
    totalCommits: 2854,
    totalRepositories: 42,
    pullRequests: 89,
    issues: 24,
    followers: 1337,
  };

  const mockLanguages = [
    { language: 'TypeScript', bytes: 145000, percentage: 55.4, repositoryCount: 12 },
    { language: 'JavaScript', bytes: 68000, percentage: 26.0, repositoryCount: 8 },
    { language: 'HTML', bytes: 24000, percentage: 9.2, repositoryCount: 6 },
    { language: 'CSS', bytes: 16000, percentage: 6.1, repositoryCount: 4 },
  ];

  const mockStreak = {
    username: 'demo',
    totalContributions: 1842,
    currentStreak: 15,
    longestStreak: 42,
    contributionCalendar: { totalContributions: 1842, weeks: [] },
  };

  const mockRepo = {
    name: 'GitProfileStats',
    owner: { login: 'demo' },
    description: 'A beautiful dashboard and profile card generator for your GitHub stats.',
    language: 'TypeScript',
    stargazers_count: 142,
    forks_count: 28,
    license: { name: 'MIT License', spdx_id: 'MIT' },
    updated_at: '2026-08-01T00:00:00Z',
  } as any;

  const runs = 1000;

  // Profile Card
  const profileTime = await measure(async () => {
    for (let i = 0; i < runs; i++) {
      // Stub fetchBase64Image in process for speed
      await renderProfileCard(mockUser, cardOptions);
    }
  });
  console.log(
    `Profile Card: ${(profileTime / runs).toFixed(3)} ms/gen (${Math.round(runs / (profileTime / 1000))} gen/sec)`,
  );

  // Stats Card
  const statsTime = await measure(() => {
    for (let i = 0; i < runs; i++) {
      renderStatsCard(mockStats, cardOptions);
    }
  });
  console.log(
    `Stats Card: ${(statsTime / runs).toFixed(3)} ms/gen (${Math.round(runs / (statsTime / 1000))} gen/sec)`,
  );

  // Languages Card
  const langsTime = await measure(() => {
    for (let i = 0; i < runs; i++) {
      renderLanguagesCard(mockLanguages, cardOptions);
    }
  });
  console.log(
    `Languages Card: ${(langsTime / runs).toFixed(3)} ms/gen (${Math.round(runs / (langsTime / 1000))} gen/sec)`,
  );

  // Streak Card
  const streakTime = await measure(() => {
    for (let i = 0; i < runs; i++) {
      renderStreakCard(mockStreak, cardOptions);
    }
  });
  console.log(
    `Streak Card: ${(streakTime / runs).toFixed(3)} ms/gen (${Math.round(runs / (streakTime / 1000))} gen/sec)`,
  );

  // Repository Card
  const repoTime = await measure(() => {
    for (let i = 0; i < runs; i++) {
      renderRepositoryCard(mockRepo, cardOptions);
    }
  });
  console.log(
    `Repository Card: ${(repoTime / runs).toFixed(3)} ms/gen (${Math.round(runs / (repoTime / 1000))} gen/sec)`,
  );
}

// 3. API RESPONSE TIME BENCHMARK (Express integration)
async function benchmarkAPIResponse() {
  console.log('\n--- 3. API Response Time Benchmark ---');

  // Start server on an ephemeral port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  const fetchEndpoint = async (path: string): Promise<number> => {
    const start = performance.now();
    await new Promise<void>((resolve, reject) => {
      http
        .get(`${baseUrl}${path}`, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve());
        })
        .on('error', reject);
    });
    return performance.now() - start;
  };

  const endpoints = [
    { name: 'Health Check (/health)', path: '/health' },
    {
      name: 'Profile SVG (/api/cards/profile.svg?username=demo)',
      path: '/api/cards/profile.svg?username=demo',
    },
    {
      name: 'Stats SVG (/api/cards/stats.svg?username=demo)',
      path: '/api/cards/stats.svg?username=demo',
    },
  ];

  for (const ep of endpoints) {
    // Warmup
    await fetchEndpoint(ep.path);
    await fetchEndpoint(ep.path);

    const latencies: number[] = [];
    for (let i = 0; i < 50; i++) {
      latencies.push(await fetchEndpoint(ep.path));
    }

    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((s, x) => s + x, 0) / latencies.length;
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p90 = latencies[Math.floor(latencies.length * 0.9)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];

    console.log(`${ep.name}:`);
    console.log(`  Avg: ${avg.toFixed(2)} ms`);
    console.log(`  p50: ${p50.toFixed(2)} ms`);
    console.log(`  p90: ${p90.toFixed(2)} ms`);
    console.log(`  p99: ${p99.toFixed(2)} ms`);
  }

  server.close();
}

async function runAll() {
  console.log('=== Running GitProfileStats Performance Benchmarks ===');
  await benchmarkDatabase();
  await benchmarkSVGGeneration();
  await benchmarkAPIResponse();
  console.log('\n=== Benchmarks Completed ===');
}

runAll().catch(console.error);
