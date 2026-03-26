# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FireWhiteboard is a **fork of Excalidraw** that adds a dedicated **whiteboard mode** for classroom/teaching use. The UI is partially localized to Chinese. It is a monorepo built with Yarn workspaces.

## Development Commands

```bash
yarn start              # Start dev server (port 3000)
yarn build              # Production build
yarn test:typecheck     # TypeScript type checking (tsc)
yarn test:update        # Run all tests with snapshot updates
yarn test:app           # Run vitest (interactive watch mode)
yarn test:app --watch=false          # Run tests once
yarn test:app -- path/to/file.test   # Run a single test file
yarn test:code          # ESLint (--max-warnings=0)
yarn fix                # Auto-fix formatting (prettier) and linting (eslint)
yarn fix:code           # Fix eslint only
yarn fix:other          # Fix prettier only
yarn build:packages     # Build all internal packages (common -> math -> element -> excalidraw)
```

## Project Structure

```
excalidraw-app/         # Web application (entry point, collab, Firebase integration)
packages/
  excalidraw/           # Core React component library (@excalidraw/excalidraw)
    components/App.tsx  # Main App class component (~8000 lines, central state + event handling)
    components/LayerUI.tsx  # UI overlay layer (toolbars, dialogs, panels)
    actions/            # Action system (registered actions modify appState/elements)
    appState.ts         # Default AppState + storage config per field
    types.ts            # Core types: AppState, ToolType, ExcalidrawProps, etc.
  element/              # Element creation, mutation, rendering, hit-testing
  common/               # Shared constants, utils, types (KEYS, colors, etc.)
  math/                 # Geometry primitives (Point, Line, Curve, etc.)
  utils/                # Export/import utilities
```

## Architecture

### State Management
- **AppState**: Class component state in `App.tsx` — the single source of truth for UI state. Defined in `packages/excalidraw/types.ts`, defaults in `packages/excalidraw/appState.ts`.
- **Elements**: Managed via `Scene` class. Element mutations use immutable patterns (copy-on-write).
- **Jotai**: Used for isolated editor-level atoms (`editor-jotai.ts`) and app-level atoms (`excalidraw-app/app-jotai.ts`). Not the primary state system.
- **Actions**: Registered via `register()` in `packages/excalidraw/actions/`. Each action has `perform()` returning new `{appState, elements}`. Managed by `ActionManager`.

### Package Dependencies (import direction)
`common` <- `math` <- `element` <- `excalidraw` <- `excalidraw-app`

Path aliases (e.g. `@excalidraw/element`) resolve to source via `tsconfig.json` paths and `vitest.config.mts` aliases. No build step needed for dev — imports go directly to source.

### Testing
- **Vitest** + **jsdom** + **@testing-library/react**
- Setup: `setupTests.ts` (mocks for canvas, fonts, IndexedDB, matchMedia)
- Test helpers: `packages/excalidraw/tests/helpers/api.ts` (element creation via `API`), `helpers/ui.ts` (simulated pointer/keyboard interactions via `UI`)
- `window.h` — test hook exposing `{app, state, elements}` for assertions
- Always use `packages/math/src/types.ts` Point type instead of `{ x, y }` in math-related code

## Fork-Specific: Whiteboard Mode

This fork's main addition is a **whiteboard mode** toggled via `appState.whiteboardMode`. Key files:

- `packages/excalidraw/actions/actionWhiteboardMode.ts` — Toggle action
- `packages/excalidraw/components/WhiteboardToolbar.tsx` + `.scss` — Simplified toolbar with Chinese labels (画笔/橡皮/平移), inline color swatches, stroke width slider, opacity presets
- `packages/excalidraw/components/WhiteboardOnboardingDialog.tsx` — Fullscreen prompt on first activation
- `packages/excalidraw/components/Actions.tsx` — Zoom lock control (`appState.zoomLocked`)
- `excalidraw-app/components/AppMainMenu.tsx` — Freedraw smoothing toggle (`appState.freedrawSmoothingEnabled`)

### Whiteboard Mode Behavior
- When active: hides the standard toolbar, shape actions panel, and some footer items; shows `WhiteboardToolbar` instead
- Locks zoom by default (`appState.zoomLocked`)
- CSS custom properties control scale: `--whiteboard-toolbar-scale`, `--whiteboard-side-controls-scale`, `--whiteboard-page-nav-scale`
- AppState fields: `whiteboardMode`, `zoomLocked`, `whiteboardToolbarScale`, `whiteboardSideControlsScale`, `whiteboardPageNavScale`, `freedrawSmoothingEnabled`
- Primary UI color changed to `#018eee`

### Freedraw Smoothing
Per-element `freedrawSmoothingEnabled` flag on `ExcalidrawFreeDrawElement`. When `false`, sets `smoothing: 0` and `streamline: 0` in stroke generation (`packages/element/src/shape.ts`).

## Coding Conventions

- TypeScript for all new code; strict mode enabled
- Functional React components with hooks; CSS modules for styling
- PascalCase for components/interfaces/types, camelCase for variables/functions, ALL_CAPS for constants
- Prefer performant, allocation-free implementations
- Use `const`/`readonly` where possible; use `?.` and `??` operators
- After modifications, run `yarn test:app` and fix reported issues
