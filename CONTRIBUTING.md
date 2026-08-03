# Contributing to GitProfileStats

We welcome contributions! This guide will help you get started and ensure a smooth collaboration process.

---

## 📦 Setup

1. **Fork the repository**
   - Click the **Fork** button at the top‑right of the repository page.
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your‑username>/GitProfileStats.git
   cd GitProfileStats
   ```
3. **Install dependencies**
   - This project uses **pnpm**. If you don't have it installed:
     ```bash
     npm i -g pnpm
     ```
   - Then install the required packages:
     ```bash
     pnpm install
     ```
4. **Configure environment variables**
   - Copy the example file and fill in your own values:
     ```bash
     cp .env.example .env
     ```
   - Ensure the API keys and URLs point to your development environment.
5. **Run the dev server**
   ```bash
   pnpm dev
   ```
   - The app should be available at `http://localhost:3000`.

---

## 🛠️ Development

- **Branching**: Create a new branch for each feature or bug fix.
  ```bash
  git checkout -b feature/your-feature-name
  ```
- **Testing**: The project includes a comprehensive manual testing checklist (`TESTING_CHECKLIST.md`). Follow it when adding new functionality.
- **Linting & Formatting**: The repository is configured with **ESLint** and **Prettier**. Run the lint script before committing:
  ```bash
  pnpm lint
  pnpm format
  ```
- **Commit messages**: Follow the **Conventional Commits** specification. Example:
  ```
  feat(stats): add language usage chart
  ```
- **Continuous Integration**: CI runs on every PR to ensure linting, type‑checking, and tests pass.

---

## ✍️ Coding Style

- **Language**: TypeScript (strict mode).
- **Styling**: Use the **Airbnb** style guide with the project's Prettier configuration. No trailing spaces, prefer single quotes, and use semicolons.
- **Naming**:
  - Components: `PascalCase` (e.g., `UserCard`).
  - Functions/variables: `camelCase`.
  - Constants: `UPPER_SNAKE_CASE`.
- **React**: Prefer functional components with hooks. Keep components small and reusable.
- **CSS**: Use **CSS Modules** or **styled‑components** as defined in the project. Avoid inline styles.
- **Accessibility**: Ensure all interactive elements have appropriate ARIA attributes and are keyboard navigable.

---

## 🔀 Pull Requests

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Open a Pull Request** against the `main` branch of the upstream repository.
3. **PR Description** should include:
   - A clear summary of the change.
   - Related issue numbers (e.g., `Closes #42`).
   - Any visual changes (screenshots or GIFs).
4. **Review Process**:
   - At least one maintainer must approve.
   - All CI checks must pass.
   - Resolve any requested changes before merging.
5. **Merging**: Once approved, the maintainer will **Squash and merge** to keep a clean history.

---

## 🐞 Issue Reporting

- **Check existing issues** before opening a new one.
- Use the provided issue templates:
  - **Bug Report** – includes steps to reproduce, expected vs. actual behavior, environment details, and screenshots.
  - **Feature Request** – describe the motivation, expected outcome, and any related resources.
- **Provide context**: Include OS, browser version, Node version, and any relevant logs.
- **Be concise** but thorough – the more information you give, the faster we can address it.

---

Thank you for your interest in contributing! 🎉
