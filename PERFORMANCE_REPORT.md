# PERFORMANCE REPORT

This document contains a comprehensive performance audit and optimization analysis of the **GitProfileStats** platform.

---

## 1. Executive Summary

A performance audit was conducted across the backend Express API and the frontend Next.js Web dashboard. Performance bottlenecks in database lookups and cache lifetime management were resolved, yielding dramatic performance gains.

Key achievements:
- **Database Search**: Improved user lookup speed by **867.2x** (from 1.43 ms/op to 0.0016 ms/op).
- **SVG Generation**: Confirmed high-throughput rendering capability (> 1,500 generations/second).
- **API Cache Leak**: Prevented memory leaks by introducing automatic TTL sweep intervals and size limits.
- **Client Bundle Size**: Optimized Next.js page sizes with landing page core at **48.4 kB**.

---

## 2. Benchmark Results

All benchmarks were executed on a local execution context using a native Node.js performance testing harness.

### A. Database Queries (InMemoryUserRepository)
*Dataset size: 10,000 registered users. Target lookup: worst-case user query.*

| Search Mode | Total Time (1,000 operations) | Average Latency / Query | Speedup Factor |
| :--- | :--- | :--- | :--- |
| **O(N) Search (Original)** | 1429.38 ms | 1.4294 ms | 1.0x (Baseline) |
| **O(1) Indexed (Optimized)** | 1.65 ms | **0.0016 ms** | **867.2x** |

**Optimization Details**: 
Added a secondary index `Map<string, string>` mapping `username.toLowerCase() -> userId`. Updated the `save` and `delete` handlers to maintain the index dynamically. This completely removes the necessity of linear array traversal on username search, making lookups immediate.

---

### B. SVG Card Generation Speed
*Throughput audit of SVG engine rendering, generating 1,000 SVGs per card type.*

| Card Generator | Rendering Time / SVG | Throughput (Generations / Sec) |
| :--- | :--- | :--- |
| **Streak Card** | 0.356 ms | 2,807 gen/sec |
| **Stats Card** | 0.526 ms | 1,900 gen/sec |
| **Languages Card** | 0.574 ms | 1,743 gen/sec |
| **Profile Card** | 0.799 ms | 1,252 gen/sec |
| **Repository Card** | 0.893 ms | 1,120 gen/sec |

**Analysis**:
The layout and rendering engines are highly optimized. Because DOM dependency is eliminated in favor of a coordinate-based tree estimation, rendering takes **< 1 ms** across all card types, allowing a single thread to support massive scaling.

---

### C. API Response Times (with Caching)
*Latency distribution of API endpoints under a load of 50 concurrent requests (with active response cache).*

| Endpoint | Average Latency | p50 (Median) | p90 (90th Percentile) | p99 (99th Percentile) |
| :--- | :--- | :--- | :--- | :--- |
| **`/health`** | 2.68 ms | 2.24 ms | 4.53 ms | 6.83 ms |
| **`/api/cards/profile.svg?username=demo`** | 2.10 ms | 1.87 ms | 2.98 ms | 5.98 ms |
| **`/api/cards/stats.svg?username=demo`** | 2.40 ms | 2.15 ms | 3.75 ms | 5.88 ms |

**Analysis**:
The low latencies (averaging **~2.4 ms**) demonstrate the impact of the cache middleware. Once the first request populates the cache, subsequent requests bypass compilation/generation, serving directly from memory.

---

## 3. Cache Efficiency & Memory Safety

An audit of the memory footprint of the caching layer identified that the `apiCache` inside `GitHubService` lacked size limits and active cleanup, posing a memory exhaustion risk under prolonged production usage.

### Implemented Enhancements:
1. **Cache TTL Sweep**: Added a background `setInterval` interval in `GitHubService` running every 60 seconds to actively prune expired API responses.
2. **Eviction Policy**: Added a strict cache size ceiling (`maxCacheSize = 1000`). If the cache size exceeds this limit, the oldest entry is evicted using a FIFO queue strategy.
3. **HTTP Response Cache Safety**: Verified that the `cacheMiddleware` correctly uses a similar FIFO eviction size cap of `1000` entries, and handles automatic unref of the clean-up timer to prevent process hang.

---

## 4. Web Client Bundle Size Analysis

The Next.js client bundle sizes were analyzed using Webpack and production-build analysis (`next build --webpack`).

### Global JS Chunks (Shared across all pages)
- **Framework Core (`framework-*.js`)**: **189.68 kB** (contains React, React-DOM, and Next.js framework fundamentals)
- **Client Main Runtime (`main-*.js`)**: **131.95 kB**
- **Webpack Runtime (`webpack-*.js`)**: **3.41 kB**
- **Polyfills (`polyfills-*.js`)**: **112.59 kB**
- **Shared Chunks (`514-*.js`, `bf64850d-*.js`)**: **222.35 kB** and **199.86 kB**

### Page Bundle Sizes (Client-side JS)

| Route Path | Bundle Size (gzip) | Type |
| :--- | :--- | :--- |
| **`/` (Landing Page)** | **48.40 kB** | Static |
| **`/dashboard`** | **36.62 kB** | Static |
| **`/dashboard/layout`** | **14.35 kB** | Static |
| **`/login`** | **9.11 kB** | Static |
| **`/_not-found`** | **0.23 kB** | Static |

**Recommendation**:
The bundle sizes are within optimal parameters. Lucide icons and Next.js components are properly treeshaken. 

---

## 5. GitHub API Request Coalescing

GitHub's REST and GraphQL APIs impose strict rate limits. We audited how the application handles concurrent data requests.

- **Request Coalescing**: Verified that `GitHubService` uses a promise registry (`inFlightRequests`). If multiple components request the exact same resource in the same tick (e.g., when generating a dashboard of combined stats), the service merges these into a single in-flight Promise.
- **GitHub Rate Limit Conservation**: Only a single outbound HTTP request is made to GitHub's servers for identical queries, saving rates and reducing network I/O blockages.
