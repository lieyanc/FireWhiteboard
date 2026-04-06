# AGENTS.md
FireWhiteboard is a classroom-focused fork of Excalidraw.
This guide is for coding agents working in this repository. Focus first on the fork-specific whiteboard path, then on upstream Excalidraw conventions.
If instructions conflict, follow direct user, system, or developer instructions first.
## Rules Files And Context
- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- `.github/copilot-instructions.md` exists and is incorporated below.
- Package manager: `yarn@1.22.22`.
- Required Node version: `>=18`.
- Monorepo layout: `excalidraw-app/`, `packages/excalidraw/`, `packages/element/`, `packages/math/`, `packages/common/`, `packages/utils/`.
- Respect package direction: `common <- math <- element <- excalidraw <- excalidraw-app`.
- Prefer workspace aliases from `tsconfig.json` over deep cross-package relative imports.
## Fork-First Working Model
- This repo's main fork change is `appState.whiteboardMode`.
- FireWhiteboard app startup defaults now enter whiteboard mode immediately; do not assume the app boots into the normal Excalidraw editor path.
- If a task touches toolbar, footer, zoom, onboarding, free draw, or classroom UX, inspect the whiteboard path first.
- Whiteboard mode is not just a visual theme; it swaps major UI surfaces and interaction rules.
- Preserve whiteboard-specific Chinese labels unless the task explicitly changes localization.
- Do not assume upstream Excalidraw behavior is still correct in whiteboard mode.
- Before editing shared UI, search for `whiteboardMode`, `zoomLocked`, and `freedrawSmoothingEnabled`.
- When adding new teaching-mode behavior, prefer gating it behind whiteboard mode instead of changing the default editor path.
## Whiteboard File Map
- `packages/excalidraw/actions/actionWhiteboardMode.ts`: toggle action for entering and leaving whiteboard mode; entering whiteboard mode also disables smoothing if no explicit preference exists.
- `packages/excalidraw/components/LayerUI.tsx`: decides which UI is hidden or shown in whiteboard mode.
- `packages/excalidraw/components/WhiteboardToolbar.tsx`: simplified toolbar used in whiteboard mode.
- `packages/excalidraw/components/WhiteboardToolbar.scss`: whiteboard toolbar layout and scaling behavior.
- `packages/excalidraw/components/WhiteboardOnboardingDialog.tsx`: fullscreen onboarding dialog shown on first whiteboard entry.
- `packages/excalidraw/components/Actions.tsx`: whiteboard zoom-lock control lives in the zoom actions area.
- `packages/excalidraw/components/footer/Footer.tsx`: whiteboard page navigation replaces the normal help button.
- `excalidraw-app/components/AppMainMenu.tsx`: whiteboard menu items, stroke stabilization toggle, and scale sliders.
- `packages/excalidraw/appState.ts`: base editor defaults and storage policy for whiteboard-specific fields.
- `excalidraw-app/appState.ts`: FireWhiteboard startup defaults and browser-state normalization for whiteboard mode.
- `excalidraw-app/data/localStorage.ts`: rehydrates local app state through FireWhiteboard's whiteboard-aware defaults helper.
- `packages/excalidraw/components/App.tsx`: injects whiteboard CSS variables and enforces some whiteboard input behavior.
- `packages/element/src/shape.ts`: free draw smoothing behavior changes when whiteboard stabilization is disabled.
## Whiteboard Behavior Map
- In desktop whiteboard mode, `LayerUI.tsx` hides the standard shapes toolbar.
- In desktop whiteboard mode, `LayerUI.tsx` hides selected shape actions.
- In desktop whiteboard mode, `LayerUI.tsx` renders `WhiteboardToolbar` instead.
- `WhiteboardToolbar.tsx` promotes three primary tools with Chinese labels: `hand`, `freedraw`, `eraser`.
- Secondary tools move into a `more` dropdown: selection, rectangle, diamond, ellipse, arrow, line, text, image.
- Whiteboard toolbar exposes inline stroke colors, fill selection, stroke width presets plus slider, and opacity presets.
- Clicking an inline stroke color in `WhiteboardToolbar.tsx` updates `currentItemStrokeColor` and auto-switches the active tool to `freedraw`.
- `WhiteboardToolbar.scss` scales the color controls up relative to the rest of the toolbar via `--whiteboard-color-scale`.
- `Footer.tsx` keeps zoom controls but wraps them in scaled whiteboard side controls.
- `Footer.tsx` replaces the normal help button with left and right page navigation buttons in whiteboard mode.
- `actionCanvas.tsx` only shows the zoom-lock toggle when `appState.whiteboardMode` is true.
- `App.tsx` disables pinch-to-zoom scaling during touch multitouch when whiteboard mode is on and `zoomLocked` is true.
- `App.tsx` writes `--whiteboard-toolbar-scale`, `--whiteboard-side-controls-scale`, and `--whiteboard-page-nav-scale` CSS variables.
- `LayerUI.scss` applies those scale variables to footer side controls and page navigation.
## Whiteboard State And Persistence
- Whiteboard-related `AppState` fields include `whiteboardMode`, `zoomLocked`, `freedrawSmoothingEnabled`, `whiteboardToolbarScale`, `whiteboardSideControlsScale`, and `whiteboardPageNavScale`.
- Base editor defaults in `packages/excalidraw/appState.ts`: `whiteboardMode` is `false`, `zoomLocked` is `true`, and the three scale values default to `1`.
- FireWhiteboard startup defaults in `excalidraw-app/appState.ts`: `whiteboardMode` is `true` and `freedrawSmoothingEnabled` is `false`.
- These fields are browser-persisted but not exported to files and not synced to server state.
- If you add new whiteboard-only UI state, match this storage pattern unless there is a strong reason not to.
- `freedrawSmoothingEnabled` is app-level UI state, but free draw elements also carry an element-level flag when smoothing is explicitly disabled.
- `getLocalAppStateWithWhiteboardDefaults()` only forces `freedrawSmoothingEnabled: false` when whiteboard mode is active; if whiteboard mode is off and no explicit preference was saved, smoothing stays unset.
- `getInitialFireWhiteboardAppState()` applies FireWhiteboard defaults at app boot, then overlays restored browser state and viewport metrics.
- `newFreeDrawElement()` only stores `freedrawSmoothingEnabled: false` when smoothing is off.
- `restore.ts` preserves that element-level `false` value on import/restore.
- `shape.ts` maps disabled stabilization to `smoothing: 0` and `streamline: 0`.
- `actionToggleWhiteboardMode` preserves an explicit smoothing preference when entering whiteboard mode; it only defaults smoothing off when the preference is currently undefined.
## Whiteboard Onboarding And Fullscreen
- Entering whiteboard mode triggers onboarding if the document is not already fullscreen.
- Onboarding visibility is managed in `LayerUI.tsx`, not inside the toolbar.
- `WhiteboardOnboardingDialog.tsx` asks the user to enter fullscreen for teaching/presenting.
- If fullscreen is entered successfully, the dialog is dismissed.
- `fullscreenchange` listeners in `LayerUI.tsx` keep onboarding state in sync.
- Fullscreen failure reports through `appState.errorMessage` using localized strings.
- If you change whiteboard entry flow, keep onboarding, dismissal, and fullscreen failure handling aligned.
## Commands
Run commands from the repository root unless there is a clear package-local reason not to.
```bash
# Development
yarn start
yarn start:production

# Builds
yarn build
yarn build:app
yarn build:preview
yarn build:packages
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw

# Validation
yarn test:typecheck
yarn test:code
yarn test:other
yarn test:all

# Tests
yarn test:app
yarn test:app --watch=false
yarn test:update
yarn test:coverage
yarn test:ui

# Fixes
yarn fix
yarn fix:code
yarn fix:other
```
## Single-Test Recipes
Use root-relative test paths.
```bash
yarn test:app --watch=false packages/excalidraw/components/Trans.test.tsx
yarn test:app -- packages/excalidraw/components/Trans.test.tsx
yarn test:app --watch=false packages/excalidraw/components/Trans.test.tsx -t "should translate the the strings correctly"
```
- `yarn test:update` runs app tests once with snapshot updates enabled; `yarn test:all` runs typecheck, lint, formatting check, and tests.
- Start with the narrowest relevant command, then widen coverage if the change touches shared behavior.
- For whiteboard-only UI work, a quick `yarn start` sanity check is often useful after tests pass.
## Code Style And Conventions
- `.editorconfig` enforces UTF-8, LF line endings, 2-space indentation, final newline, and trimmed trailing whitespace.
- Prettier config comes from `@excalidraw/prettier-config`.
- ESLint is the primary fixer for `js`, `ts`, and `tsx` files; Prettier is used directly for `css`, `scss`, `json`, `md`, `html`, and `yml` files.
- Match the existing codebase style: semicolons, double quotes, and trailing commas are standard.
- Favor small, local edits over broad style churn.
- Group imports as builtin, external, internal alias, parent or sibling or index, then type-only imports.
- Leave blank lines between import groups.
- Use `import type` for type-only imports and keep them separate from value imports.
- Do not import from `jotai` directly.
- Use `editor-jotai` in `packages/excalidraw` and `app-jotai` in `excalidraw-app`.
- Write all new code in TypeScript.
- The root `tsconfig.json` uses `strict: true`; keep changes strict-safe and prefer `const`, `readonly`, and immutable update patterns.
- Prefer existing shared types, discriminated unions, and utility types over broad ad hoc objects.
- Use optional chaining (`?.`) and nullish coalescing (`??`) where they improve clarity.
- Avoid `any`; if unavoidable, keep it narrow and explain why.
- For math-related code, use `Point` from `packages/math/src/types.ts` instead of raw `{ x, y }` objects.
- Prefer helpers such as `pointFrom()` from `@excalidraw/math` when constructing points.
- Use `assertNever()` for exhaustive handling of unions and variants.
- Use PascalCase for components, classes, interfaces, and type aliases; camelCase for variables, functions, hooks, and methods; ALL_CAPS for constants and enum-like constant sets.
- Most editor UI styling is colocated `.scss`, not CSS modules; follow the local pattern of the file you touch.
## Testing And Verification
- Test runner is Vitest with `jsdom`; global setup is in `setupTests.ts`.
- That setup already mocks canvas APIs, fonts, IndexedDB, and `matchMedia`.
- Reuse `packages/excalidraw/tests/helpers/api.ts` and `packages/excalidraw/tests/helpers/ui.ts` for editor interaction tests.
- Many tests rely on `window.h` as a test hook exposing app state and elements.
- Prefer focused tests near the affected package before running the full suite.
- For recent whiteboard defaults and toolbar behavior, start with `excalidraw-app/tests/appState.test.ts`, `packages/excalidraw/tests/actionWhiteboardMode.test.ts`, and `packages/excalidraw/tests/whiteboardToolbar.test.tsx`.
- Update snapshots intentionally and only when the whiteboard UI change is expected.
- For whiteboard changes, verify both whiteboard mode and normal mode so upstream UI is not accidentally broken.
- If you touch persistence, check both app state defaults and restore behavior.
- If you touch toolbar, footer, or onboarding, manually inspect the desktop flow because whiteboard mode swaps whole UI surfaces.
## Agent Behavior From Copilot Instructions
- Be concise.
- Prefer code and direct answers over long explanations.
- Do not teach unless asked.
- Do not over-apologize when corrected; just fix the problem.
- Focus on implementation before narration.
- Fix reported problems instead of only describing them.
- After meaningful changes, validate with `yarn test:app` when practical.
- Read nearby code before introducing new patterns.
- Add or update tests for behavior changes.
- Leave unrelated user changes untouched.
