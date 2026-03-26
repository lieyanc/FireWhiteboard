import {
  getInitialFireWhiteboardAppState,
  getLocalAppStateWithWhiteboardDefaults,
} from "../appState";

describe("whiteboard appState defaults", () => {
  it("enables whiteboard mode by default", () => {
    const appState = getLocalAppStateWithWhiteboardDefaults();

    expect(appState.whiteboardMode).toBe(true);
    expect(appState.freedrawSmoothingEnabled).toBe(false);
  });

  it("does not force smoothing off outside whiteboard mode", () => {
    const appState = getLocalAppStateWithWhiteboardDefaults({
      whiteboardMode: false,
    });

    expect(appState.whiteboardMode).toBe(false);
    expect(appState.freedrawSmoothingEnabled).toBeUndefined();
  });

  it("preserves an explicit smoothing preference", () => {
    const appState = getLocalAppStateWithWhiteboardDefaults({
      whiteboardMode: true,
      freedrawSmoothingEnabled: true,
    });

    expect(appState.freedrawSmoothingEnabled).toBe(true);
  });

  it("keeps smoothing unset when restoring normal mode without a saved preference", () => {
    const appState = getInitialFireWhiteboardAppState({
      appState: getLocalAppStateWithWhiteboardDefaults({
        whiteboardMode: false,
      }),
      width: 1280,
      height: 720,
      offsetLeft: 0,
      offsetTop: 0,
    });

    expect(appState.whiteboardMode).toBe(false);
    expect(appState.freedrawSmoothingEnabled).toBeUndefined();
  });
});
