# GitProfileStats API Documentation

This document describes the API endpoints, parameters, customization options, themes, error responses, and data models of the **GitProfileStats** platform.

- **Base URL (Local/Development)**: `http://localhost:4000`
- **Global Prefix for Core APIs**: `/api/v1`
- **Global Prefix for Card & GitHub APIs**: `/api`

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Themes & Card Customizations](#2-themes--card-customizations)
3. [Card SVG Endpoints](#3-card-svg-endpoints)
4. [GitHub Data Endpoints](#4-github-data-endpoints)
5. [User & Settings Endpoints](#5-user--settings-endpoints)
6. [System Endpoints](#6-system-endpoints)
7. [Error Responses & Codes](#7-error-responses--codes)

---

## 1. Authentication & Authorization

### GitHub OAuth Authentication
For production deployment, users log in using GitHub OAuth.
- **Start OAuth Flow**: `GET /api/v1/auth/github` redirects users to GitHub's authorization page.
- **OAuth Callback**: `GET /api/v1/auth/github/callback` exchanges the temporary code for an access token, saves or updates the user profile, and redirects to the frontend dashboard.

### Request Authorization (Simulated Development Mode)
Protected endpoints require a session token passed in the `Authorization` header.
- **Header Format**: `Authorization: Bearer <user_id>`
- *Note*: In development, the token value is directly treated as the `user_id`. An invalid token format or missing header returns `401 Unauthorized`.

---

## 2. Themes & Card Customizations

All SVG card rendering endpoints support standard query parameters to customize the visual appearance.

### Predefined Themes
The backend includes the following built-in themes:

| Theme Name | Background | Primary Text | Secondary Text | Border Color | Accent Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dark` *(Default)* | `#0d1117` | `#c9d1d9` | `#8b949e` | `#30363d` | `#58a6ff` |
| `light` | `#ffffff` | `#24292f` | `#57606a` | `#d0d7de` | `#0969da` |
| `github` | `#0d1117` | `#c9d1d9` | `#8b949e` | `#30363d` | `#2ea44f` |
| `dracula` | `#282a36` | `#f8f8f2` | `#6272a4` | `#44475a` | `#50fa7b` |
| `nord` | `#2e3440` | `#d8dee9` | `#4c566a` | `#3b4252` | `#88c0d0` |

### Customization Parameters
You can override a theme's defaults using the following query parameters:

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `theme` | `string` | Applies a predefined theme layout. | `theme=dracula` |
| `accent` | `string` | Hex color code overriding the accent color (hash `#` is optional). | `accent=ff79c6` |
| `background` | `string` | Hex color code overriding the background color (hash `#` is optional). | `background=1a1a1a` |
| `border_radius` | `number` | The card border corner radius in pixels. | `border_radius=8` |
| `hide_border` | `boolean` | If `true`, hides the outer card border stroke. | `hide_border=true` |
| `font_family` | `string` | Overrides the font stack with a custom font. | `font_family=Fira+Code` |
| `font_style` | `string` | Shortcut to use preset font styles (`sans`, `serif`, `mono`, `rounded`). | `font_style=mono` |
| `mock` | `boolean` | If `true`, forces the card to render using offline mock data (useful for templates). | `mock=true` |

---

## 3. Card SVG Endpoints

All endpoints below return raw SVG code with the `Content-Type: image/svg+xml` header and a cache duration of 1 hour (`Cache-Control: public, max-age=3600`).

### Profile Card
Generates a summary card of the user's GitHub profile.
- **Endpoint**: `GET /api/cards/profile.svg`
- **Authentication**: Optional. If `token` or `x-github-token` is provided, fetches the token owner's stats; otherwise, queries the specified `username`.
- **Query Parameters**:
  - `username` (string, optional): Target GitHub username.
  - `token` (string, optional): Personal GitHub token.
  - *Plus all [Customization Parameters](#customization-parameters).*
- **Example Request**:
  `GET http://localhost:4000/api/cards/profile.svg?username=octocat&theme=nord&font_style=rounded`

### Stats Card
Generates a card listing aggregated repository metrics.
- **Endpoint**: `GET /api/cards/stats.svg`
- **Authentication**: Optional.
- **Query Parameters**:
  - `username` (string, optional): Target GitHub username.
  - `token` (string, optional): Personal GitHub token.
  - *Plus all [Customization Parameters](#customization-parameters).*
- **Example Request**:
  `GET http://localhost:4000/api/cards/stats.svg?username=octocat&theme=dracula`

### Languages Card
Displays the breakdown of top programming languages used by the user.
- **Endpoint**: `GET /api/cards/languages.svg`
- **Authentication**: Optional.
- **Query Parameters**:
  - `username` (string, optional): Target GitHub username.
  - `token` (string, optional): Personal GitHub token.
  - `langs_count` (number, optional): Number of languages to display in the card list (default is 5).
  - *Plus all [Customization Parameters](#customization-parameters).*
- **Example Request**:
  `GET http://localhost:4000/api/cards/languages.svg?username=octocat&theme=github&langs_count=6`

### Streak Card
Renders commit statistics and contribution streaks.
- **Endpoint**: `GET /api/cards/streak.svg`
- **Authentication**: Optional.
- **Query Parameters**:
  - `username` (string, optional): Target GitHub username.
  - `token` (string, optional): Personal GitHub token.
  - *Plus all [Customization Parameters](#customization-parameters).*
- **Example Request**:
  `GET http://localhost:4000/api/cards/streak.svg?username=octocat&theme=light`

### Repository Card
Displays analytics for a specific repository.
- **Endpoint**: `GET /api/cards/repository.svg`
- **Authentication**: Optional.
- **Query Parameters**:
  - `owner` or `username` (string, required): Owner of the repository.
  - `repo` (string, required): Repository name.
  - `token` (string, optional): Personal GitHub token.
  - *Plus all [Customization Parameters](#customization-parameters).*
- **Example Request**:
  `GET http://localhost:4000/api/cards/repository.svg?owner=octocat&repo=Hello-World&theme=dark`

---

## 4. GitHub Data Endpoints

These routes fetch and return raw JSON data aggregates from the GitHub API. 
- **Required Inputs**: All endpoints below require **either** `username` in the query parameters **or** a GitHub token supplied via the `token` query parameter or `x-github-token` request header.

### User Stats
- **Endpoint**: `GET /api/stats`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "octocat",
      "name": "The Octocat",
      "followers": 1337,
      "following": 50,
      "publicRepositories": 42,
      "privateRepositories": 5,
      "totalStars": 142,
      "totalForks": 28
    }
  }
  ```

### Repository Stats & Rankings
- **Endpoint**: `GET /api/repositories`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "total": 42,
        "public": 37,
        "private": 5,
        "forks": 10,
        "original": 32,
        "archived": 2,
        "disabled": 0,
        "totalStars": 142,
        "totalForks": 28,
        "totalWatchers": 142,
        "openIssuesCount": 24
      },
      "rankings": {
        "mostStarred": {
          "id": 1296269,
          "name": "Hello-World",
          "fullName": "octocat/Hello-World",
          "htmlUrl": "https://github.com/octocat/Hello-World",
          "description": "My first repository on GitHub!",
          "stars": 100,
          "forks": 15,
          "size": 124,
          "createdAt": "2011-01-26T19:01:12Z",
          "updatedAt": "2026-08-01T08:00:00Z"
        },
        "mostForked": { /* RankedRepository schema */ },
        "largest": { /* RankedRepository schema */ },
        "smallest": { /* RankedRepository schema */ },
        "newest": { /* RankedRepository schema */ },
        "oldest": { /* RankedRepository schema */ },
        "mostRecentlyUpdated": { /* RankedRepository schema */ }
      }
    }
  }
  ```

### Languages Breakdown
- **Endpoint**: `GET /api/languages`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "language": "TypeScript",
        "bytes": 145000,
        "percentage": 55.4,
        "repositoryCount": 12
      },
      {
        "language": "JavaScript",
        "bytes": 68000,
        "percentage": 26.0,
        "repositoryCount": 8
      }
    ]
  }
  ```

### Contribution Stats
- **Endpoint**: `GET /api/contributions`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "octocat",
      "totalContributions": 1842,
      "currentStreak": 15,
      "longestStreak": 42,
      "contributionCalendar": {
        "totalContributions": 1842,
        "weeks": [
          {
            "contributionDays": [
              {
                "color": "#ebedf0",
                "contributionCount": 0,
                "date": "2026-07-26",
                "weekday": 0
              },
              {
                "color": "#216e39",
                "contributionCount": 5,
                "date": "2026-07-27",
                "weekday": 1
              }
            ]
          }
        ]
      }
    }
  }
  ```

### Commit Stats
- **Endpoint**: `GET /api/commits`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "octocat",
      "totalCommits": 2854,
      "commitsThisYear": 850,
      "commitsThisMonth": 74,
      "commitsThisWeek": 12
    }
  }
  ```

### Pull Request Stats
- **Endpoint**: `GET /api/pull-requests`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "octocat",
      "totalPullRequests": 89,
      "openPullRequests": 3,
      "closedPullRequests": 12,
      "mergedPullRequests": 74
    }
  }
  ```

### Issue Stats
- **Endpoint**: `GET /api/issues`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "username": "octocat",
      "totalIssuesOpened": 24,
      "totalIssuesClosed": 20,
      "averageCloseTimeMs": 691200000,
      "averageCloseTimeDays": 8.0,
      "averageCloseTimeHours": 192.0,
      "averageCloseTimeFormatted": "8d 0h"
    }
  }
  ```

### Combined Statistics
Aggregates all GitHub metrics from the modules above into a single API response payload.
- **Endpoint**: `GET /api/statistics`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "repositoryStats": { ... },
      "repositoryRankings": { ... },
      "languageStats": [ ... ],
      "commitStats": { ... },
      "contributionStats": { ... },
      "pullRequestStats": { ... },
      "issueStats": { ... }
    }
  }
  ```

---

## 5. User & Settings Endpoints

These routes access internal system user accounts. An authorization token is required.

### Get Current User Profile
- **Endpoint**: `GET /api/v1/users/me`
- **Headers**:
  - `Authorization: Bearer <user_id>` (Required)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "5832347",
      "githubId": "5832347",
      "username": "octocat",
      "email": "octocat@github.com",
      "avatarUrl": "https://avatars.githubusercontent.com/u/5832347?v=4",
      "tier": "FREE",
      "createdAt": "2026-08-01T04:02:58.000Z",
      "updatedAt": "2026-08-01T04:02:58.000Z",
      "settings": {
        "preferredTheme": "dark",
        "defaultCardStyle": "classic",
        "languageSorting": "size",
        "defaultCardVisibility": {
          "profile": true,
          "stats": true,
          "languages": true,
          "streak": true
        }
      }
    }
  }
  ```

### Update User Settings
Modifies settings configurations for the user's dashboard preferences and default card visibility.
- **Endpoint**: `PUT /api/v1/users/settings`
- **Headers**:
  - `Authorization: Bearer <user_id>` (Required)
- **Request Body (JSON - Partial Object)**:
  ```json
  {
    "preferredTheme": "nord",
    "defaultCardVisibility": {
      "streak": false
    }
  }
  ```
- **Success Response (200 OK)**:
  Returns the updated user profile containing the merged settings payload.

---

## 6. System Endpoints

### Health Check
Validates server runtime status, uptime, and server clock synchronicity.
- **Endpoint**: `GET /health`
- **Success Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "uptime": 23.456,
    "timestamp": "2026-08-01T04:04:10.000Z"
  }
  ```

---

## 7. Error Responses & Codes

All unsuccessful actions return a structured error JSON object mapping technical failures into specific categories.

### Error Schema
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable summary of the failure",
    "details": [] // Optional field providing fine-grained errors
  }
}
```

### Main Error Categories & Codes

#### 1. Validation Failures (400 Bad Request)
Returned when inputs fail data parsing or constraints schema checks.
- **Code**: `VALIDATION_FAILED`
- **Example Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Request validation failed",
      "details": [
        {
          "path": "username",
          "message": "Username cannot be empty"
        }
      ]
    }
  }
  ```

#### 2. Authentication Failures (401 Unauthorized)
Returned when authorization header checks fail or are bypassed.
- **Code**: `AUTHENTICATION_FAILED`
- **Example Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "AUTHENTICATION_FAILED",
      "message": "Missing authorization header"
    }
  }
  ```

#### 3. User Not Found (404 Not Found)
Returned when the requested database record could not be located.
- **Code**: `USER_NOT_FOUND`
- **Example Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "USER_NOT_FOUND",
      "message": "User with identifier '12345' not found"
    }
  }
  ```

#### 4. Invalid Card Settings (400 Bad Request)
Returned when invalid custom card configuration properties are specified.
- **Code**: `INVALID_CARD_CONFIG`

#### 5. GitHub API Outage/Limits (502 Bad Gateway)
Returned if third-party upstream endpoints fail or respond with errors.
- **Code**: `GITHUB_API_ERROR`

#### 6. Server Faults (500 Internal Server Error)
Returned when unhandled exceptions occur in the API service.
- **Code**: `INTERNAL_SERVER_ERROR`
- **Example Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred"
    }
  }
  ```
