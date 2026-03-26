import {
  clearAppStateForLocalStorage,
  getDefaultAppState,
} from "@excalidraw/excalidraw/appState";

import type { AppState } from "@excalidraw/excalidraw/types";

type InitialAppState = Omit<
  AppState,
  "width" | "height" | "offsetLeft" | "offsetTop"
>;

export const getDefaultFireWhiteboardAppState = (): InitialAppState => ({
  ...getDefaultAppState(),
  whiteboardMode: true,
  freedrawSmoothingEnabled: false,
});

export const getLocalAppStateWithWhiteboardDefaults = (
  appState?: Partial<AppState> | null,
): InitialAppState => {
  const nextAppState: InitialAppState = {
    ...getDefaultFireWhiteboardAppState(),
    ...(appState ? clearAppStateForLocalStorage(appState) : {}),
  };

  if (
    appState?.freedrawSmoothingEnabled === undefined &&
    !nextAppState.whiteboardMode
  ) {
    const {
      freedrawSmoothingEnabled: _freedrawSmoothingEnabled,
      ...appStateWithoutSmoothing
    } = nextAppState;

    return appStateWithoutSmoothing;
  }

  return nextAppState;
};

export const getInitialFireWhiteboardAppState = ({
  appState,
  width,
  height,
  offsetLeft,
  offsetTop,
}: {
  appState?: Partial<AppState> | null;
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}): AppState => {
  const initialAppState = appState ?? getDefaultFireWhiteboardAppState();

  return {
    ...getDefaultAppState(),
    ...initialAppState,
    width,
    height,
    offsetLeft,
    offsetTop,
  };
};
