# GitProfileStats - Manual Testing Checklist

This checklist contains comprehensive manual test cases to verify the functionality, responsiveness, visual aesthetics, and edge cases of the **GitProfileStats** web application. 

Use this checklist during release verification to ensure there are no regressions across desktop and mobile form factors.

---

## Table of Contents
1. [Login Flow](#1-login-flow)
2. [Logout Flow](#2-logout-flow)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Stats Overview & Metrics](#4-stats-overview--metrics)
5. [Profile Card Customization](#5-profile-card-customization)
6. [Streak Card Customization](#6-streak-card-customization)
7. [Language Card Customization](#7-language-card-customization)
8. [Repository Card Customization](#8-repository-card-customization)
9. [Markdown README Generator](#9-markdown-readme-generator)
10. [Theme Gallery & Switcher](#10-theme-gallery--switcher)
11. [Mobile Sizing & Interactions](#11-mobile-sizing--interactions)
12. [Desktop Layout & Aesthetics](#12-desktop-layout--aesthetics)

---

## 1. Login Flow

Verify how the client handles redirects, GitHub OAuth authentication, token extraction, and successful or failed session state transitions.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **L-01** | Redirect Anonymous Users | User is not logged in (`auth_token` missing from LocalStorage). | 1. Navigate to `/dashboard` directly.<br>2. Try navigating to `/dashboard/cards` or `/dashboard/themes`. | User is immediately redirected back to `/login`. URL shows `/login`. | `[ ]` |
| **L-02** | Login Interface Visuals | User navigates to `/login`. | 1. Observe background glow spots and glassmorphism styling.<br>2. Hover over "Back to home" link and "Continue with GitHub" button. | Glowing styling loads smoothly. "Back to home" shows left-arrow hover animation. "Continue with GitHub" button scales or shows hover state. | `[ ]` |
| **L-03** | Initiate GitHub OAuth | User navigates to `/login`. | 1. Click on the "Continue with GitHub" button. | Browser initiates redirect to `<API_URL>/api/v1/auth/github` backend endpoint. | `[ ]` |
| **L-04** | Auth Callback Handler (Success) | User completes GitHub OAuth authorization. | 1. App redirects back to `/login/callback?token=VALID_JWT_TOKEN`.<br>2. Observe loading animation and success redirect. | - Loading spinner displays with "Verifying session..." text.<br>- Success screen displays a green checkmark stating "Login Successful".<br>- Token is stored as `auth_token` in `localStorage`.<br>- App redirects to `/dashboard` within 1.5 seconds. | `[ ]` |
| **L-05** | Auth Callback Handler (Error) | User enters callback URL with error parameter. | 1. Navigate to `/login/callback?error=Authentication%20failed%20on%20GitHub`. | - Error message box displays: "Authentication failed on GitHub".<br>- "Back to Login" button is visible and active.<br>- User is NOT redirected to `/dashboard`. | `[ ]` |
| **L-06** | Auth Callback Handler (Missing Token) | User enters callback URL without parameters. | 1. Navigate to `/login/callback` directly. | - Failure box displays: "No authentication token received."<br>- "Back to Login" button takes user back to `/login`. | `[ ]` |

---

## 2. Logout Flow

Verify the security flow of clearing user credentials and redirecting to public landing areas.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **LO-01** | Desktop Sidebar Log Out | User is logged in and on a dashboard page. | 1. Navigate to the bottom-left sidebar footer section.<br>2. Hover over the "Log Out" button.<br>3. Click the "Log Out" button. | - Hover turns text and icon rose-colored.<br>- `auth_token` is removed from `localStorage`.<br>- User is redirected to `/` (Landing Page). | `[ ]` |
| **LO-02** | Mobile Drawer Log Out | User is logged in on a mobile screen size. | 1. Open the mobile menu drawer.<br>2. Scroll to the footer section inside the drawer.<br>3. Tap the "Log Out" button. | - `auth_token` is removed from `localStorage`.<br>- Menu drawer closes.<br>- Redirects user to `/` (Landing Page). | `[ ]` |
| **LO-03** | Verify Post-Logout Access | User has clicked Log Out. | 1. Try clicking the "Back" button on the browser navigation bar. | User remains redirected or is immediately bounced back to `/login`. Cannot access dashboard page. | `[ ]` |

---

## 3. Dashboard Overview

Verify that the dashboard loads all statistics, widgets, and user settings panel elements correctly.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DB-01** | Page Loader & Session Verifier | User has a valid token and loads `/dashboard`. | 1. Click refresh on `/dashboard`. | - A spinner with "Verifying session..." message displays briefly.<br>- Screen does not blink empty or look unstyled. | `[ ]` |
| **DB-02** | User Profile Information Card | User stats are loaded. | 1. Inspect the profile card on the left panel.<br>2. Check avatar, bio, location, company, and website links. | - High-fidelity cover banner gradient displays.<br>- Avatar has border styling.<br>- Clickable website link opens a new tab pointing to the user's GitHub profile. | `[ ]` |
| **DB-03** | Status Badges Display | User stats are loaded. | 1. Check the developer status tags below the profile card. | "Early Adopter" and "Premium" badges display with distinct violet/emerald icons. | `[ ]` |
| **DB-04** | Sync / Refresh Data Action | User stats are loaded. | 1. Click "Refresh Stats Data". | - Spin animation starts on the refresh icon.<br>- Button displays "Fetching stats...".<br>- Data updates without reloading the entire page. | `[ ]` |
| **DB-05** | Demo/Mock Mode Toggle | User is logged in. | 1. Toggle "Demo/Mock Data Mode" in the Dashboard Settings panel.<br>2. Observe floating banner notices. | - Toggle switches color seamlessly (violet when active, zinc when inactive).<br>- Floating banner notice displays: "Demo Mode Active".<br>- Skeletons appear briefly, then mock data is populated. | `[ ]` |
| **DB-06** | PAT Setup (Set Token) | No PAT is currently set. | 1. Click "Set PAT" on the Token setup panel.<br>2. Enter a token (e.g. `ghp_mocktoken`) and click "Save & Apply". | - Demo mode is automatically disabled.<br>- Dashboard triggers load state using token header `x-github-token`. | `[ ]` |
| **DB-07** | PAT Setup (Cancel / Clear) | PAT is configured. | 1. Click "Edit" and then "Cancel".<br>2. Click "Clear Local Token". | - Input closes without modifying token.<br>- Clicking clear deletes `github_pat` from LocalStorage and triggers stats reload. | `[ ]` |
| **DB-08** | API Failure Alerts Display | Stats fetch fails (e.g. invalid credentials or rate limits). | 1. Set invalid PAT and reload with demo mode disabled. | - Red alert banner displays: "GitHub Connection Incomplete".<br>- Shows details of the error message.<br>- Offers buttons for "Load Beautiful Demo Data" and "Configure GitHub PAT". | `[ ]` |

---

## 4. Stats Overview & Metrics

Verify that the dashboard properly fetches, maps, and displays developer analytics components.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST-01** | Shimmer Loading Skeleton | Stats loading is slow or mocked with delay. | 1. Force reload or toggle Demo Mode on/off. | - Shiny shimmer placeholders move left-to-right on cards.<br>- Placeholder blocks match the size of real content cards. | `[ ]` |
| **ST-02** | Main Metrics Ribbon | Stats are loaded. | 1. Look at the top stats row of numbers. | Star counts, commit totals, pull requests, and followers show correctly with corresponding lucide icons. | `[ ]` |
| **ST-03** | Contribution Calendar Grid | Stats are loaded. | 1. Check the 53-week calendar layout.<br>2. Observe month labels and grid colors. | - Calendar fits responsive width.<br>- Color intensity matches contributions (faded violet to bright fuchsia).<br>- Month headers (Jan, Feb...) align with columns. | `[ ]` |
| **ST-04** | PR & Issue Metric Widgets | Stats are loaded. | 1. Check circular charts or bar breakdowns. | Pull request stats (open/closed/merged) and issues (opened/closed/close duration) display correct totals. | `[ ]` |
| **ST-05** | Repository Rankings | Stats are loaded. | 1. Review the ranked repositories section. | Most Starred, Most Forked, and Largest repositories list descriptions, star count, fork counts, and links. | `[ ]` |

---

## 5. Profile Card Customization

Verify that the Profile Card configuration and SVG output respond accurately to style customization adjustments.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PC-01** | Preview Tab Switching | Card Preview page is loaded (`/dashboard/cards`). | 1. Toggle between the "Preview", "Embed Code", and "Source Code" tabs on the Profile Card. | - Preview tab shows rendered SVG image.<br>- Embed tab shows copy blocks.<br>- Source tab shows raw XML text block. | `[ ]` |
| **PC-02** | Target User/Repo Apply | User updates target options. | 1. Change username input to `Ramsingh4656`.<br>2. Click "Apply Targets". | - Target update alert confirms target change.<br>- Profile card fetches new SVG layout for `Ramsingh4656`. | `[ ]` |
| **PC-03** | Theme Selection (Presets) | Preview page is loaded. | 1. Click "Nord Arctic" theme preset.<br>2. Click "Dracula Classic" theme preset. | - Accent dots, borders, and SVGs instantly update to reflect Nord or Dracula palettes.<br>- Parameter `theme=nord` or `theme=dracula` is added to SVG URL query. | `[ ]` |
| **PC-04** | Custom Accent Color Swatch | Preview page is loaded. | 1. Click the Emerald color circle.<br>2. Open color-picker and set `#E02424` (Ruby). | - Selected swatch updates card SVG accent components (e.g. icon fills, accents).<br>- Query parameter includes `accent=E02424`. | `[ ]` |
| **PC-05** | Custom Background Swatch | Preview page is loaded. | 1. Click the Charcoal (`#121212`) background circle.<br>2. Open background color picker and set `#090D16`. | - Card background matches the customized color.<br>- Query parameter includes `background=090D16`. | `[ ]` |
| **PC-06** | Border Radius Slider | Preview page is loaded. | 1. Drag the border radius slider from 10px to 0px.<br>2. Drag the slider to 24px. | - Card corners change to fully square or highly rounded.<br>- SVG URL has `border_radius=0` or `border_radius=24`. | `[ ]` |
| **PC-07** | Hide Border Switch | Preview page is loaded. | 1. Click the "Hide Card Border" toggle. | - Card boundary border line disappears from preview.<br>- Query parameter has `hide_border=true`. | `[ ]` |
| **PC-08** | Font Style Selector | Preview page is loaded. | 1. Select "Developer Mono" from font dropdown. | Card typography switches to monospace font styling. | `[ ]` |
| **PC-09** | Action: Zoom Controls | Preview page is loaded. | 1. Click Zoom In/Out magnifying icons inside the preview pane.<br>2. Drag global zoom slider. | Card visual scale increases or decreases smoothly without clipping. | `[ ]` |
| **PC-10** | Action: Copy & Download | Preview page is loaded. | 1. Under Embed tab, click "Copy Markdown".<br>2. Click "Download" to save the SVG. | - Toast/check badge says "Copied". Clipboard has markdown format.<br>- Browser triggers download of `{username}-profile-card.svg`. | `[ ]` |

---

## 6. Streak Card Customization

Verify that the Streak widget updates correctly and maintains styling controls.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SC-01** | Streak Stats Loading | Card Preview page is loaded. | 1. View the Streak Card section. | Shows contribution numbers, current streak value, and longest streak numbers with flame icons. | `[ ]` |
| **SC-02** | Styling Sync | User is changing colors or themes. | 1. Apply Nord theme and change border radius slider to 16px. | Streak Card preview updates colors and corners matching the settings automatically. | `[ ]` |
| **SC-03** | Embed Copying (HTML/Markdown) | Preview page is loaded. | 1. Switch to Embed Code tab on Streak Card.<br>2. Click "Copy HTML". | Clipboard gets HTML structure: `<img src=".../streak.svg?..." alt="..." />`. | `[ ]` |

---

## 7. Language Card Customization

Verify language stats presentation and language limit thresholds.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **LC-01** | Language Colors Mapping | Card Preview page is loaded. | 1. Verify TypeScript, JavaScript, CSS labels. | - Text colors and circular swatches match language definitions (TypeScript=Blue, JS=Yellow). | `[ ]` |
| **LC-02** | Limit Sizing Slider | Card Preview page is loaded. | 1. Drag the "Languages Count" slider to `3`.<br>2. Drag the slider to `8`. | - Card visual lists only top 3 languages.<br>- URL query has `langs_count=3` or `langs_count=8`. | `[ ]` |
| **LC-03** | Scroll / Layout Adaptability | Preview page is loaded. | 1. Inspect the layout with custom dimensions. | Card elements rearrange smoothly without overlay overlaps. | `[ ]` |

---

## 8. Repository Card Customization

Verify target repository matching, fork metrics, and licenses.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **RC-01** | Target Repository Swap | Card Preview page is loaded. | 1. Change repository input in Target Config to `react-dashboard-boilerplate`.<br>2. Click Apply Targets. | - Repository Card updates contents to display statistics for `react-dashboard-boilerplate`. | `[ ]` |
| **RC-02** | Invalid Repo Handling | Stats fails or repository does not exist. | 1. Change repository input to `invalid-repo-12345`. | Card preview shows clear error message: "Failed to load card (404 Not Found)" or fallback layout. | `[ ]` |
| **RC-03** | License & Status Badges | Repository has a LICENSE file. | 1. Preview GitProfileStats repository. | Card shows license type (e.g. MIT) along with star/fork statistics. | `[ ]` |

---

## 9. Markdown README Generator

Verify that the unified Markdown README Generator builds correct markdown based on checkboxes and layout selections.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **MG-01** | Enable/Disable Cards | User scroll to "GitHub README Markdown Generator". | 1. Check and uncheck cards in the checkbox selection list (Profile, Stats, Streak, Languages). | - Live markdown text block updates instantly.<br>- Disabling all cards prints fallback comment: `<!-- No cards selected... -->`. | `[ ]` |
| **MG-02** | Vertical Layout Generator | Layout selected is "Vertical Stack". | 1. Select "Vertical Stack".<br>2. Observe output code block. | Markdown shows consecutive markdown image tags stacked vertically: `[![Profile Card](url)](href)\n\n[![Stats Card](url)](href)`. | `[ ]` |
| **MG-03** | Centered Layout Generator | Layout selected is "Centered". | 1. Select "Centered Layout". | Markdown prints HTML paragraph aligning images center: `<p align="center">\n  <a href="...">\n    <img src="..." />\n  </a>\n</p>`. | `[ ]` |
| **MG-04** | Grid Layout Generator | Layout selected is "Grid/Dashboard". | 1. Select "Grid/Dashboard Layout". | Profile Card sits at top center, while Stats, Languages, and Streak cards group side-by-side in grid tags. | `[ ]` |
| **MG-05** | Custom API Host Override | User wants custom domains. | 1. Edit the "API Base URL Host" input to `https://my-custom-api.com`. | All card URLs inside the generated markdown change base domain to `https://my-custom-api.com`. | `[ ]` |
| **MG-06** | Copy README Code Action | Layout is configured. | 1. Click "Copy README Markdown" button. | - Button text changes to "Copied!" for 2 seconds.<br>- Paste block into markdown editor works without indentation or formatting errors. | `[ ]` |

---

## 10. Theme Gallery & Switcher

Verify that the theme comparison grid, card selector, and default theme save actions operate correctly.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TG-01** | Card Type Switcher | User is on `/dashboard/themes`. | 1. Click through card selector tabs (Profile, Stats, Languages, Streak, Repository). | Comparison previews for all themes change instantly to reflect the chosen card type. | `[ ]` |
| **TG-02** | Save Default Theme (Apply) | User is logged in. | 1. Click "Apply Theme" on "Dracula Classic" or "Nord Arctic". | - Button enters loading state with spin icon.<br>- PUT request sent to `/api/v1/users/settings`.<br>- Success toast notification popup: "Preferred theme updated to dracula/nord!".<br>- Active status badge updates. | `[ ]` |
| **TG-03** | Color Palette Swatches | Previews are loaded. | 1. Hover over theme color circles at the bottom of a theme container. | Tooltips show accurate hex codes (e.g. `bg:#0d1117`, `accent:#58a6ff`). | `[ ]` |
| **TG-04** | Gallery Actions | Previews are loaded. | 1. Click "Markdown" copy button.<br>2. Click "Download" button on a specific theme card. | - Success check icon shows on copying.<br>- Raw SVG file downloads successfully containing theme color specifications. | `[ ]` |

---

## 11. Mobile Sizing & Interactions

Verify responsive designs, drawers, touch inputs, and layout behavior on mobile viewports.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **MB-01** | Hamburger Menu Toggle | Viewport width is < 768px (Mobile/Tablet). | 1. Click the hamburger icon in the header.<br>2. Click the X close button. | - Sidebar menu slides open from the left side.<br>- Close button successfully closes drawer. | `[ ]` |
| **MB-02** | Sidebar Backdrop Dismissal | Mobile menu drawer is open. | 1. Tap anywhere on the dark backdrop overlay outside the drawer. | Drawer slides closed instantly. | `[ ]` |
| **MB-03** | Mobile Metrics Grid Columns | Viewport width is < 768px. | 1. Inspect the main metrics on the dashboard `/dashboard`. | Overview cards stack in a 2-column layout rather than 4-column desktop layout. | `[ ]` |
| **MB-04** | Responsive Layout Scrolling | Viewport width is < 480px. | 1. Navigate to `/dashboard/cards` or `/dashboard/themes`.<br>2. Check for horizontal overflows. | - Previews scale down to fit container or wrap inside scroll regions.<br>- Main document viewport scroll is purely vertical (no horizontal scrollbar). | `[ ]` |
| **MB-05** | Tap Target Areas | Mobile viewport is active. | 1. Tap navigation links, toggles, and sliders with fingers. | Buttons, switches, and sliders are easily pressable and have sufficient touch padding (> 44x44px). | `[ ]` |

---

## 12. Desktop Layout & Aesthetics

Verify premium aesthetics, desktop menus, hover behaviors, and overall styling.

| Test ID | Test Case Title | Preconditions | Step-by-Step Instructions | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DK-01** | Desktop Layout Structure | Viewport is >= 1024px. | 1. Inspect dashboard sidebar and header. | - Sidebar sits fixed on left with crisp border lines.<br>- Main content fills remaining space with proper inner padding. | `[ ]` |
| **DK-02** | Hover micro-animations | Viewport is >= 1024px. | 1. Hover mouse cursor over: nav links, buttons, theme buttons, and copy icons. | - Subtle scale transformations, color transitions, or translation shifts occur.<br>- Transition animations feel smooth (no jitter). | `[ ]` |
| **DK-03** | Profile Dropdown Selector | Viewport is >= 1024px. | 1. Click quick profile dropdown in top-right header section. | Dropdown menu expands to reveal settings shortcuts or user username. | `[ ]` |
| **DK-04** | Glow & Mesh Grid Styling | Dark theme page is active. | 1. Observe background gradients and grid overlays. | - Elegant glow circles blur behind cards.<br>- Background pattern mesh grid aligns cleanly with borders. | `[ ]` |
