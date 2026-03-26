import { CaptureUpdateAction } from "@excalidraw/element";

import { register } from "./register";

import type { AppState } from "../types";

export const actionToggleWhiteboardMode = register({
  name: "whiteboardMode",
  label: "buttons.whiteboardMode",
  keywords: ["whiteboard", "classroom", "teaching", "simple"],
  trackEvent: {
    category: "menu",
    action: "toggleWhiteboardMode",
    predicate: (appState) => !appState.whiteboardMode,
  },
  perform(elements, appState) {
    const nextWhiteboardMode = !appState.whiteboardMode;

    return {
      appState: {
        ...appState,
        whiteboardMode: nextWhiteboardMode,
        ...(nextWhiteboardMode &&
        appState.freedrawSmoothingEnabled === undefined
          ? { freedrawSmoothingEnabled: false }
          : {}),
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
  checked: (appState: AppState) => appState.whiteboardMode,
});
