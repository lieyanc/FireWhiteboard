# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FireWhiteboard is a **fork of Excalidraw** that adds a dedicated **whiteboard mode** for classroom/teaching use. The UI is partially localized to Chinese. It is a monorepo built with Yarn workspaces.

## Development Commands

Requires Node >= 18. Uses Yarn 1.x workspaces.

```bash
yarn start              # Start dev server (port 3000)
yarn build              # Production build
yarn test:typecheck     # TypeScript type checking (tsc)
yarn test:update        # Run all tests with snapshot updates
yarn test:app           # Run vitest (interactive watch mode)
yarn test:app --watch=false          # Run tests once
yarn test:app -- path/to/file.test   # Run a single test file
yarn test:code          # ESLint (--max-warnings=0)
yarn test:all           # Full suite: typecheck + lint + prettier + tests
yarn fix                # Auto-fix formatting (prettier) and linting (eslint)
yarn fix:code           # Fix eslint only
yarn fix:other          # Fix prettier only
yarn build:packages     # Build all internal packages (common -> math -> element -> excalidraw)
yarn clean-install      # Reset node_modules and reinstall
```

## Project Structure

```
excalidraw-app/         # Web application (entry point, collab, Firebase integration)
  App.tsx               # ExcalidrawWrapper - top-level app with collab, scene init, build toast
  appState.ts           # Fork defaults: whiteboardMode=true, freedrawSmoothingEnabled=false
  components/AppMainMenu.tsx  # App menu with whiteboard controls (smoothing toggle, scale sliders)
packages/
  excalidraw/           # Core React component library (@excalidraw/excalidraw)
    components/App.tsx  # Main App class component (~8000 lines, central state + event handling)
    components/LayerUI.tsx  # UI overlay layer (toolbars, dialogs, panels)
    components/WhiteboardToolbar.tsx + .scss  # Simplified bottom toolbar (Chinese labels)
    components/WhiteboardOnboardingDialog.tsx + .scss  # Fullscreen prompt on first activation
    components/Actions.tsx  # ZoomActions with conditional zoom lock control
    components/footer/Footer.tsx  # Page nav (left/right) replaces help button in WB mode
    components/main-menu/DefaultItems.tsx  # ToggleWhiteboardMode menu item
    actions/            # Action system (registered actions modify appState/elements)
    actions/actionWhiteboardMode.ts  # Toggle action with smart smoothing default
    actions/actionCanvas.tsx  # toggleZoomLock action (WB-mode only)
    appState.ts         # Default AppState + storage config per field
    types.ts            # Core types: AppState, ToolType, ExcalidrawProps, etc.
  element/              # Element creation, mutation, rendering, hit-testing
    src/shape.ts        # Freedraw stroke generation (smoothing: 0 when disabled)
    src/newElement.ts   # newFreedrawElement with freedrawSmoothingEnabled flag
    src/types.ts        # ExcalidrawFreeDrawElement.freedrawSmoothingEnabled
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

## Fork-Specific Changes

This fork has 9 commits on top of upstream Excalidraw (from `fa5e19f2` onward). All changes are by `lieyan`/`lieyanc`.

### 1. Whiteboard Mode Core

Toggled via `appState.whiteboardMode`. Key action: `actionToggleWhiteboardMode` in `actions/actionWhiteboardMode.ts`.

**When whiteboard mode activates:**
- Hides standard toolbar (shapes section), selected shape actions panel, and default sidebar trigger
- Shows `WhiteboardToolbar` at the bottom of the screen
- Shows `WhiteboardOnboardingDialog` prompting fullscreen (unless already fullscreen)
- Replaces help button in footer with page left/right navigation buttons
- Hides collab UI in top-right (shows only collab errors)
- Locks zoom by default (`appState.zoomLocked`)

**WhiteboardToolbar layout** (3 sections separated by dividers):
1. **Colors**: Inline stroke colors (5 swatches, clicking auto-switches to pen tool) + background color popover (10 colors)
2. **Tools**: Hand (平移), Freedraw (画笔), Eraser (橡皮) + "More" dropdown (selection, rectangle, diamond, ellipse, arrow, line, text, image)
3. **Properties**: Stroke width (3 presets + slider 0.5–4) + Opacity (20%/50%/100% presets)

**WhiteboardOnboardingDialog**: Shows on mode activation when not in fullscreen. Two buttons: dismiss ("稍后再说") or enter fullscreen ("进入全屏"). Auto-dismisses when fullscreen is entered via `fullscreenchange` event.

### 2. Freedraw Smoothing Control

Per-element `freedrawSmoothingEnabled?: boolean` flag on `ExcalidrawFreeDrawElement` (`packages/element/src/types.ts`).

**Data flow:**
1. `appState.freedrawSmoothingEnabled` — app-level setting (optional, `undefined` = use default `true`)
2. `App.tsx:8278` — passes the flag to `newFreedrawElement()` when creating strokes
3. `newElement.ts:457` — only sets the flag on the element when explicitly `false`
4. `shape.ts:1062` — reads `element.freedrawSmoothingEnabled ?? true`; when `false`, sets `smoothing: 0` and `streamline: 0` in `getStroke()` call

**Smart default**: When entering whiteboard mode for the first time (`freedrawSmoothingEnabled === undefined`), the action automatically sets it to `false`. If the user previously set it explicitly, their preference is preserved.

**Toggle UI**: In `AppMainMenu.tsx` — shows "开启/关闭笔迹预测/抖动修复" menu item only when whiteboard mode is active.

### 3. Zoom Lock

`appState.zoomLocked` (default `true`) prevents touch pinch-zoom in whiteboard mode.

- `App.tsx:6262` — `isTouchZoomLocked` check: when `whiteboardMode && zoomLocked && isTouchScreenMultiTouchGesture()`, forces `scaleFactor = 1`
- `Actions.tsx:1283` — zoom lock button renders only when `appState.whiteboardMode`
- `actionCanvas.tsx` — `actionToggleZoomLock` registered action with `PanelComponent` that returns `null` outside whiteboard mode

### 4. CSS Scaling System

Three independent scale factors for whiteboard UI elements, controlled via CSS custom properties set in `App.tsx:1939`:

| AppState field | CSS property | Applied to | Default |
|---|---|---|---|
| `whiteboardToolbarScale` | `--whiteboard-toolbar-scale` | `.whiteboard-toolbar-scale` wrapper | 1 |
| `whiteboardSideControlsScale` | `--whiteboard-side-controls-scale` | `.whiteboard-side-controls` (zoom buttons) | 1 |
| `whiteboardPageNavScale` | `--whiteboard-page-nav-scale` | `.whiteboard-page-nav` (page left/right) | 1 |

All clamped to 0.6–2.0 range. Color controls get additional `--whiteboard-color-scale: 1.5` for larger touch targets. Scale sliders available in `AppMainMenu.tsx` when whiteboard mode is active.

### 5. Theme Color Change

Primary color changed from Excalidraw's `#6965db` to `#018eee` (blue) across all CSS variables in `packages/excalidraw/css/theme.scss` — both light and dark mode variants.

### 6. Build Info Toast

`excalidraw-app/vite.config.mts` injects git metadata (SHA, branch, repo, build time) via `define`. `excalidraw-app/App.tsx` shows a styled toast with this info on startup. CSS in `excalidraw-app/index.scss`.

### 7. App-Level Defaults

`excalidraw-app/appState.ts` — new file that overrides upstream defaults:
- `whiteboardMode: true` (app starts in whiteboard mode)
- `freedrawSmoothingEnabled: false` (smoothing off by default)

`getInitialFireWhiteboardAppState()` merges these defaults with localStorage state during `initializeScene()`.

### 8. Other Changes

- **Socials**: Replaced Excalidraw GitHub/Twitter/Discord links with FireWhiteboard GitHub URL in `DefaultItems.tsx` and command palette
- **Library sidebar**: Added direct toggle in `AppMainMenu.tsx`
- **Share/Encryption links**: Shown in app menu only during whiteboard mode
- **UIOptions API**: `formFactor` prop replaced with `getFormFactor(editorWidth, editorHeight)` callback; `desktopUIMode` prop removed from `UIOptions`
- **renderTopRightUI**: Now receives `appState` as second parameter; hides collab trigger in whiteboard mode
- **restore.ts**: `repairBinding()` wrapped in try/catch for robustness
- **App.tsx:10088**: Changed `isBindingElement` check to `isLinearElement` in pointer-up finalization

### 9. AppState Fields Summary

All whiteboard fields persist to browser localStorage only (`export: false, server: false`):

| Field | Type | Default | Description |
|---|---|---|---|
| `whiteboardMode` | `boolean` | `false` | Toggle whiteboard UI |
| `freedrawSmoothingEnabled` | `boolean?` | `undefined` | Stroke smoothing (undefined = default true) |
| `zoomLocked` | `boolean` | `true` | Prevent touch zoom |
| `whiteboardToolbarScale` | `number` | `1` | Toolbar scale |
| `whiteboardSideControlsScale` | `number` | `1` | Side controls scale |
| `whiteboardPageNavScale` | `number` | `1` | Page nav scale |

### 10. Tests

- `tests/actionWhiteboardMode.test.ts` — Tests smart smoothing default: entering WB mode sets `freedrawSmoothingEnabled: false` when undefined, preserves explicit setting
- `tests/whiteboardToolbar.test.tsx` — Tests color swatch click auto-switches to freedraw tool
- `tests/data/restore.test.ts` — Added whiteboard/freedraw-related restore tests

### 11. Localization

Added i18n keys in both `en.json` and `zh-CN.json`:
- `buttons.whiteboardMode` / `buttons.lockZoom` / `buttons.unlockZoom`
- `buttons.enableStrokeStabilization` / `buttons.disableStrokeStabilization`
- `whiteboardOnboarding.title` / `.description` / `.dismiss` / `.enterFullscreen`
- `errors.cannotEnterFullscreen`
- WhiteboardToolbar uses hardcoded Chinese: 画笔, 橡皮, 平移, 线条, 填充, 粗细, 透明, 更多

## Coding Conventions

- TypeScript for all new code; strict mode enabled
- Functional React components with hooks; CSS modules for styling
- PascalCase for components/interfaces/types, camelCase for variables/functions, ALL_CAPS for constants
- Prefer performant, allocation-free implementations
- Use `const`/`readonly` where possible; use `?.` and `??` operators
- After modifications, run `yarn test:app` and fix reported issues
