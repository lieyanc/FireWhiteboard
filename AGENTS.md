# Repository Guidelines

## Project Structure & Module Organization
`FireWhiteboard` is a Yarn 1 monorepo based on Excalidraw. The main web app lives in `excalidraw-app/` (`App.tsx`, `components/`, `collab/`, `data/`, `tests/`). Shared packages live in `packages/`: `common`, `math`, `element`, `utils`, and `excalidraw` (the core React library). Docs are in `dev-docs/`, demo integrations are in `examples/`, static assets are in `public/`, and build/release helpers are in `scripts/`.

## Build, Test, and Development Commands
Use Node 18+ and Yarn 1. Install once with `yarn`.

- `yarn start`: run the app locally with Vite on port 3000.
- `yarn build`: produce the production app bundle.
- `yarn build:packages`: rebuild internal packages in dependency order.
- `yarn test:app --watch=false`: run the Vitest suite once.
- `yarn test:all`: run typecheck, ESLint, Prettier checks, and tests.
- `yarn fix`: apply Prettier and ESLint autofixes.
- `yarn --cwd dev-docs start`: run the docs site on port 3003.

## Coding Style & Naming Conventions
Write new code in TypeScript. Follow the shared Prettier config and run `yarn fix` before opening a PR. Use PascalCase for React components and exported types, camelCase for variables/functions, and `.test.ts` or `.test.tsx` for tests. ESLint enforces import ordering and separate type imports; prefer `import type { Foo }` where applicable. Do not import `jotai` directly in app code; use the repo’s app-specific Jotai modules instead.

## Testing Guidelines
Tests run on Vitest with `jsdom`; shared setup is in `setupTests.ts`. Keep tests near the affected package or feature, typically under `tests/` or beside the source file. Update snapshots with `yarn test:update` only when the visual or serialized output change is intentional. Coverage thresholds are enforced in Vitest: 60% lines/statements, 70% branches, 63% functions. Add regression tests for bug fixes and whiteboard-mode behavior changes.

## Commit & Pull Request Guidelines
Recent history and CI expect semantic commit and PR titles such as `feat(whiteboard): polish toolbar swatches` or `fix(appState): preserve smoothing setting`. Preferred prefixes: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, and `revert`. PRs should include a short description, linked issue when relevant, screenshots/GIFs for UI changes, and notes on manual testing performed.
