import { CaptureUpdateAction } from "@excalidraw/element";

import { actionToggleWhiteboardMode } from "../actions/actionWhiteboardMode";
import { getDefaultAppState } from "../appState";

import type { AppState } from "../types";

const createAppState = (appState: Partial<AppState>): AppState => ({
  ...getDefaultAppState(),
  width: 0,
  height: 0,
  offsetTop: 0,
  offsetLeft: 0,
  ...appState,
});

describe("actionToggleWhiteboardMode", () => {
  it("disables stroke stabilization when entering whiteboard mode by default", () => {
    const result = actionToggleWhiteboardMode.perform(
      [],
      createAppState({
        whiteboardMode: false,
      }),
    );

    expect(result.captureUpdate).toBe(CaptureUpdateAction.EVENTUALLY);
    expect(result.appState).toMatchObject({
      whiteboardMode: true,
      freedrawSmoothingEnabled: false,
    });
  });

  it("preserves an explicit smoothing preference when entering whiteboard mode", () => {
    const result = actionToggleWhiteboardMode.perform(
      [],
      createAppState({
        whiteboardMode: false,
        freedrawSmoothingEnabled: true,
      }),
    );

    expect(result.appState).toMatchObject({
      whiteboardMode: true,
      freedrawSmoothingEnabled: true,
    });
  });
});
